import { movieAPI, youtubeAPI } from '../api.js';
import { formatDate, formatRuntime, generateStarRating, createYouTubeEmbedUrl } from '../utils.js';
import storage from '../storage.js';
import { showLoading, hideLoading, showError } from '../utils.js';

class Modal {
    constructor() {
        this.movieModal = document.getElementById('movie-modal');
        this.trailerModal = document.getElementById('trailer-modal');
        this.currentMovie = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close buttons
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => this.close());
        });

        // Close on outside click
        window.addEventListener('click', (e) => {
            if (e.target === this.movieModal) {
                this.close();
            }
            if (e.target === this.trailerModal) {
                this.closeTrailer();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
                this.closeTrailer();
            }
        });

        // Listen for custom events
        document.addEventListener('showMovieDetails', (e) => {
            this.showMovieDetails(e.detail.movieId);
        });

        document.addEventListener('playTrailer', (e) => {
            this.showTrailer(e.detail.movieId);
        });
    }

    async showMovieDetails(movieId) {
        try {
            showLoading();
            const [movieDetails, credits, recommendations] = await Promise.all([
                movieAPI.getMovieDetails(movieId),
                movieAPI.getMovieCredits(movieId),
                movieAPI.getMovieRecommendations(movieId)
            ]);

            this.currentMovie = movieDetails;
            this.renderMovieDetails(movieDetails, credits, recommendations);
            this.movieModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        } catch (error) {
            showError('Failed to load movie details');
            console.error('Show movie details error:', error);
        } finally {
            hideLoading();
        }
    }

    renderMovieDetails(movie, credits, recommendations) {
        const modalBody = this.movieModal.querySelector('.modal-body');
        const userRating = storage.getRating(movie.id);
        const isInWatchlist = storage.isInWatchlist(movie.id);

        modalBody.innerHTML = `
            <div class="modal-header">
                <div class="modal-poster">
                    <img src="${movieAPI.getImageUrl(movie.poster_path, 'w500')}" alt="${movie.title}">
                </div>
                <div class="modal-info">
                    <h2>${movie.title}</h2>
                    <div class="modal-meta">
                        <span class="release-date">${formatDate(movie.release_date)}</span>
                        <span class="runtime">${formatRuntime(movie.runtime)}</span>
                        <span class="rating">${generateStarRating(movie.vote_average / 2)}</span>
                        ${userRating ? `<span class="user-rating">Your Rating: ${userRating}/5</span>` : ''}
                    </div>
                    <p class="overview">${movie.overview}</p>
                    <div class="modal-actions">
                        <button class="play-trailer-btn">
                            <i class="fas fa-play"></i> Play Trailer
                        </button>
                        <button class="watchlist-btn ${isInWatchlist ? 'active' : ''}">
                            <i class="fas fa-${isInWatchlist ? 'check' : 'plus'}"></i>
                            ${isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        </button>
                        <div class="rating-stars">
                            ${this.generateRatingStars()}
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-content">
                <section class="cast-section">
                    <h3>Cast</h3>
                    <div class="cast-list">
                        ${this.renderCast(credits.cast)}
                    </div>
                </section>
                <section class="recommendations-section">
                    <h3>You May Also Like</h3>
                    <div class="recommendations-list">
                        ${this.renderRecommendations(recommendations.results)}
                    </div>
                </section>
            </div>
        `;

        this.setupModalEventListeners();
    }

    renderCast(cast) {
        return cast.slice(0, 6).map(actor => `
            <div class="cast-member">
                <img src="${actor.profile_path ? movieAPI.getImageUrl(actor.profile_path, 'w185') : 'path/to/default-avatar.jpg'}" 
                     alt="${actor.name}">
                <span class="actor-name">${actor.name}</span>
                <span class="character-name">${actor.character}</span>
            </div>
        `).join('');
    }

    renderRecommendations(recommendations) {
        return recommendations.slice(0, 4).map(movie => `
            <div class="recommendation-card" data-movie-id="${movie.id}">
                <img src="${movieAPI.getImageUrl(movie.poster_path, 'w185')}" alt="${movie.title}">
                <span class="movie-title">${movie.title}</span>
            </div>
        `).join('');
    }

    generateRatingStars() {
        const currentRating = storage.getRating(this.currentMovie.id) || 0;
        let starsHTML = '<div class="stars">';
        
        for (let i = 1; i <= 5; i++) {
            starsHTML += `
                <i class="fas fa-star ${i <= currentRating ? 'active' : ''}" 
                   data-rating="${i}"></i>
            `;
        }
        
        starsHTML += '</div>';
        return starsHTML;
    }

    setupModalEventListeners() {
        const modalBody = this.movieModal.querySelector('.modal-body');

        // Play trailer button
        const playTrailerBtn = modalBody.querySelector('.play-trailer-btn');
        playTrailerBtn.addEventListener('click', () => {
            this.showTrailer(this.currentMovie.id);
        });

        // Watchlist button
        const watchlistBtn = modalBody.querySelector('.watchlist-btn');
        watchlistBtn.addEventListener('click', () => {
            this.toggleWatchlist();
        });

        // Rating stars
        const stars = modalBody.querySelectorAll('.stars i');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                this.setRating(rating);
            });
        });

        // Recommendation cards
        const recommendationCards = modalBody.querySelectorAll('.recommendation-card');
        recommendationCards.forEach(card => {
            card.addEventListener('click', () => {
                const movieId = card.dataset.movieId;
                this.showMovieDetails(movieId);
            });
        });
    }

    async showTrailer(movieId) {
        try {
            showLoading();
            const [movieDetails, videos] = await Promise.all([
                movieAPI.getMovieDetails(movieId),
                movieAPI.getMovieVideos(movieId)
            ]);

            const trailer = videos.results.find(video => 
                video.type === 'Trailer' && video.site === 'YouTube'
            );

            if (trailer) {
                this.renderTrailer(trailer.key);
            } else {
                // If no trailer found in TMDB, try YouTube search
                const youtubeResults = await youtubeAPI.searchTrailer(movieDetails.title);
                if (youtubeResults.items && youtubeResults.items.length > 0) {
                    this.renderTrailer(youtubeResults.items[0].id.videoId);
                } else {
                    showError('No trailer found');
                }
            }
        } catch (error) {
            showError('Failed to load trailer');
            console.error('Show trailer error:', error);
        } finally {
            hideLoading();
        }
    }

    renderTrailer(videoId) {
        const trailerContainer = this.trailerModal.querySelector('.trailer-container');
        trailerContainer.innerHTML = `
            <iframe width="100%" 
                    height="500" 
                    src="${createYouTubeEmbedUrl(videoId)}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
            </iframe>
        `;
        this.trailerModal.style.display = 'block';
    }

    close() {
        this.movieModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    closeTrailer() {
        const trailerContainer = this.trailerModal.querySelector('.trailer-container');
        trailerContainer.innerHTML = '';
        this.trailerModal.style.display = 'none';
    }

    toggleWatchlist() {
        const watchlistBtn = this.movieModal.querySelector('.watchlist-btn');
        const isInWatchlist = storage.isInWatchlist(this.currentMovie.id);

        if (isInWatchlist) {
            storage.removeFromWatchlist(this.currentMovie.id);
            watchlistBtn.classList.remove('active');
            watchlistBtn.innerHTML = '<i class="fas fa-plus"></i> Add to Watchlist';
        } else {
            storage.addToWatchlist(this.currentMovie);
            watchlistBtn.classList.add('active');
            watchlistBtn.innerHTML = '<i class="fas fa-check"></i> Remove from Watchlist';
        }
    }

    setRating(rating) {
        storage.setRating(this.currentMovie.id, rating);
        
        // Update stars in modal
        const stars = this.movieModal.querySelectorAll('.stars i');
        stars.forEach(star => {
            const starRating = parseInt(star.dataset.rating);
            star.classList.toggle('active', starRating <= rating);
        });

        // Update user rating display
        const userRatingSpan = this.movieModal.querySelector('.user-rating');
        if (userRatingSpan) {
            userRatingSpan.textContent = `Your Rating: ${rating}/5`;
        } else {
            const modalMeta = this.movieModal.querySelector('.modal-meta');
            const newUserRating = document.createElement('span');
            newUserRating.className = 'user-rating';
            newUserRating.textContent = `Your Rating: ${rating}/5`;
            modalMeta.appendChild(newUserRating);
        }

        // Dispatch event to update movie card rating
        const event = new CustomEvent('updateMovieRating', {
            detail: { movieId: this.currentMovie.id, rating }
        });
        document.dispatchEvent(event);
    }
}

// Create and export modal instance
const modal = new Modal();
export default modal; 