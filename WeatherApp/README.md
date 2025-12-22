# Weather Now

A minimalistic weather web app built with vanilla HTML, CSS, and JavaScript. Features current weather conditions, 12-hour forecasts, city search, and offline functionality.

## Features

- Current weather display with temperature and conditions
- 12-hour hourly forecast with weather icons
- City search and save multiple locations
- Works offline after first visit
- Responsive design for all devices
- Keyboard navigation and accessibility support
- Automatic dark/light mode switching
- Progressive Web App (installable)

## Quick Start

### Requirements

No API key required. This app uses the free Open-Meteo weather API.

### Installation

1. Download or clone this project
2. Serve the files using a local server:

   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js
   npx http-server

   # PHP
   php -S localhost:8000
   ```

3. Open browser and go to `http://localhost:8000`

### Static Hosting

1. Upload all files to your hosting service
2. Access via your domain/URL

No configuration needed.

## Usage

### Navigation

- Click menu button to open city search and saved cities
- Type city names to search and add new locations
- Click any saved city to view its weather
- Press Escape key to close the city menu

### Weather Display

- Large temperature display with weather icon and background
- Four metrics showing temperature, humidity, wind, and pressure
- Scrollable 12-hour forecast with icons and temperatures

## Technical Details

### Architecture

- Vanilla JavaScript with modern ES6+ features
- CSS custom properties for consistent theming
- Service worker for offline caching
- LocalStorage for persistent city preferences

### API Integration

- Open-Meteo Weather API (free, no sign-up required)
- Open-Meteo Geocoding for city search
- 15-minute request caching
- Graceful error handling
- 10,000 daily requests limit

### Performance

- File sizes: HTML (~2KB), CSS (~8KB), JavaScript (~12KB), Icons (~3KB)
- Aggressive caching with service worker
- Minimal DOM manipulation

### Browser Support

- Modern browsers: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- Uses: Fetch API, CSS Grid, Service Worker, Web App Manifest

## Customization

### Theme Colors

Edit CSS custom properties in `styles.css`:

```css
:root {
  --bg: #0e1116;
  --surface: #1e232b;
  --accent: #4c9be8;
  --text: #ffffff;
  --muted: #9aa5b1;
}
```

### Weather Icons

Replace SVG files in `/icons/` directory:

- `clear.svg` - Clear weather
- `cloud.svg` - Cloudy conditions
- `rain.svg` - Rain
- `snow.svg` - Snow
- `thunder.svg` - Thunderstorms
- `mist.svg` - Fog/mist

## Troubleshooting

### Common Issues

1. Weather not loading:

   - Check internet connection
   - Check browser console for errors
   - Verify Open-Meteo API is accessible

2. Search not working:

   - Check geocoding API accessibility
   - Try refreshing the page
   - Verify city name spelling

3. App not installing:
   - Use HTTPS (required for PWA)
   - Check manifest.json accessibility
   - Verify service worker registration

### Debug

Open browser developer tools:

- Console: Check for JavaScript errors and API responses
- Network: Monitor API request status and caching
- Application: View service worker status and cache contents

## File Structure

```
WeatherApp/
├── index.html              # Main HTML structure
├── styles.css              # Styling and themes
├── app.js                  # JavaScript logic and API calls
├── sw.js                   # Service worker for caching
├── manifest.json           # PWA configuration
├── .eslintrc.json         # Code linting rules
├── README.md              # Documentation
└── icons/                 # Weather condition icons
    ├── clear.svg
    ├── cloud.svg
    ├── rain.svg
    ├── snow.svg
    ├── thunder.svg
    └── mist.svg
```

## Privacy

- No data collection or personal information storage
- City preferences stored locally in browser only
- API calls only to Open-Meteo (free service)
- No tracking or analytics
- No sign-up required

## License

Open source under the MIT License. See the root `LICENSE` file in the repository for full details.

## Contributing

Contributions welcome. Please submit issues, feature requests, or pull requests.

Built with vanilla web technologies.
