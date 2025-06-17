import storage from '../storage.js';

class Theme {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.currentTheme = storage.getTheme();
        this.init();
    }

    init() {
        // Set initial theme
        this.setTheme(this.currentTheme);
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!storage.getTheme()) { // Only auto-switch if user hasn't set a preference
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        storage.setTheme(theme);

        // Update toggle button icon
        const icon = this.themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    // Method to get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Method to check if dark mode is enabled
    isDarkMode() {
        return this.currentTheme === 'dark';
    }
}

// Create and export theme instance
const theme = new Theme();
export default theme; 