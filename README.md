# MovieFlix - Netflix-style Movie Web Application

A modern, responsive movie web application built with vanilla JavaScript, HTML5, and CSS3. This application provides a Netflix-like experience for browsing and discovering movies.

## Features

- 🎬 **Home Page**
  - Hero banner with featured movie
  - Trending movies carousel
  - Top-rated movies section
  - New releases section
  - Continue watching section

- 🎯 **Movie Details**
  - Comprehensive movie information
  - Cast details
  - User ratings
  - Watchlist functionality
  - YouTube trailer integration
  - Movie recommendations

- 🔍 **Search**
  - Real-time search with debouncing
  - Autocomplete suggestions
  - Search results in grid view

- 📱 **Responsive Design**
  - Mobile-first approach
  - Touch-friendly carousels
  - Adaptive layouts

- 🌓 **Theme Support**
  - Light/Dark mode
  - System theme detection
  - Theme persistence

- 💾 **Local Storage**
  - Watchlist management
  - User ratings
  - Continue watching progress
  - Theme preference

## Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- TMDB API key
- (Optional) YouTube Data API key for trailer search

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/movieflix.git
   cd movieflix
   ```

2. Get your API keys:
   - [TMDB API Key](https://www.themoviedb.org/documentation/api)
     - Go to https://www.themoviedb.org/
     - Create an account or sign in
     - Go to your profile settings
     - Click on "API" in the left sidebar
     - Request an API key
   - [YouTube Data API Key](https://developers.google.com/youtube/v3/getting-started)
     - Go to https://console.cloud.google.com/
     - Create a new project
     - Enable the YouTube Data API v3
     - Create credentials (API key)

3. Configure API keys:
   - Open `js/config.js`
   - Replace `YOUR_TMDB_API_KEY` with your TMDB API key
   - Replace `YOUR_YOUTUBE_API_KEY` with your YouTube API key (optional)

4. Serve the application:
   ```bash
   python -m http.server 8000
   ```
   Then open http://localhost:8000 in your browser

## Project Structure

```
/movieflix/
│
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── api.js
│   ├── app.js
│   ├── config.js
│   ├── storage.js
│   ├── utils.js
│   └── components/
│       ├── hero.js
│       ├── carousel.js
│       ├── movieCard.js
│       ├── modal.js
│       ├── search.js
│       ├── watchlist.js
│       └── theme.js
└── README.md
```

## Usage

1. **Browsing Movies**
   - Use the navigation menu to switch between different movie categories
   - Scroll horizontally through movie carousels
   - Click on a movie card to view details

2. **Searching**
   - Use the search bar in the header
   - Results appear in real-time
   - Click "View All Results" to see complete search results

3. **Movie Details**
   - Click any movie card to open the details modal
   - View cast information, ratings, and recommendations
   - Add to watchlist or rate the movie
   - Play the trailer

4. **Watchlist**
   - Add movies to your watchlist
   - Access your watchlist from the "My List" tab
   - Remove movies from your watchlist

5. **Theme**
   - Toggle between light and dark mode
   - Theme preference is saved automatically

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [TMDB](https://www.themoviedb.org/) for the movie data API
- [YouTube Data API](https://developers.google.com/youtube/v3) for trailer integration
- [Font Awesome](https://fontawesome.com/) for icons 