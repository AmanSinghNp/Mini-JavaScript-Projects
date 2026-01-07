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
    center: { lat: 0, lon: 0 }, // Map center (lat/lon)
    zoom: 3, // Zoom level (2-18)
    markers: [], // Array of marker objects
    selectedMarker: null, // Currently selected marker ID
    editingMarker: null, // Marker being edited
    isDragging: false, // Pan state
    dragStart: { x: 0, y: 0 }, // Drag start position
    tileCache: new Map(), // Cached tile images
    distanceStart: null, // Start marker for distance calculation
    distanceEnd: null, // End marker for distance calculation
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

  // Placeholder for map rendering (will be implemented in Phase 2)
  function renderMap() {
    // Clear canvas
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
    
    // Placeholder text
    ctx.fillStyle = "#666";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "Map rendering will be implemented in Phase 2",
      canvas.width / (2 * (window.devicePixelRatio || 1)),
      canvas.height / (2 * (window.devicePixelRatio || 1))
    );
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

