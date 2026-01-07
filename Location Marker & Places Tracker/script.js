/**
 * Location Marker & Places Tracker
 * Pure vanilla JavaScript interactive map with Canvas API
 */

(function () {
  "use strict";

  // DOM Elements
  const canvas = document.getElementById("map-canvas");
  const ctx = canvas.getContext("2d");
  const locationsList = document.getElementById("locations-list");
  const markerForm = document.getElementById("marker-form");
  const markerFormSection = document.getElementById("marker-form-section");
  const formTitle = document.getElementById("form-title");
  const markerNameInput = document.getElementById("marker-name");
  const markerNoteInput = document.getElementById("marker-note");
  const markerColorInput = document.getElementById("marker-color");
  const btnCancelForm = document.getElementById("btn-cancel-form");
  const btnZoomIn = document.getElementById("btn-zoom-in");
  const btnZoomOut = document.getElementById("btn-zoom-out");
  const btnExport = document.getElementById("btn-export");
  const fileImport = document.getElementById("file-import");

  // App State
  const state = {
    center: { lat: 20, lon: 0 }, // Map center (lat/lon) - default to world view
    zoom: 3, // Zoom level (2-18)
    markers: [], // Array of marker objects
    selectedMarker: null, // Currently selected marker ID
    editingMarker: null, // Marker being edited
    isDragging: false, // Pan state
    dragStart: { x: 0, y: 0 }, // Drag start position
    tileCache: new Map(), // Cached tile images
    distanceStart: null, // Start marker for distance calculation
    distanceEnd: null, // End marker for distance calculation
    panOffset: { x: 0, y: 0 }, // Pan offset in pixels
  };

  // Tile server URL (OpenStreetMap)
  const TILE_SERVER = "https://tile.openstreetmap.org";
  const TILE_SIZE = 256; // Standard tile size in pixels

  /**
   * Initialize canvas with proper DPR handling
   */
  function initCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.scale(dpr, dpr);
  }

  /**
   * Handle window resize
   */
  function handleResize() {
    initCanvas();
    renderMap();
  }

  // Initialize canvas on load
  window.addEventListener("resize", handleResize);
  initCanvas();

  /**
   * Convert latitude/longitude to tile coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} zoom - Zoom level
   * @returns {Object} Tile coordinates {x, y}
   */
  function latLonToTile(lat, lon, zoom) {
    const n = Math.pow(2, zoom);
    const x = Math.floor(((lon + 180) / 360) * n);
    const latRad = (lat * Math.PI) / 180;
    const y = Math.floor(
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
        n
    );
    return { x, y };
  }

  /**
   * Convert tile coordinates to latitude/longitude (top-left corner of tile)
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @param {number} zoom - Zoom level
   * @returns {Object} Latitude/longitude {lat, lon}
   */
  function tileToLatLon(x, y, zoom) {
    const n = Math.pow(2, zoom);
    const lon = (x / n) * 360 - 180;
    const latRad = Math.atan(
      Math.sinh(Math.PI * (1 - (2 * y) / n))
    );
    const lat = (latRad * 180) / Math.PI;
    return { lat, lon };
  }

  /**
   * Convert world coordinates (lat/lon) to pixel coordinates on canvas
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} zoom - Zoom level
   * @param {Object} center - Center point {lat, lon}
   * @param {Object} canvasSize - Canvas size {width, height}
   * @returns {Object} Pixel coordinates {x, y}
   */
  function latLonToPixel(lat, lon, zoom, center, canvasSize) {
    const centerTile = latLonToTile(center.lat, center.lon, zoom);
    const pointTile = latLonToTile(lat, lon, zoom);

    const centerPixelX = centerTile.x * TILE_SIZE + TILE_SIZE / 2;
    const centerPixelY = centerTile.y * TILE_SIZE + TILE_SIZE / 2;
    const pointPixelX = pointTile.x * TILE_SIZE + TILE_SIZE / 2;
    const pointPixelY = pointTile.y * TILE_SIZE + TILE_SIZE / 2;

    const offsetX = pointPixelX - centerPixelX;
    const offsetY = pointPixelY - centerPixelY;

    return {
      x: canvasSize.width / 2 + offsetX + state.panOffset.x,
      y: canvasSize.height / 2 + offsetY + state.panOffset.y,
    };
  }

  /**
   * Convert pixel coordinates on canvas to latitude/longitude
   * @param {number} pixelX - Pixel X coordinate
   * @param {number} pixelY - Pixel Y coordinate
   * @param {number} zoom - Zoom level
   * @param {Object} center - Center point {lat, lon}
   * @param {Object} canvasSize - Canvas size {width, height}
   * @returns {Object} Latitude/longitude {lat, lon}
   */
  function pixelToLatLon(pixelX, pixelY, zoom, center, canvasSize) {
    const centerTile = latLonToTile(center.lat, center.lon, zoom);
    const centerPixelX = centerTile.x * TILE_SIZE + TILE_SIZE / 2;
    const centerPixelY = centerTile.y * TILE_SIZE + TILE_SIZE / 2;

    const offsetX = pixelX - canvasSize.width / 2 - state.panOffset.x;
    const offsetY = pixelY - canvasSize.height / 2 - state.panOffset.y;

    const pointPixelX = centerPixelX + offsetX;
    const pointPixelY = centerPixelY + offsetY;

    const tileX = pointPixelX / TILE_SIZE;
    const tileY = pointPixelY / TILE_SIZE;

    return tileToLatLon(tileX, tileY, zoom);
  }

  /**
   * Load a tile image from the server
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @param {number} z - Zoom level
   * @returns {Promise<Image>} Promise that resolves to the tile image
   */
  async function loadTile(x, y, z) {
    const cacheKey = `${z}/${x}/${y}`;

    // Check cache first
    if (state.tileCache.has(cacheKey)) {
      return state.tileCache.get(cacheKey);
    }

    // Create new image
    const img = new Image();
    img.crossOrigin = "anonymous";

    const promise = new Promise((resolve, reject) => {
      img.onload = () => {
        state.tileCache.set(cacheKey, img);
        resolve(img);
      };
      img.onerror = () => {
        reject(new Error(`Failed to load tile ${cacheKey}`));
      };
    });

    // Start loading
    img.src = `${TILE_SERVER}/${z}/${x}/${y}.png`;

    return promise;
  }

  /**
   * Render map tiles on canvas
   */
  async function renderMap() {
    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;

    // Clear canvas
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const zoom = state.zoom;
    const centerTile = latLonToTile(state.center.lat, state.center.lon, zoom);

    // Calculate which tiles we need to render
    const tilesX = Math.ceil(canvasWidth / TILE_SIZE) + 2;
    const tilesY = Math.ceil(canvasHeight / TILE_SIZE) + 2;

    const startTileX = Math.floor(centerTile.x - tilesX / 2);
    const startTileY = Math.floor(centerTile.y - tilesY / 2);

    // Calculate offset for center tile
    const centerPixelX = centerTile.x * TILE_SIZE;
    const centerPixelY = centerTile.y * TILE_SIZE;
    const offsetX =
      canvasWidth / 2 -
      centerPixelX +
      (centerTile.x - Math.floor(centerTile.x)) * TILE_SIZE +
      state.panOffset.x;
    const offsetY =
      canvasHeight / 2 -
      centerPixelY +
      (centerTile.y - Math.floor(centerTile.y)) * TILE_SIZE +
      state.panOffset.y;

    // Load and render tiles
    const tilePromises = [];
    for (let ty = 0; ty < tilesY; ty++) {
      for (let tx = 0; tx < tilesX; tx++) {
        const tileX = startTileX + tx;
        const tileY = startTileY + ty;

        // Validate tile coordinates
        const maxTile = Math.pow(2, zoom);
        if (tileX < 0 || tileX >= maxTile || tileY < 0 || tileY >= maxTile) {
          continue;
        }

        const x = offsetX + tx * TILE_SIZE;
        const y = offsetY + ty * TILE_SIZE;

        // Only render if tile is visible
        if (x > -TILE_SIZE && x < canvasWidth && y > -TILE_SIZE && y < canvasHeight) {
          tilePromises.push(
            loadTile(tileX, tileY, zoom)
              .then((img) => {
                ctx.drawImage(img, x, y, TILE_SIZE, TILE_SIZE);
              })
              .catch((err) => {
                // Draw placeholder for failed tiles
                ctx.fillStyle = "#333";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = "#555";
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
              })
          );
        }
      }
    }

    // Wait for all tiles to load
    await Promise.all(tilePromises);
  }

  // Initial render
  renderMap();

  // Event listeners (placeholders for now)
  btnZoomIn.addEventListener("click", () => {
    console.log("Zoom in clicked");
  });

  btnZoomOut.addEventListener("click", () => {
    console.log("Zoom out clicked");
  });

  markerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("Form submitted");
  });

  btnCancelForm.addEventListener("click", () => {
    markerFormSection.classList.add("hidden");
    state.editingMarker = null;
    markerForm.reset();
  });

  btnExport.addEventListener("click", () => {
    console.log("Export clicked");
  });

  fileImport.addEventListener("change", (e) => {
    console.log("Import file selected");
  });

  // Canvas click handler (placeholder)
  canvas.addEventListener("click", (e) => {
    console.log("Canvas clicked");
  });

})();

