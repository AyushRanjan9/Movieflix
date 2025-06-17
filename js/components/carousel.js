import { movieAPI } from '../api.js';
import { showLoading, hideLoading, showError } from '../utils.js';
import MovieCard from './movieCard.js';

class Carousel {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            autoScroll: options.autoScroll || false,
            scrollInterval: options.scrollInterval || 5000,
            scrollAmount: options.scrollAmount || 200,
            ...options
        };

        this.movies = [];
        this.currentIndex = 0;
        this.isScrolling = false;
        this.scrollInterval = null;

        this.init();
    }

    async init() {
        if (!this.container) {
            console.error(`Carousel container with ID "${this.containerId}" not found`);
            return;
        }

        this.setupEventListeners();
        
        if (this.options.autoScroll) {
            this.startAutoScroll();
        }
    }

    setupEventListeners() {
        // Touch events for mobile
        let startX, scrollLeft;
        
        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - this.container.offsetLeft;
            scrollLeft = this.container.scrollLeft;
        }, { passive: true });

        this.container.addEventListener('touchmove', (e) => {
            if (!startX) return;
            
            const x = e.touches[0].pageX - this.container.offsetLeft;
            const walk = (x - startX) * 2;
            this.container.scrollLeft = scrollLeft - walk;
        }, { passive: true });

        // Mouse wheel events
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.container.scrollLeft += e.deltaY;
        }, { passive: false });

        // Scroll buttons (if present)
        const prevButton = this.container.parentElement.querySelector('.carousel-prev');
        const nextButton = this.container.parentElement.querySelector('.carousel-next');

        if (prevButton) {
            prevButton.addEventListener('click', () => this.scroll('prev'));
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => this.scroll('next'));
        }

        // Pause auto-scroll on hover
        this.container.addEventListener('mouseenter', () => {
            if (this.options.autoScroll) {
                this.stopAutoScroll();
            }
        });

        this.container.addEventListener('mouseleave', () => {
            if (this.options.autoScroll) {
                this.startAutoScroll();
            }
        });
    }

    async loadMovies(endpoint, params = {}) {
        try {
            showLoading();
            const response = await movieAPI.fetchData(endpoint, params);
            this.movies = response.results || [];
            this.renderMovies();
        } catch (error) {
            showError('Failed to load movies');
            console.error('Load movies error:', error);
        } finally {
            hideLoading();
        }
    }

    renderMovies() {
        if (!this.movies.length) return;

        this.container.innerHTML = '';
        
        this.movies.forEach(movie => {
            const movieCard = new MovieCard(movie);
            this.container.appendChild(movieCard.element);
        });
    }

    scroll(direction) {
        if (this.isScrolling) return;
        
        this.isScrolling = true;
        const scrollAmount = this.options.scrollAmount;
        
        if (direction === 'prev') {
            this.container.scrollLeft -= scrollAmount;
        } else {
            this.container.scrollLeft += scrollAmount;
        }

        setTimeout(() => {
            this.isScrolling = false;
        }, 500);
    }

    startAutoScroll() {
        if (this.scrollInterval) return;
        
        this.scrollInterval = setInterval(() => {
            this.scroll('next');
        }, this.options.scrollInterval);
    }

    stopAutoScroll() {
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;
        }
    }

    // Method to update movies in the carousel
    updateMovies(movies) {
        this.movies = movies;
        this.renderMovies();
    }

    // Method to add a single movie to the carousel
    addMovie(movie) {
        this.movies.push(movie);
        const movieCard = new MovieCard(movie);
        this.container.appendChild(movieCard.element);
    }

    // Method to remove a movie from the carousel
    removeMovie(movieId) {
        const index = this.movies.findIndex(movie => movie.id === movieId);
        if (index !== -1) {
            this.movies.splice(index, 1);
            const movieCard = this.container.querySelector(`[data-movie-id="${movieId}"]`);
            if (movieCard) {
                movieCard.remove();
            }
        }
    }

    // Method to clear the carousel
    clear() {
        this.movies = [];
        this.container.innerHTML = '';
    }

    // Method to destroy the carousel instance
    destroy() {
        this.stopAutoScroll();
        this.clear();
        this.container.removeEventListener('wheel', this.handleWheel);
        this.container.removeEventListener('touchstart', this.handleTouchStart);
        this.container.removeEventListener('touchmove', this.handleTouchMove);
    }
}

export default Carousel; 