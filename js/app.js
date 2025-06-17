import { movieAPI } from './api.js';
import { showLoading, hideLoading, showError } from './utils.js';
import Carousel from './components/carousel.js';
import hero from './components/hero.js';
import search from './components/search.js';
import theme from './components/theme.js';
import storage from './storage.js';
import MovieCard from './components/movieCard.js';

class App {
    constructor() {
        this.carousels = {};
        this.init();
    }

    async init() {
        try {
            showLoading();
            await this.initializeCarousels();
            this.setupEventListeners();
            this.loadContinueWatching();
        } catch (error) {
            showError('Failed to initialize application');
            console.error('App initialization error:', error);
        } finally {
            hideLoading();
        }
    }

    async initializeCarousels() {
        try {
            // Initialize trending movies carousel
            this.carousels.trending = new Carousel('trending-carousel', {
                autoScroll: true,
                scrollInterval: 5000
            });
            await this.carousels.trending.loadMovies('/trending/movie/week');

            // Initialize top rated movies carousel
            this.carousels.topRated = new Carousel('top-rated-carousel');
            await this.carousels.topRated.loadMovies('/movie/top_rated');

            // Initialize new releases carousel
            this.carousels.newReleases = new Carousel('new-releases-carousel');
            await this.carousels.newReleases.loadMovies('/movie/upcoming');

            // Initialize continue watching carousel
            this.carousels.continueWatching = new Carousel('continue-watching-carousel');
        } catch (error) {
            console.error('Error initializing carousels:', error);
            showError('Failed to load movies');
        }
    }

