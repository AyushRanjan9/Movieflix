import { movieAPI } from '../api.js';
import { formatDate, generateStarRating } from '../utils.js';
import storage from '../storage.js';

class MovieCard {
    constructor(movie) {
        this.movie = movie;
        this.element = this.createMovieCard();
        this.setupEventListeners();
    }

    createMovieCard() {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.dataset.movieId = this.movie.id;

        const posterPath = this.movie.poster_path;
        const posterUrl = posterPath ? movieAPI.getImageUrl(posterPath) : 'path/to/default-poster.jpg';

        const releaseDate = this.movie.release_date ? formatDate(this.movie.release_date) : 'Coming Soon';
        const rating = this.movie.vote_average ? (this.movie.vote_average / 2).toFixed(1) : 'N/A';
        const userRating = storage.getRating(this.movie.id);
        const isInWatchlist = storage.isInWatchlist(this.movie.id);

        card.innerHTML = `
            <div class="movie-poster">
                <img src="${posterUrl}" alt="${this.movie.title}" loading="lazy">
                <div class="movie-overlay">
                    <div class="movie-actions">
                        <button class="play-btn" title="Play Trailer">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="watchlist-btn ${isInWatchlist ? 'active' : ''}" title="${isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}">
                            <i class="fas fa-${isInWatchlist ? 'check' : 'plus'}"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${this.movie.title}</h3>
                <div class="movie-meta">
                    <span class="movie-date">${releaseDate}</span>
                    <div class="movie-rating">
                        ${generateStarRating(rating)}
                        ${userRating ? `<span class="user-rating">(${userRating}/5)</span>` : ''}
                    </div>
                </div>
            </div>
        `;

        return card;
    }

    setupEventListeners() {
        // Click on card to show movie details
        this.element.addEventListener('click', (e) => {
            if (!e.target.closest('.movie-actions')) {
                this.showMovieDetails();
            }
        });

        // Play trailer button
        const playBtn = this.element.querySelector('.play-btn');
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.playTrailer();
        });

        // Watchlist button
        const watchlistBtn = this.element.querySelector('.watchlist-btn');
        watchlistBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleWatchlist();
        });
    }

    async showMovieDetails() {
        try {
            // Dispatch custom event to show movie details modal
            const event = new CustomEvent('showMovieDetails', {
                detail: { movieId: this.movie.id }
            });
            document.dispatchEvent(event);
        } catch (error) {
            console.error('Error showing movie details:', error);
        }
    }

    async playTrailer() {
        try {
            // Dispatch custom event to play trailer
            const event = new CustomEvent('playTrailer', {
                detail: { movieId: this.movie.id }
            });
            document.dispatchEvent(event);
        } catch (error) {
            console.error('Error playing trailer:', error);
        }
    }

    toggleWatchlist() {
        const watchlistBtn = this.element.querySelector('.watchlist-btn');
        const isInWatchlist = storage.isInWatchlist(this.movie.id);

        if (isInWatchlist) {
            storage.removeFromWatchlist(this.movie.id);
            watchlistBtn.classList.remove('active');
            watchlistBtn.innerHTML = '<i class="fas fa-plus"></i>';
            watchlistBtn.title = 'Add to Watchlist';
        } else {
            storage.addToWatchlist(this.movie);
            watchlistBtn.classList.add('active');
            watchlistBtn.innerHTML = '<i class="fas fa-check"></i>';
            watchlistBtn.title = 'Remove from Watchlist';
        }
    }

    // Method to update the movie card with new data
    update(movie) {
        this.movie = movie;
        const newCard = this.createMovieCard();
        this.element.replaceWith(newCard);
        this.element = newCard;
        this.setupEventListeners();
    }

    // Method to update the user rating display
    updateRating(rating) {
        const ratingElement = this.element.querySelector('.user-rating');
        if (ratingElement) {
            ratingElement.textContent = `(${rating}/5)`;
        } else if (rating) {
            const movieMeta = this.element.querySelector('.movie-meta');
            const userRatingSpan = document.createElement('span');
            userRatingSpan.className = 'user-rating';
            userRatingSpan.textContent = `(${rating}/5)`;
            movieMeta.appendChild(userRatingSpan);
        }
    }
}

export default MovieCard; 