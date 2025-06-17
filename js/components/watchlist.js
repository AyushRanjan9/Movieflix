import storage from '../storage.js';
import { showError } from '../utils.js';

class Watchlist {
    constructor() {
        this.watchlist = storage.getWatchlist();
    }

    // Get all movies in watchlist
    getMovies() {
        return this.watchlist;
    }

    // Add movie to watchlist
    addMovie(movie) {
        try {
            if (!this.isInWatchlist(movie.id)) {
                this.watchlist.push(movie);
                storage.addToWatchlist(movie);
                return true;
            }
            return false;
        } catch (error) {
            showError('Failed to add movie to watchlist');
            console.error('Add to watchlist error:', error);
            return false;
        }
    }

    // Remove movie from watchlist
    removeMovie(movieId) {
        try {
            const index = this.watchlist.findIndex(movie => movie.id === movieId);
            if (index !== -1) {
                this.watchlist.splice(index, 1);
                storage.removeFromWatchlist(movieId);
                return true;
            }
            return false;
        } catch (error) {
            showError('Failed to remove movie from watchlist');
            console.error('Remove from watchlist error:', error);
            return false;
        }
    }

    // Check if movie is in watchlist
    isInWatchlist(movieId) {
        return this.watchlist.some(movie => movie.id === movieId);
    }

    // Clear watchlist
    clear() {
        try {
            this.watchlist = [];
            storage.clearAll();
            return true;
        } catch (error) {
            showError('Failed to clear watchlist');
            console.error('Clear watchlist error:', error);
            return false;
        }
    }

    // Get watchlist count
    getCount() {
        return this.watchlist.length;
    }

    // Update watchlist
    updateWatchlist() {
        this.watchlist = storage.getWatchlist();
    }
}

// Create and export watchlist instance
const watchlist = new Watchlist();
export default watchlist; 