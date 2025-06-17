import { movieAPI } from '../api.js';
import { debounce, showLoading, hideLoading, showError } from '../utils.js';
import MovieCard from './movieCard.js';

class Search {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchResults = document.getElementById('search-results');
        this.searchTimeout = null;
        this.currentQuery = '';
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Debounced search input
        this.searchInput.addEventListener('input', debounce((e) => {
            this.handleSearch(e.target.value);
        }, 300));

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.searchResults.contains(e.target)) {
                this.searchResults.style.display = 'none';
            }
        });

        // Handle keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.searchResults.style.display = 'none';
                this.searchInput.blur();
            }
        });
    }

    async handleSearch(query) {
        this.currentQuery = query.trim();
        
        if (this.currentQuery.length < 2) {
            this.searchResults.style.display = 'none';
            return;
        }

        try {
            showLoading();
            const response = await movieAPI.searchMovies(this.currentQuery);
            this.renderResults(response.results);
        } catch (error) {
            showError('Failed to search movies');
            console.error('Search error:', error);
        } finally {
            hideLoading();
        }
    }

    renderResults(movies) {
        if (!movies || movies.length === 0) {
            this.searchResults.innerHTML = '<div class="no-results">No movies found</div>';
            this.searchResults.style.display = 'block';
            return;
        }

        this.searchResults.innerHTML = '';
        
        // Create a container for the results
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results-container';

        // Add each movie card to the results
        movies.slice(0, 5).forEach(movie => {
            const movieCard = new MovieCard(movie);
            resultsContainer.appendChild(movieCard.element);
        });

        // Add "View All Results" button if there are more than 5 results
        if (movies.length > 5) {
            const viewAllBtn = document.createElement('button');
            viewAllBtn.className = 'view-all-btn';
            viewAllBtn.textContent = `View All Results (${movies.length})`;
            viewAllBtn.addEventListener('click', () => {
                this.showAllResults(movies);
            });
            resultsContainer.appendChild(viewAllBtn);
        }

        this.searchResults.appendChild(resultsContainer);
        this.searchResults.style.display = 'block';
    }

    showAllResults(movies) {
        // Create a new section for all search results
        const searchSection = document.createElement('section');
        searchSection.className = 'movie-section search-results-section';
        searchSection.innerHTML = `
            <h2>Search Results for "${this.currentQuery}"</h2>
            <div class="movie-grid"></div>
        `;

        // Add the section to the main content
        const main = document.querySelector('main');
        main.innerHTML = ''; // Clear existing content
        main.appendChild(searchSection);

        // Render all movies in a grid
        const movieGrid = searchSection.querySelector('.movie-grid');
        movies.forEach(movie => {
            const movieCard = new MovieCard(movie);
            movieGrid.appendChild(movieCard.element);
        });

        // Hide the search results dropdown
        this.searchResults.style.display = 'none';
        this.searchInput.value = '';

        // Scroll to the results
        searchSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Method to clear search results
    clear() {
        this.searchInput.value = '';
        this.searchResults.style.display = 'none';
        this.currentQuery = '';
    }

    // Method to focus the search input
    focus() {
        this.searchInput.focus();
    }
}

// Create and export search instance
const search = new Search();
export default search; 