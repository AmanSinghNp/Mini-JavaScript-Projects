# Manga Motion Reader: Frieren Edition

> "The magic you collect is not just for you. It's for the future." - Frieren

This project is a "creative coding" web engine designed to read manga (or any vertical content) with a magical, atmospheric feel inspired by *Frieren: Beyond Journey's End*. It features a physics-based "Fluid Scroll" engine, a "Grimoire" UI, and interactive particle effects.

## Features

### 1. The Grimoire UI
- **Magical Tome Layout**: The reader is styled like an ancient grimoire with parchment textures, gold foil accents, and serif typography (`Cormorant Garamond`).
- **Responsive Spread**: Adapts from a scrolling tome on mobile to a wider spread on desktop.

### 2. Mana Mist Physics
- **Fluid Scroll**: The scrolling engine uses a custom spring-mass system with **Fluid Resistance** (viscosity) to make the content feel like it's floating in water or mana, rather than just air.
- **Particle System**: A lightweight canvas overlay renders "Blue Moon Weed" petals that drift and react to your scroll velocity, implemented with an Object Pool for performance.

### 3. Magical Tools
- **Timeline Tracking**: A custom progress indicator that tracks your journey through the "Era" (chapter).
- **Analyze Lens**: Hold `Shift` and hover over panels to activate the "Analysis Spell," a magnifying lens with a magical distortion effect.

## Project Structure

```
root/
├── index.html          # Main entry point
├── engine/             # The Core Logic (Vanilla JS)
│   ├── App.js          # Main Orchestrator
│   ├── Physics.js      # Spring physics & Fluid resistance
│   ├── Scroller.js     # Scroll loop handler
│   ├── Panel.js        # Panel parallax & effects
│   ├── GrimoireUI.js   # UI interactions (Lens, Timeline)
│   ├── ParticleSystem.js # Canvas particle effects
│   └── Utils.js        # Math helpers
└── styles/             # Modular CSS
    ├── main.css        # Variables, Reset, Typography
    ├── grimoire.css    # The Book UI styling
    ├── particles.css   # Canvas overlay styling
    └── components.css  # Timeline, Lens tooling
```

## How to Run
Simply open `index.html` in any modern browser. No build step required!

## Tech Stack
- **Languages**: HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
- **Zero Dependencies**: No React, No Vue, No GSAP. Pure code magic.
