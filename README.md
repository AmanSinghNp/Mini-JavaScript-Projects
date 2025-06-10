# Mini JavaScript Projects

A collection of JavaScript projects for practicing web development.

## Current Projects

### 1. Color Flipper

Change background colors with buttons or generate random colors.

### 2. Digital Notebook

A beautiful paper-like digital notebook with numbered tabs.

- Create, edit, and delete notes with auto-save
- Grid paper background with handwritten-style fonts
- 12 numbered tabs for organization
- localStorage persistence
- Responsive design
- Beautiful analog-inspired UI

### 3. Palindrome Checker

Check if text reads the same forwards and backwards.

### 4. Persistent TODO List

Add and manage tasks with localStorage.

### 5. Random Quote Generator

Display random quotes.

### 6. Stop Watch

Basic timer with start, stop, reset.

### 7. QR Code Generator

Generate QR codes from text or URLs with download functionality.

- Enter any text or URL
- Generate QR code instantly
- Download QR code as PNG image
- Clean, modern interface

### 8. Weather Now

A minimalistic weather web app with real-time weather data and forecasts.

- Current weather display with temperature and conditions
- 12-hour hourly forecast with weather icons
- City search and save multiple locations
- Automatic dark/light mode switching based on local time
- Works offline after first visit (PWA)
- Responsive glass-morphism design
- No API key required (uses Open-Meteo API)

### 9. Physics Engine

A modular 2D physics engine with interactive demos showcasing real-world physics concepts.

- **Bouncing Balls Demo**: Multi-ball physics sandbox with extreme physics and interactive controls
- **Breakout Game**: Classic brick-breaking game with advanced collision detection
- Shared physics core with vector mathematics and collision detection
- Real-time physics simulation with 60 FPS performance
- Educational value for physics and programming concepts

## Usage

Open `index.html` or `main.html` in any project folder to run it.
For WeatherApp, serve using a local server due to API requirements.

---

_More projects coming soon..._

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Local Storage (for TODO list, Digital Notebook, and Weather app city preferences)
- Service Workers (for WeatherApp offline functionality)
- Canvas API (for Physics Engine)
- ES6 Modules (for Physics Engine modular architecture)
- CSS Custom Properties (for theming)
- QR Server API (for QR code generation)
- Open-Meteo Weather API (for WeatherApp)
- Google Fonts (Crimson Text, Inter, Kalam for Digital Notebook)

## Project Structure

```
Mini-JavaScript-Projects/
├── Color Flipper/
├── Notebook (Simple)/
├── Palindrome Checker/
├── Persistent TODO List/
├── Random Quote Generator/
├── Stop Watch/
├── QR Code generator/
├── WeatherApp/
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   ├── sw.js
│   ├── manifest.json
│   └── icons/
├── Physics-engine/
│   ├── core/              # Shared physics components
│   ├── systems/           # Shared systems
│   └── demos/             # Interactive demonstrations
│       ├── bouncing-balls/
│       └── breakout/
└── README.md
```

Most projects contain `main.html` and `index.js` files.
WeatherApp uses `index.html` and `app.js`.
Physics-engine has a modular structure with shared components.
