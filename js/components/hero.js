import { movieAPI } from '../api.js';
import { formatDate, truncateText } from '../utils.js';
import { showError } from '../utils.js';

class Hero {
    constructor() {
        this.heroSection = document.getElementById('hero-section');
        this.heroTitle = document.querySelector('.hero-title');
        this.heroDescription = document.querySelector('.hero-description');
        this.playTrailerBtn = document.querySelector('.play-trailer-btn');
        
        this.currentMovie = null;
        this.init();
    }

    async init() {
        try {
            await this.loadFeaturedMovie();
            this.setupEventListeners();
        } catch (error) {
            showError('Failed to load featured movie');
            console.error('Hero initialization error:', error);
        }
    }

    async loadFeaturedMovie() {
        try {
            const response = await movieAPI.getPopularMovies();
            const movies = response.results;
            
            if (movies && movies.length > 0) {
                // Get a random movie from the first 5 popular movies
                const randomIndex = Math.floor(Math.random() * Math.min(5, movies.length));
                this.currentMovie = movies[randomIndex];
                this.updateHeroContent();
            }
        } catch (error) {
            throw new Error('Failed to load featured movie');
        }
    }

    updateHeroContent() {
        if (!this.currentMovie) return;

        // Update background image
        const backdropPath = this.currentMovie.backdrop_path;
        if (backdropPath) {
            this.heroSection.style.backgroundImage = `url(${movieAPI.getImageUrl(backdropPath, 'original')})`;
        }

        // Update title and description
        this.heroTitle.textContent = this.currentMovie.title;
        this.heroDescription.textContent = truncateText(this.currentMovie.overview, 200);

        // Update release date
        const releaseDate = this.currentMovie.release_date;
        if (releaseDate) {
            const formattedDate = formatDate(releaseDate);
            this.heroDescription.textContent += `\nReleased: ${formattedDate}`;
        }
    }

    setupEventListeners() {
        // Play trailer button click
        this.playTrailerBtn.addEventListener('click', () => {
            if (this.currentMovie) {
                // Dispatch custom event to handle trailer playback
                const event = new CustomEvent('playTrailer', {
                    detail: { movieId: this.currentMovie.id }
                });
                document.dispatchEvent(event);
            }
        });

        // Auto-rotate featured movie every 30 seconds
        setInterval(() => {
            this.loadFeaturedMovie();
        }, 30000);
    }

    // Method to manually update the featured movie
    async updateFeaturedMovie(movieId) {
        try {
            const movieDetails = await movieAPI.getMovieDetails(movieId);
            this.currentMovie = movieDetails;
            this.updateHeroContent();
        } catch (error) {
            showError('Failed to update featured movie');
            console.error('Update featured movie error:', error);
        }
    }
}

// Create and export hero instance
const hero = new Hero();
export default hero; 