    setupEventListeners() {
        // Navigation links
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.handleNavigation(section);
            });
        });

        // Genre dropdown
        this.setupGenreDropdown();

        // Update movie ratings
        document.addEventListener('updateMovieRating', (e) => {
            const { movieId, rating } = e.detail;
            this.updateMovieRating(movieId, rating);
        });

        // Prevent default behavior for all buttons
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
            });
        });
    }

    async setupGenreDropdown() {
        try {
            const response = await movieAPI.getMovieGenres();
            const genres = response.genres;
            const dropdown = document.getElementById('genres-dropdown');
            dropdown.innerHTML = ''; // Clear existing genres

            genres.forEach(genre => {
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = genre.name;
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showMoviesByGenre(genre.id, genre.name);
                });
                dropdown.appendChild(link);
            });
        } catch (error) {
            console.error('Failed to load genres:', error);
            showError('Failed to load movie genres');
        }
    }

    async showMoviesByGenre(genreId, genreName) {
        try {
            showLoading();
            const response = await movieAPI.fetchData('/discover/movie', {
                with_genres: genreId
            });

            // Create a new section for genre movies
            const main = document.querySelector('main');
            main.innerHTML = `
                <section class="movie-section">
                    <h2>${genreName} Movies</h2>
                    <div class="movie-grid"></div>
                </section>
            `;

            // Render movies in a grid
            const movieGrid = main.querySelector('.movie-grid');
            if (response.results && response.results.length > 0) {
                response.results.forEach(movie => {
                    const movieCard = new MovieCard(movie);
                    movieGrid.appendChild(movieCard.element);
                });
            } else {
                movieGrid.innerHTML = '<p class="no-movies">No movies found in this genre</p>';
            }

            // Update active navigation
            this.updateActiveNavigation('genres');
        } catch (error) {
            showError('Failed to load genre movies');
            console.error('Show genre movies error:', error);
        } finally {
            hideLoading();
        }
    }

    handleNavigation(section) {
        // Remove active class from all links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to clicked link
        const activeLink = document.querySelector(`.nav-links a[data-section="${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        switch (section) {
            case 'home':
                window.location.reload();
                break;
            case 'top-rated':
                this.showTopRated();
                break;
            case 'trending':
                this.showTrending();
                break;
            case 'new-releases':
                this.showNewReleases();
                break;
            case 'my-list':
                this.showWatchlist();
                break;
            default:
                break;
        }
    }

    updateActiveNavigation(section) {
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === section);
        });
    }

    async showTopRated() {
        try {
            showLoading();
            const main = document.querySelector('main');
            main.innerHTML = `
                <section class="movie-section">
                    <h2>Top Rated Movies</h2>
                    <div class="movie-grid"></div>
                </section>
            `;

            const movieGrid = main.querySelector('.movie-grid');
            const response = await movieAPI.getTopRatedMovies();
            
            if (response.results && response.results.length > 0) {
                response.results.forEach(movie => {
                    const movieCard = new MovieCard(movie);
                    movieGrid.appendChild(movieCard.element);
                });
            } else {
                movieGrid.innerHTML = '<p class="no-movies">No movies found</p>';
            }
        } catch (error) {
            showError('Failed to load top rated movies');
            console.error('Show top rated error:', error);
        } finally {
            hideLoading();
        }
    }

    async showTrending() {
        try {
            showLoading();
            const main = document.querySelector('main');
            main.innerHTML = `
                <section class="movie-section">
                    <h2>Trending Movies</h2>
                    <div class="movie-grid"></div>
                </section>
            `;

            const movieGrid = main.querySelector('.movie-grid');
            const response = await movieAPI.getTrendingMovies();
            
            if (response.results && response.results.length > 0) {
                response.results.forEach(movie => {
                    const movieCard = new MovieCard(movie);
                    movieGrid.appendChild(movieCard.element);
                });
            } else {
                movieGrid.innerHTML = '<p class="no-movies">No movies found</p>';
            }
        } catch (error) {
            showError('Failed to load trending movies');
            console.error('Show trending error:', error);
        } finally {
            hideLoading();
        }
    }

    async showNewReleases() {
        try {
            showLoading();
            const main = document.querySelector('main');
            main.innerHTML = `
                <section class="movie-section">
                    <h2>New Releases</h2>
                    <div class="movie-grid"></div>
                </section>
            `;

            const movieGrid = main.querySelector('.movie-grid');
            const response = await movieAPI.getUpcomingMovies();
            
            if (response.results && response.results.length > 0) {
                response.results.forEach(movie => {
                    const movieCard = new MovieCard(movie);
                    movieGrid.appendChild(movieCard.element);
                });
            } else {
                movieGrid.innerHTML = '<p class="no-movies">No movies found</p>';
            }
        } catch (error) {
            showError('Failed to load new releases');
            console.error('Show new releases error:', error);
        } finally {
            hideLoading();
        }
    }

    showWatchlist() {
        try {
            const main = document.querySelector('main');
            main.innerHTML = `
                <section class="movie-section">
                    <h2>My Watchlist</h2>
                    <div class="movie-grid"></div>
                </section>
            `;

            const movieGrid = main.querySelector('.movie-grid');
            const watchlist = storage.getWatchlist();
            
            if (watchlist.length === 0) {
                movieGrid.innerHTML = '<p class="no-movies">Your watchlist is empty</p>';
            } else {
                watchlist.forEach(movie => {
                    const movieCard = new MovieCard(movie);
                    movieGrid.appendChild(movieCard.element);
                });
            }
        } catch (error) {
            showError('Failed to load watchlist');
            console.error('Show watchlist error:', error);
        }
    }

    loadContinueWatching() {
        const continueWatching = storage.getContinueWatching();
        if (continueWatching.length > 0) {
            this.carousels.continueWatching.updateMovies(continueWatching);
        } else {
            const section = document.getElementById('continue-watching-section');
            if (section) {
                section.style.display = 'none';
            }
        }
    }

    updateMovieRating(movieId, rating) {
        // Update rating in all carousels
        Object.values(this.carousels).forEach(carousel => {
            const movieCard = carousel.container.querySelector(`[data-movie-id="${movieId}"]`);
            if (movieCard) {
                const card = movieCard.__movieCard;
                if (card) {
                    card.updateRating(rating);
                }
            }
        });
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
}); 