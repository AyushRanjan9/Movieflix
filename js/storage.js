class Storage {
    constructor() {
        this.watchlistKey = 'movieflix_watchlist';
        this.ratingsKey = 'movieflix_ratings';
        this.continueWatchingKey = 'movieflix_continue_watching';
        this.themeKey = 'movieflix_theme';
    }

    // Watchlist Methods
    getWatchlist() {
        const watchlist = localStorage.getItem(this.watchlistKey);
        return watchlist ? JSON.parse(watchlist) : [];
    }

    addToWatchlist(movie) {
        const watchlist = this.getWatchlist();
        if (!watchlist.some(m => m.id === movie.id)) {
            watchlist.push(movie);
            localStorage.setItem(this.watchlistKey, JSON.stringify(watchlist));
        }
    }

    removeFromWatchlist(movieId) {
        const watchlist = this.getWatchlist();
        const updatedWatchlist = watchlist.filter(movie => movie.id !== movieId);
        localStorage.setItem(this.watchlistKey, JSON.stringify(updatedWatchlist));
    }

    isInWatchlist(movieId) {
        const watchlist = this.getWatchlist();
        return watchlist.some(movie => movie.id === movieId);
    }

    // Ratings Methods
    getRatings() {
        const ratings = localStorage.getItem(this.ratingsKey);
        return ratings ? JSON.parse(ratings) : {};
    }

    setRating(movieId, rating) {
        const ratings = this.getRatings();
        ratings[movieId] = rating;
        localStorage.setItem(this.ratingsKey, JSON.stringify(ratings));
    }

    getRating(movieId) {
        const ratings = this.getRatings();
        return ratings[movieId] || null;
    }

    // Continue Watching Methods
    getContinueWatching() {
        const continueWatching = localStorage.getItem(this.continueWatchingKey);
        return continueWatching ? JSON.parse(continueWatching) : [];
    }

    addToContinueWatching(movie, progress = 0) {
        const continueWatching = this.getContinueWatching();
        const existingIndex = continueWatching.findIndex(m => m.id === movie.id);

        if (existingIndex !== -1) {
            continueWatching[existingIndex].progress = progress;
        } else {
            continueWatching.push({ ...movie, progress });
        }

        localStorage.setItem(this.continueWatchingKey, JSON.stringify(continueWatching));
    }

    updateProgress(movieId, progress) {
        const continueWatching = this.getContinueWatching();
        const movieIndex = continueWatching.findIndex(m => m.id === movieId);

        if (movieIndex !== -1) {
            continueWatching[movieIndex].progress = progress;
            localStorage.setItem(this.continueWatchingKey, JSON.stringify(continueWatching));
        }
    }

    removeFromContinueWatching(movieId) {
        const continueWatching = this.getContinueWatching();
        const updatedList = continueWatching.filter(movie => movie.id !== movieId);
        localStorage.setItem(this.continueWatchingKey, JSON.stringify(updatedList));
    }

    // Theme Methods
    getTheme() {
        return localStorage.getItem(this.themeKey) || 'light';
    }

    setTheme(theme) {
        localStorage.setItem(this.themeKey, theme);
    }

    // Clear all data (for testing or reset)
    clearAll() {
        localStorage.removeItem(this.watchlistKey);
        localStorage.removeItem(this.ratingsKey);
        localStorage.removeItem(this.continueWatchingKey);
        localStorage.removeItem(this.themeKey);
    }
}

// Create and export storage instance
const storage = new Storage();
export default storage; 