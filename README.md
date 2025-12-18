# Mini JavaScript Projects

A curated collection of vanilla JavaScript applications demonstrating modern web development concepts, from DOM manipulation and API integration to complex physics simulations and game logic.

## 🚀 Featured Projects

### [Physics Engine](./Physics-engine/)

A modular 2D physics engine built from scratch with HTML5 Canvas.

- **Key Features:** Custom vector mathematics library, collision detection system, and multiple interactive demos (Bouncing Balls, Breakout).
- **Tech Stack:** ES6 Modules, Canvas API, Vector Math.

### [Weather Now](./WeatherApp/)

A minimalistic, offline-capable weather application.

- **Key Features:** Real-time data via Open-Meteo API, 12-hour forecast, city search, local persistence, and PWA support (installable).
- **Tech Stack:** Service Workers, Fetch API, CSS Grid, Glassmorphism.

### [Digital Notebook](<./Notebook%20(Simple)/>)

A beautiful, distraction-free note-taking application.

- **Key Features:** Create/Edit/Delete notes, auto-save functionality, full-text search, and responsive sidebar navigation.
- **Tech Stack:** LocalStorage, DOM Manipulation, CSS Flexbox.

### [Music Player](./Music%20Player/)

A modern audio player interface with playlist support.

- **Key Features:** Play/Pause/Seek controls, volume management, playlist navigation, and keyboard shortcuts.
- **Tech Stack:** HTML5 Audio API, Range Inputs, Event Handling.

### [Recipe Finder](./RecipeFinder/)

A content-rich recipe discovery application with fluid transitions.

- **Key Features:** SPA architecture, masonry grid layout, immersive detail view with hero images, and glassmorphism UI.
- **Tech Stack:** HTML5, Tailwind CSS, Vanilla JavaScript.

### [Expense Tracker](./Expense%20Tracker/)

A desktop expense tracker dashboard with data visualization.

- **Features:** Dark mode dashboard, summary charts, transaction list, and quick actions.
- **Tech Stack:** HTML5, Tailwind CSS (via CDN).

### [Drawing App](./Drawing%20App/)

A direct manipulation digital canvas with realistic tools.

- **Key Features:** HTML5 Canvas engine, pressure-simulated tools (Pencil, Marker), custom UI controls, and image export.
- **Tech Stack:** HTML5 Canvas, Touch Events, Tailwind CSS.

---

## 🎮 Games

### [Hangman](./Hangman/)

A modern, vector-based Hangman game with progressive visual feedback.

- **Features:** Geometric figure build-up, system-style keyboard, circular life indicator, and win/loss animations.

### [Memory Game](./Memory%20Game/)

A card matching game to test your memory.

- **Features:** Move counter, timer, responsive grid layout, and celebratory animations.

### [Tic-Tac-Toe](./Tic-Tac-Toe/)

The classic paper-and-pencil game for two players.

- **Features:** Score tracking, win/draw detection, and turn indicators.

### [Breakout](./Physics-engine/demos/breakout/)

A brick-breaking arcade game powered by the custom physics engine.

- **Features:** Collision physics, paddle control, and scoring system.

---

## 🛠️ Utilities & Tools

- **[Calculator](./Calculator/):** A fully functional calculator with history tracking, keyboard support, and order-of-operations logic.
- **[QR Code Generator](./QR%20Code%20generator/):** Instantly generate and download QR codes for text or URLs using the QR Server API.
- **[Persistent TODO List](./Persistent%20TODO%20List/):** Manage tasks with add/delete functionality and LocalStorage persistence.
- **[Stop Watch](./Stop%20Watch/):** specific timer with start, stop, and reset controls.
- **[Color Flipper](./Color%20Flipper/):** background color generator to test DOM manipulation.
- **[Random Quote Generator](./Random%20Quote%20Generator/):** Display inspirational quotes.
- **[Palindrome Checker](./Palindrome%20Checker/):** Algorithm to check if text reads the same forwards and backwards.

---

## 💻 Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/Mini-JavaScript-Projects.git
    ```

2.  **Run a Project:**

    - For most projects (Calculator, Games, Utilities), simply open the `index.html` or `main.html` file in your browser.

    - **For WeatherApp & Physics Engine:**
      These projects use ES Modules or Service Workers which require a local server due to browser security restrictions (CORS).

      **Using Python:**

      ```bash
      cd WeatherApp  # or cd Physics-engine
      python -m http.server 8000
      ```

      **Using Node.js (http-server):**

      ```bash
      npx http-server WeatherApp
      ```

      Then open `http://localhost:8000` in your browser.

## 🧰 Technologies Used

- **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **APIs:** Canvas API, Audio API, LocalStorage, Fetch API
- **Advanced:** Service Workers (PWA), ES Modules, Custom Vector Math
- **External Services:** Open-Meteo API, QR Server API

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
