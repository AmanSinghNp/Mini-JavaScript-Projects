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
  const btnSelectStart = document.getElementById("btn-select-start");
  const btnSelectEnd = document.getElementById("btn-select-end");
  const btnClearSelection = document.getElementById("btn-clear-selection");
  const distanceResult = document.getElementById("distance-result");
  const distanceValue = distanceResult.querySelector(".distance-value");

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
    distanceMode: null, // 'start' or 'end' when selecting markers for distance
  };

  // Tile server URL (OpenStreetMap)
  const TILE_SERVER = "https://tile.openstreetmap.org";
  const TILE_SIZE = 256; // Standard tile size in pixels

  // LocalStorage keys
  const STORAGE_KEYS = {
    markers: "locationTracker_markers",
    mapState: "locationTracker_mapState",
  };

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

    // Render markers
    renderMarkers();

    // Render distance line if both markers selected
    if (state.distanceStart && state.distanceEnd) {
      renderDistanceLine();
    }
  }

  /**
   * Render all markers on the map
   */
  function renderMarkers() {
    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;

    state.markers.forEach((marker) => {
      const pixel = latLonToPixel(
        marker.lat,
        marker.lon,
        state.zoom,
        state.center,
        { width: canvasWidth, height: canvasHeight }
      );

      // Only render if marker is visible
      if (
        pixel.x < -20 ||
        pixel.x > canvasWidth + 20 ||
        pixel.y < -20 ||
        pixel.y > canvasHeight + 20
      ) {
        return;
      }

      // Draw marker pin
      const markerSize = 20;
      const isSelected = state.selectedMarker === marker.id;

      ctx.save();

      // Draw shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.arc(pixel.x + 1, pixel.y + markerSize + 1, markerSize / 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw pin body
      ctx.fillStyle = marker.color || "#3b82f6";
      ctx.beginPath();
      ctx.arc(pixel.x, pixel.y, markerSize / 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = isSelected ? "#fff" : "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // Draw inner circle
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(pixel.x, pixel.y, markerSize / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  /**
   * Render line between two markers for distance calculation
   */
  function renderDistanceLine() {
    if (!state.distanceStart || !state.distanceEnd) return;

    const startMarker = state.markers.find((m) => m.id === state.distanceStart);
    const endMarker = state.markers.find((m) => m.id === state.distanceEnd);

    if (!startMarker || !endMarker) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;

    const startPixel = latLonToPixel(
      startMarker.lat,
      startMarker.lon,
      state.zoom,
      state.center,
      { width: canvasWidth, height: canvasHeight }
    );

    const endPixel = latLonToPixel(
      endMarker.lat,
      endMarker.lon,
      state.zoom,
      state.center,
      { width: canvasWidth, height: canvasHeight }
    );

    ctx.save();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(startPixel.x, startPixel.y);
    ctx.lineTo(endPixel.x, endPixel.y);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Calculate distance between two lat/lon points using Haversine formula
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {Object} Distance in kilometers and miles
   */
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;
    const distanceMiles = distanceKm * 0.621371;

    return { km: distanceKm, miles: distanceMiles };
  }

  /**
   * Update distance display
   */
  function updateDistanceDisplay() {
    if (!state.distanceStart || !state.distanceEnd) {
      distanceResult.classList.add("hidden");
      return;
    }

    const startMarker = state.markers.find((m) => m.id === state.distanceStart);
    const endMarker = state.markers.find((m) => m.id === state.distanceEnd);

    if (!startMarker || !endMarker) {
      distanceResult.classList.add("hidden");
      return;
    }

    const distance = calculateDistance(
      startMarker.lat,
      startMarker.lon,
      endMarker.lat,
      endMarker.lon
    );

    distanceValue.textContent = `${distance.km.toFixed(2)} km (${distance.miles.toFixed(2)} miles)`;
    distanceResult.classList.remove("hidden");
  }

  /**
   * Create a new marker
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} name - Marker name
   * @param {string} note - Marker note
   * @param {string} color - Marker color
   * @returns {Object} Marker object
   */
  function createMarker(lat, lon, name = "", note = "", color = "#3b82f6") {
    return {
      id: `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lat,
      lon,
      name: name || `Location ${state.markers.length + 1}`,
      note,
      color,
      timestamp: Date.now(),
    };
  }

  /**
   * Save markers to localStorage
   */
  function saveMarkers() {
    try {
      localStorage.setItem(STORAGE_KEYS.markers, JSON.stringify(state.markers));
    } catch (error) {
      console.error("Failed to save markers:", error);
    }
  }

  /**
   * Load markers from localStorage
   */
  function loadMarkers() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.markers);
      if (saved) {
        state.markers = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load markers:", error);
      state.markers = [];
    }
  }

  /**
   * Save map state (center, zoom) to localStorage
   */
  function saveMapState() {
    try {
      const mapState = {
        center: state.center,
        zoom: state.zoom,
      };
      localStorage.setItem(STORAGE_KEYS.mapState, JSON.stringify(mapState));
    } catch (error) {
      console.error("Failed to save map state:", error);
    }
  }

  /**
   * Load map state from localStorage
   */
  function loadMapState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.mapState);
      if (saved) {
        const mapState = JSON.parse(saved);
        if (mapState.center && mapState.zoom) {
          state.center = mapState.center;
          state.zoom = Math.max(2, Math.min(18, mapState.zoom));
        }
      }
    } catch (error) {
      console.error("Failed to load map state:", error);
    }
  }

  /**
   * Add a marker to the map
   * @param {Object} marker - Marker object
   */
  function addMarker(marker) {
    state.markers.push(marker);
    saveMarkers();
    renderMap();
  }

  /**
   * Remove a marker from the map
   * @param {string} markerId - Marker ID
   */
  function removeMarker(markerId) {
    state.markers = state.markers.filter((m) => m.id !== markerId);
    if (state.selectedMarker === markerId) {
      state.selectedMarker = null;
    }
    if (state.editingMarker === markerId) {
      state.editingMarker = null;
      markerFormSection.classList.add("hidden");
    }
    saveMarkers();
    renderMap();
    renderLocationsList();
  }

  /**
   * Select a marker and center map on it
   * @param {string} markerId - Marker ID
   */
  function selectMarker(markerId) {
    const marker = state.markers.find((m) => m.id === markerId);
    if (marker) {
      state.selectedMarker = markerId;
      state.center = { lat: marker.lat, lon: marker.lon };
      state.panOffset = { x: 0, y: 0 };
      renderMap();
      renderLocationsList();
    }
  }

  /**
   * Edit a marker
   * @param {string} markerId - Marker ID
   */
  function editMarker(markerId) {
    const marker = state.markers.find((m) => m.id === markerId);
    if (marker) {
      state.editingMarker = markerId;
      markerNameInput.value = marker.name;
      markerNoteInput.value = marker.note;
      markerColorInput.value = marker.color;
      formTitle.textContent = "Edit Location";
      markerFormSection.classList.remove("hidden");
    }
  }

  /**
   * Render the locations list in the sidebar
   */
  function renderLocationsList() {
    locationsList.innerHTML = "";

    if (state.markers.length === 0) {
      const emptyMsg = document.createElement("li");
      emptyMsg.className = "empty-message";
      emptyMsg.textContent = "No locations saved. Click on the map to add one.";
      emptyMsg.style.padding = "12px";
      emptyMsg.style.color = "#999";
      emptyMsg.style.fontSize = "14px";
      emptyMsg.style.textAlign = "center";
      locationsList.appendChild(emptyMsg);
      return;
    }

    state.markers.forEach((marker) => {
      const li = document.createElement("li");
      li.className = "location-item";
      if (state.selectedMarker === marker.id) {
        li.classList.add("selected");
      }

      const header = document.createElement("div");
      header.className = "location-item-header";

      const nameSpan = document.createElement("span");
      nameSpan.className = "location-name";
      const colorDot = document.createElement("span");
      colorDot.className = "location-color";
      colorDot.style.backgroundColor = marker.color;
      nameSpan.appendChild(colorDot);
      nameSpan.appendChild(document.createTextNode(marker.name));
      header.appendChild(nameSpan);

      const actions = document.createElement("div");
      actions.className = "location-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "btn-icon";
      editBtn.textContent = "✏️";
      editBtn.title = "Edit";
      editBtn.onclick = (e) => {
        e.stopPropagation();
        editMarker(marker.id);
      };
      actions.appendChild(editBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn-icon delete";
      deleteBtn.textContent = "🗑️";
      deleteBtn.title = "Delete";
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm(`Delete "${marker.name}"?`)) {
          removeMarker(marker.id);
        }
      };
      actions.appendChild(deleteBtn);

      header.appendChild(actions);
      li.appendChild(header);

      const coords = document.createElement("div");
      coords.className = "location-coords";
      coords.textContent = `${marker.lat.toFixed(4)}, ${marker.lon.toFixed(4)}`;
      li.appendChild(coords);

      if (marker.note) {
        const note = document.createElement("div");
        note.className = "location-note";
        note.textContent = marker.note;
        li.appendChild(note);
      }

      li.onclick = () => {
        selectMarker(marker.id);
      };

      locationsList.appendChild(li);
    });
  }

  /**
   * Set zoom level and update map
   * @param {number} newZoom - New zoom level
   * @param {Object} focusPoint - Optional point to zoom towards {x, y} in pixels
   */
  function setZoom(newZoom, focusPoint = null) {
    const minZoom = 2;
    const maxZoom = 18;
    newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));

    if (focusPoint) {
      // Zoom towards a specific point
      const dpr = window.devicePixelRatio || 1;
      const canvasWidth = canvas.width / dpr;
      const canvasHeight = canvas.height / dpr;

      // Get the lat/lon of the focus point before zoom
      const focusLatLon = pixelToLatLon(
        focusPoint.x,
        focusPoint.y,
        state.zoom,
        state.center,
        { width: canvasWidth, height: canvasHeight }
      );

      state.zoom = newZoom;

      // Adjust center so focus point stays in same place
      const newFocusPixel = latLonToPixel(
        focusLatLon.lat,
        focusLatLon.lon,
        state.zoom,
        state.center,
        { width: canvasWidth, height: canvasHeight }
      );

      const deltaX = focusPoint.x - newFocusPixel.x;
      const deltaY = focusPoint.y - newFocusPixel.y;

      // Convert pixel delta to lat/lon delta
      const deltaLatLon = pixelToLatLon(
        canvasWidth / 2 + deltaX,
        canvasHeight / 2 + deltaY,
        state.zoom,
        state.center,
        { width: canvasWidth, height: canvasHeight }
      );

      state.center.lat = deltaLatLon.lat;
      state.center.lon = deltaLatLon.lon;
      state.panOffset.x = 0;
      state.panOffset.y = 0;
    } else {
      state.zoom = newZoom;
    }

    renderMap();
  }

  /**
   * Pan the map by pixel offset
   * @param {number} deltaX - X offset in pixels
   * @param {number} deltaY - Y offset in pixels
   */
  function panMap(deltaX, deltaY) {
    state.panOffset.x += deltaX;
    state.panOffset.y += deltaY;

    // If pan offset gets too large, update center and reset offset
    const threshold = TILE_SIZE;
    if (
      Math.abs(state.panOffset.x) > threshold ||
      Math.abs(state.panOffset.y) > threshold
    ) {
      const dpr = window.devicePixelRatio || 1;
      const canvasWidth = canvas.width / dpr;
      const canvasHeight = canvas.height / dpr;

      // Convert pan offset to lat/lon change
      const newCenter = pixelToLatLon(
        canvasWidth / 2 - state.panOffset.x,
        canvasHeight / 2 - state.panOffset.y,
        state.zoom,
        state.center,
        { width: canvasWidth, height: canvasHeight }
      );

      state.center = newCenter;
      state.panOffset.x = 0;
      state.panOffset.y = 0;
    }

    saveMapState();
    renderMap();
  }

  // Initialize: Load saved data
  loadMarkers();
  loadMapState();

  // Initial render
  renderMap();
  renderLocationsList();

  // Pan functionality - Mouse drag
  canvas.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return; // Only left mouse button
    state.isDragging = true;
    state.dragStart.x = e.clientX;
    state.dragStart.y = e.clientY;
    canvas.style.cursor = "grabbing";
  });

  canvas.addEventListener("mousemove", (e) => {
    if (state.isDragging) {
      const deltaX = e.clientX - state.dragStart.x;
      const deltaY = e.clientY - state.dragStart.y;
      state.dragStart.x = e.clientX;
      state.dragStart.y = e.clientY;
      panMap(deltaX, deltaY);
    }
  });

  canvas.addEventListener("mouseup", () => {
    if (state.isDragging) {
      state.isDragging = false;
      canvas.style.cursor = "crosshair";
    }
  });

  canvas.addEventListener("mouseleave", () => {
    if (state.isDragging) {
      state.isDragging = false;
      canvas.style.cursor = "crosshair";
    }
  });

  // Zoom functionality - Mouse wheel
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    const rect = canvas.getBoundingClientRect();
    const focusPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setZoom(state.zoom + delta, focusPoint);
  });

  // Zoom buttons
  btnZoomIn.addEventListener("click", () => {
    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;
    setZoom(state.zoom + 1, {
      x: canvasWidth / 2,
      y: canvasHeight / 2,
    });
  });

  btnZoomOut.addEventListener("click", () => {
    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;
    setZoom(state.zoom - 1, {
      x: canvasWidth / 2,
      y: canvasHeight / 2,
    });
  });

  // Form handlers
  markerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!state.editingMarker) return;

    const marker = state.markers.find((m) => m.id === state.editingMarker);
    if (marker) {
      marker.name = markerNameInput.value.trim() || `Location ${state.markers.length}`;
      marker.note = markerNoteInput.value.trim();
      marker.color = markerColorInput.value;
      saveMarkers();
      renderMap();
      renderLocationsList();
    }

    markerFormSection.classList.add("hidden");
    state.editingMarker = null;
    markerForm.reset();
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

  // Distance calculator handlers
  btnSelectStart.addEventListener("click", () => {
    state.distanceMode = "start";
    canvas.style.cursor = "pointer";
    btnSelectStart.style.background = "#3b82f6";
    btnSelectStart.style.color = "#fff";
    btnSelectEnd.style.background = "";
    btnSelectEnd.style.color = "";
  });

  btnSelectEnd.addEventListener("click", () => {
    state.distanceMode = "end";
    canvas.style.cursor = "pointer";
    btnSelectEnd.style.background = "#3b82f6";
    btnSelectEnd.style.color = "#fff";
    btnSelectStart.style.background = "";
    btnSelectStart.style.color = "";
  });

  btnClearSelection.addEventListener("click", () => {
    state.distanceStart = null;
    state.distanceEnd = null;
    state.distanceMode = null;
    canvas.style.cursor = "crosshair";
    btnSelectStart.style.background = "";
    btnSelectStart.style.color = "";
    btnSelectEnd.style.background = "";
    btnSelectEnd.style.color = "";
    updateDistanceDisplay();
    renderMap();
  });

  // Canvas click handler - Place marker
  let clickTimeout;
  canvas.addEventListener("click", (e) => {
    // Clear any existing timeout
    clearTimeout(clickTimeout);

    // Small delay to distinguish from drag end
    clickTimeout = setTimeout(() => {
      if (state.isDragging) {
        // Don't place marker if we just finished dragging
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const canvasWidth = canvas.width / dpr;
      const canvasHeight = canvas.height / dpr;

      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Convert click to lat/lon
      const latLon = pixelToLatLon(
        clickX,
        clickY,
        state.zoom,
        state.center,
        { width: canvasWidth, height: canvasHeight }
      );

      // Check if clicking on existing marker
      let clickedMarker = null;
      for (const marker of state.markers) {
        const pixel = latLonToPixel(
          marker.lat,
          marker.lon,
          state.zoom,
          state.center,
          { width: canvasWidth, height: canvasHeight }
        );
        const distance = Math.sqrt(
          Math.pow(clickX - pixel.x, 2) + Math.pow(clickY - pixel.y, 2)
        );
        if (distance < 15) {
          clickedMarker = marker;
          break;
        }
      }

      if (clickedMarker) {
        // Check if in distance selection mode
        if (state.distanceMode === "start") {
          state.distanceStart = clickedMarker.id;
          state.distanceMode = null;
          updateDistanceDisplay();
          renderMap();
          return;
        } else if (state.distanceMode === "end") {
          state.distanceEnd = clickedMarker.id;
          state.distanceMode = null;
          updateDistanceDisplay();
          renderMap();
          return;
        }

        // Select existing marker
        state.selectedMarker =
          state.selectedMarker === clickedMarker.id ? null : clickedMarker.id;
        renderMap();
      } else {
        // Create new marker
        const newMarker = createMarker(latLon.lat, latLon.lon);
        addMarker(newMarker);

      // Open form to edit marker
      state.editingMarker = newMarker.id;
      markerNameInput.value = newMarker.name;
      markerNoteInput.value = newMarker.note;
      markerColorInput.value = newMarker.color;
      formTitle.textContent = "Add Location";
      markerFormSection.classList.remove("hidden");
      renderLocationsList();
      }
    }, 100);
  });

})();

