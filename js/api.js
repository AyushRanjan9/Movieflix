import config from './config.js';

// TMDB API Configuration
const TMDB_API_KEY = '-------'; // Replace with your TMDB API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// YouTube API Configuration
const YOUTUBE_API_KEY = '------'; // Replace with your YouTube API key
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

class MovieAPI {
    constructor() {
        this.apiKey = config.TMDB_API_KEY;
        this.baseUrl = config.TMDB_BASE_URL;
        this.imageBaseUrl = config.TMDB_IMAGE_BASE_URL;
    }

    // Helper method to handle API requests
    async fetchData(endpoint, params = {}) {
        try {
            const queryParams = new URLSearchParams({
                api_key: this.apiKey,
                ...params
            });

            const response = await fetch(`${this.baseUrl}${endpoint}?${queryParams}`);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Get popular movies for hero section
    async getPopularMovies() {
        return this.fetchData('/movie/popular');
    }

    // Get trending movies
    async getTrendingMovies() {
        return this.fetchData('/trending/movie/week');
    }

    // Get top rated movies
    async getTopRatedMovies() {
        return this.fetchData('/movie/top_rated');
    }

    // Get upcoming movies
    async getUpcomingMovies() {
        return this.fetchData('/movie/upcoming');
    }

    // Get movie details
    async getMovieDetails(movieId) {
        return this.fetchData(`/movie/${movieId}`);
    }

    // Get movie credits (cast)
    async getMovieCredits(movieId) {
        return this.fetchData(`/movie/${movieId}/credits`);
    }

    // Get movie recommendations
    async getMovieRecommendations(movieId) {
        return this.fetchData(`/movie/${movieId}/recommendations`);
    }

    // Get movie genres
    async getMovieGenres() {
        return this.fetchData('/genre/movie/list');
    }

    // Search movies
    async searchMovies(query) {
        return this.fetchData('/search/movie', { query });
    }

    // Get movie videos (trailers)
    async getMovieVideos(movieId) {
        return this.fetchData(`/movie/${movieId}/videos`);
    }

    // Get image URL
    getImageUrl(path, size = 'w500') {
        return `${this.imageBaseUrl}/${size}${path}`;
    }
}

// YouTube API class for trailer search
class YouTubeAPI {
    constructor() {
        this.apiKey = config.YOUTUBE_API_KEY;
        this.baseUrl = config.YOUTUBE_BASE_URL;
    }

    async searchTrailer(movieTitle) {
        try {
            const queryParams = new URLSearchParams({
                key: this.apiKey,
                part: 'snippet',
                q: `${movieTitle} official trailer`,
                type: 'video',
                maxResults: 1
            });

            const response = await fetch(`${this.baseUrl}/search?${queryParams}`);
            
            if (!response.ok) {
                throw new Error(`YouTube API request failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('YouTube API Error:', error);
            throw error;
        }
    }
}

// Create API instances
const movieAPI = new MovieAPI();
const youtubeAPI = new YouTubeAPI();

// Export API instances
export { movieAPI, youtubeAPI }; 
