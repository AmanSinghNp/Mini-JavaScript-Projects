/**
 * Weather App - Vanilla JavaScript Implementation
 * Modern glass-morphism design with offline capability and time-based theming
 */

(function () {
  "use strict";

  // API Configuration - Open-Meteo (No API key required!)
  // Enhanced with is_day parameter for accurate theme detection and UV index data
  const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
  const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";

  // Theme Management
  const THEME_MODES = {
    AUTO: "auto",
    LIGHT: "light",
    DARK: "dark",
  };

  const THEME_CONFIG = {
    LIGHT_START_HOUR: 6, // 6:00 AM
    LIGHT_END_HOUR: 18, // 6:00 PM
    CHECK_INTERVAL: 60000, // Check every minute
  };

  // Weather condition to icon mapping (Open-Meteo weather codes)
  const ICON_MAP = {
    0: "clear", // Clear sky
    1: "clear", // Mainly clear
    2: "cloud", // Partly cloudy
    3: "overcast", // Overcast
    45: "mist", // Fog
    48: "mist", // Depositing rime fog
    51: "rain", // Drizzle light
    53: "rain", // Drizzle moderate
    55: "rain", // Drizzle dense
    56: "rain", // Freezing drizzle light
    57: "rain", // Freezing drizzle dense
    61: "rain", // Rain slight
    63: "rain", // Rain moderate
    65: "rain", // Rain heavy
    66: "rain", // Freezing rain light
    67: "rain", // Freezing rain heavy
    71: "snow", // Snow fall slight
    73: "snow", // Snow fall moderate
    75: "snow", // Snow fall heavy
    77: "snow", // Snow grains
    80: "rain", // Rain showers slight
    81: "rain", // Rain showers moderate
    82: "rain", // Rain showers violent
    85: "snow", // Snow showers slight
    86: "snow", // Snow showers heavy
    95: "thunder", // Thunderstorm slight/moderate
    96: "thunder", // Thunderstorm with slight hail
    99: "thunder", // Thunderstorm with heavy hail
  };

  // CSS gradients for different weather conditions (primary backgrounds)
  const BACKGROUND_GRADIENTS = {
    clear: "linear-gradient(135deg, #fdcb6e 0%, #e17055 50%, #fdcb6e 100%)",
    cloud: "linear-gradient(135deg, #74b9ff 0%, #0984e3 30%, #74b9ff 100%)",
    overcast: "linear-gradient(135deg, #636e72 0%, #2d3436 30%, #636e72 100%)",
    rain: "linear-gradient(135deg, #636e72 0%, #2d3436 50%, #636e72 100%)",
    snow: "linear-gradient(135deg, #ddd6fe 0%, #a78bfa 50%, #ddd6fe 100%)",
    thunder: "linear-gradient(135deg, #2d3436 0%, #636e72 30%, #2d3436 100%)",
    mist: "linear-gradient(135deg, #a7b8c4 0%, #7f8c8d 30%, #a7b8c4 100%)",
  };

  // Default city and app state
  const DEFAULT_CITY = { name: "London", lat: 51.5072, lon: -0.1276 };

  const state = {
    current: DEFAULT_CITY,
    saved: JSON.parse(localStorage.getItem("cities") || "[]"),
    dataCache: new Map(),
    weatherData: null, // Store current weather data including timezone
    searchTimeout: null,
    theme: {
      mode: localStorage.getItem("themeMode") || THEME_MODES.AUTO,
      checkInterval: null,
    },
  };

  // DOM Elements
  const $ = (id) => document.getElementById(id);
  const searchInput = $("searchInput");
  const searchForm = $("searchForm");
  const searchResults = $("searchResults");
  const savedList = $("savedList");
  const cityName = $("cityName");
  const temp = $("temp");
  const heroIcon = $("heroIcon");
  const condition = $("condition");
  const datetime = $("datetime");
  const feelsLike = $("feelsLike");
  const humidity = $("humidity");
  const wind = $("wind");
  const pressure = $("pressure");
  const uvIndex = $("uvIndex");
  const hourlyForecast = $("hourlyForecast");
  const hourlyTpl = $("hourlyTpl");
  const hero = $("hero");
  const themeToggle = $("themeToggle");
  const themeIcon = themeToggle.querySelector(".theme-icon");
  const themeText = themeToggle.querySelector(".theme-text");

  /**
   * Theme Management Functions
   */

  /**
   * Get the appropriate theme based on API day/night data or fallback to time calculation
   * @param {boolean} isDay - API is_day parameter (optional)
   * @returns {string} 'light' or 'dark'
   */
  function getTimeBasedTheme(isDay = null) {
    // Use API's is_day parameter if available (most accurate)
    if (isDay !== null) {
      return isDay ? THEME_MODES.LIGHT : THEME_MODES.DARK;
    }

    // Fallback to user's local time if API data not available yet
    const hour = new Date().getHours();
    return hour >= THEME_CONFIG.LIGHT_START_HOUR &&
      hour < THEME_CONFIG.LIGHT_END_HOUR
      ? THEME_MODES.LIGHT
      : THEME_MODES.DARK;
  }

  /**
   * Apply theme to the document
   * @param {string} theme - Theme to apply ('light' or 'dark')
   */
  function applyTheme(theme) {
    const body = document.body;

    // Remove existing theme classes
    body.classList.remove("light-mode", "dark-mode");

    // Apply new theme class
    if (theme === THEME_MODES.LIGHT) {
      body.classList.add("light-mode");
    } else {
      body.classList.add("dark-mode");
    }
  }

  /**
   * Update theme toggle button appearance
   */
  function updateThemeToggle() {
    const { mode } = state.theme;

    switch (mode) {
      case THEME_MODES.AUTO:
        // Try to get current theme using API data if available
        const isDay = state.weatherData?.current_weather?.is_day;
        const currentTheme = getTimeBasedTheme(isDay);
        themeIcon.textContent =
          currentTheme === THEME_MODES.LIGHT ? "☀️" : "🌙";
        themeText.textContent = "Auto";
        break;
      case THEME_MODES.LIGHT:
        themeIcon.textContent = "☀️";
        themeText.textContent = "Light";
        break;
      case THEME_MODES.DARK:
        themeIcon.textContent = "🌙";
        themeText.textContent = "Dark";
        break;
    }
  }

  /**
   * Set theme mode and update everything
   * @param {string} mode - Theme mode to set
   */
  function setThemeMode(mode) {
    state.theme.mode = mode;
    localStorage.setItem("themeMode", mode);

    if (mode === THEME_MODES.AUTO) {
      startAutoThemeCheck();
      const isDay = state.weatherData?.current_weather?.is_day;
      applyTheme(getTimeBasedTheme(isDay));
    } else {
      stopAutoThemeCheck();
      applyTheme(mode);
    }

    updateThemeToggle();
  }

  /**
   * Start automatic theme checking based on time
   */
  function startAutoThemeCheck() {
    if (state.theme.checkInterval) {
      clearInterval(state.theme.checkInterval);
    }

    state.theme.checkInterval = setInterval(() => {
      if (state.theme.mode === THEME_MODES.AUTO) {
        const isDay = state.weatherData?.current_weather?.is_day;
        const newTheme = getTimeBasedTheme(isDay);
        applyTheme(newTheme);
        updateThemeToggle();
      }
    }, THEME_CONFIG.CHECK_INTERVAL);
  }

  /**
   * Stop automatic theme checking
   */
  function stopAutoThemeCheck() {
    if (state.theme.checkInterval) {
      clearInterval(state.theme.checkInterval);
      state.theme.checkInterval = null;
    }
  }

  /**
   * Cycle through theme modes
   */
  function cycleThemeMode() {
    const modes = [THEME_MODES.AUTO, THEME_MODES.LIGHT, THEME_MODES.DARK];
    const currentIndex = modes.indexOf(state.theme.mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
  }

  /**
   * Initialize theme system
   */
  function initTheme() {
    // Set initial theme
    if (state.theme.mode === THEME_MODES.AUTO) {
      startAutoThemeCheck();
      applyTheme(getTimeBasedTheme());
    } else {
      applyTheme(state.theme.mode);
    }

    updateThemeToggle();

    // Add theme toggle event listener
    themeToggle.addEventListener("click", cycleThemeMode);

    // Add keyboard shortcut (T key)
    document.addEventListener("keydown", (e) => {
      if (
        e.key.toLowerCase() === "t" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        // Only if not typing in an input field
        if (!["INPUT", "TEXTAREA"].includes(e.target.tagName)) {
          e.preventDefault();
          cycleThemeMode();
        }
      }
    });
  }

  /**
   * Fetch weather data with caching
   * @param {Object} city - City object with lat, lon
   * @returns {Promise<Object>} Weather data
   */
  async function fetchWeather({ lat, lon }) {
    const key = `${lat},${lon}`;
    const cached = state.dataCache.get(key);

    // Return cache if less than 15 minutes old
    if (cached && Date.now() - cached.timestamp < 900000) {
      return cached.data;
    }

    try {
      const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        hourly:
          "temperature_2m,weathercode,relativehumidity_2m,windspeed_10m,surface_pressure,apparent_temperature,uv_index,is_day",
        daily: "sunrise,sunset,uv_index_max",
        current_weather: "true",
        timezone: "auto",
        forecast_days: "1", // Only need 1 day since we show 12 hours
      });

      const response = await fetch(`${WEATHER_URL}?${params}`);

      if (!response.ok) throw new Error("Weather API failed");

      const data = await response.json();
      state.dataCache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error("Weather fetch error:", error);
      return null;
    }
  }

  /**
   * Get weather description from weather code
   * @param {number} code - Weather code
   * @returns {string} Weather description
   */
  function getWeatherDescription(code) {
    const descriptions = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      56: "Light freezing drizzle",
      57: "Dense freezing drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      66: "Light freezing rain",
      67: "Heavy freezing rain",
      71: "Slight snow fall",
      73: "Moderate snow fall",
      75: "Heavy snow fall",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail",
    };
    return descriptions[code] || "Unknown";
  }

  /**
   * Choose background gradient based on weather condition
   * @param {number} conditionCode - Weather condition code
   * @returns {string} CSS background gradient
   */
  function chooseBackground(conditionCode) {
    const iconName = ICON_MAP[conditionCode] || "clear";
    return BACKGROUND_GRADIENTS[iconName] || BACKGROUND_GRADIENTS.clear;
  }

  /**
   * Render current weather data
   * @param {Object} data - Weather API response
   */
  function renderWeather(data) {
    if (!data || !data.current_weather || !data.hourly) return;

    const current = data.current_weather;
    const hourly = data.hourly;
    const daily = data.daily;

    // Update current weather
    temp.textContent = `${Math.round(current.temperature)}°`;
    condition.textContent = getWeatherDescription(current.weathercode);
    cityName.textContent = state.current.name;

    // Set weather icon
    const weatherCode = current.weathercode;
    const iconName = ICON_MAP[weatherCode] || "clear";

    heroIcon.src = `icons/${iconName}.svg`;
    heroIcon.alt = getWeatherDescription(weatherCode);

    // Set hero background
    setHeroBackground(weatherCode);

    // Update theme based on API is_day data (most accurate)
    if (state.theme.mode === THEME_MODES.AUTO) {
      const newTheme = getTimeBasedTheme(current.is_day);
      applyTheme(newTheme);
      updateThemeToggle();
    }

    // Update date/time
    updateDateTime();

    // Render weather details using current weather + hourly + daily data
    renderWeatherDetails(current, hourly, daily);

    // Render hourly forecast (next 12 hours)
    renderHourlyForecast(hourly);
  }

  /**
   * Set hero background based on weather condition
   * @param {number} code - Weather condition code
   */
  function setHeroBackground(code) {
    const background = chooseBackground(code);
    hero.style.backgroundImage = background;
  }

  /**
   * Update date and time display using API timezone
   */
  function updateDateTime() {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    // Use timezone from API if available for accurate local time
    if (state.weatherData?.timezone) {
      options.timeZone = state.weatherData.timezone;
    }

    datetime.textContent = now.toLocaleDateString("en-US", options);
    datetime.dateTime = now.toISOString();
  }

  /**
   * Get UV level description based on UV index
   * @param {number} uvIndex - UV index value
   * @returns {string} UV level description
   */
  function getUVLevel(uvIndex) {
    if (uvIndex < 3) return "Low";
    if (uvIndex < 6) return "Moderate";
    if (uvIndex < 8) return "High";
    if (uvIndex < 11) return "Very High";
    return "Extreme";
  }

  /**
   * Render weather details
   * @param {Object} current - Current weather data
   * @param {Object} hourly - Hourly weather data
   * @param {Object} daily - Daily weather data
   */
  function renderWeatherDetails(current, hourly, daily) {
    // Get current hour data for additional metrics
    const currentHourIndex = 0; // First hour is current

    feelsLike.textContent = `${Math.round(
      hourly.apparent_temperature[currentHourIndex]
    )}°`;
    humidity.textContent = `${hourly.relativehumidity_2m[currentHourIndex]}%`;
    wind.textContent = `${Math.round(current.windspeed)} km/h`;
    pressure.textContent = `${Math.round(
      hourly.surface_pressure[currentHourIndex]
    )} hPa`;

    // UV Index with descriptive text
    const currentUV =
      hourly.uv_index?.[currentHourIndex] || daily?.uv_index_max?.[0] || 0;
    const uvLevel = getUVLevel(currentUV);
    uvIndex.textContent = `${Math.round(currentUV)} (${uvLevel})`;
  }

  /**
   * Render hourly forecast
   * @param {Object} hourlyData - Hourly weather data object
   */
  function renderHourlyForecast(hourlyData) {
    hourlyForecast.innerHTML = "";

    // Get next 12 hours of data
    const hours = hourlyData.time.slice(0, 12);

    hours.forEach((timeStr, index) => {
      const clone = hourlyTpl.content.cloneNode(true);
      const date = new Date(timeStr);

      clone.querySelector(".hourTime").textContent =
        index === 0 ? "Now" : `${date.getHours()}:00`;
      clone.querySelector(".hourTemp").textContent = `${Math.round(
        hourlyData.temperature_2m[index]
      )}°`;

      const weatherCode = hourlyData.weathercode[index];
      const iconName = ICON_MAP[weatherCode] || "clear";
      const iconEl = clone.querySelector(".hourIcon");
      iconEl.src = `icons/${iconName}.svg`;
      iconEl.alt = getWeatherDescription(weatherCode);

      hourlyForecast.appendChild(clone);
    });
  }

  /**
   * Search for cities using geocoding API
   * @param {string} query - Search query
   */
  async function searchCities(query) {
    if (!query.trim()) {
      searchResults.innerHTML = "";
      return;
    }

    try {
      const params = new URLSearchParams({
        name: query,
        count: 5,
        language: "en",
        format: "json",
      });

      const response = await fetch(`${GEO_URL}?${params}`);
      const data = await response.json();

      searchResults.innerHTML = "";
      if (data.results) {
        data.results.forEach((city) => {
          const li = document.createElement("li");
          li.textContent = `${city.name}, ${city.country}`;
          li.onclick = () =>
            selectCity({
              name: city.name,
              lat: city.latitude,
              lon: city.longitude,
              country: city.country,
            });
          searchResults.appendChild(li);
        });
      }
    } catch (error) {
      console.error("City search error:", error);
    }
  }

  /**
   * Select a city and load its weather
   * @param {Object} city - City object with name, lat, lon
   */
  async function selectCity(city) {
    state.current = city;

    // Clear search
    searchInput.value = "";
    searchResults.innerHTML = "";

    // Add to saved cities if not already saved (add to beginning of list)
    if (
      !state.saved.find(
        (saved) => saved.lat === city.lat && saved.lon === city.lon
      )
    ) {
      state.saved.unshift(city); // Add to beginning instead of end
      saveCities();
      renderSavedCities();
    }

    const data = await fetchWeather(city);
    if (data) {
      state.weatherData = data; // Store weather data including timezone
      renderWeather(data);
    }
  }

  /**
   * Remove a city from saved cities
   * @param {Object} city - City object to remove
   */
  function removeCity(city) {
    state.saved = state.saved.filter(
      (saved) => !(saved.lat === city.lat && saved.lon === city.lon)
    );
    saveCities();
    renderSavedCities();
  }

  /**
   * Render saved cities list
   */
  function renderSavedCities() {
    savedList.innerHTML = "";
    state.saved.forEach((city) => {
      const li = document.createElement("li");

      const citySpan = document.createElement("span");
      citySpan.textContent = city.name;
      citySpan.onclick = () => selectCity(city);
      li.appendChild(citySpan);

      // Add remove button
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "×";
      removeBtn.className = "remove-city";
      removeBtn.title = `Remove ${city.name}`;
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        removeCity(city);
      };
      li.appendChild(removeBtn);

      // Highlight current active city
      if (
        state.current &&
        city.lat === state.current.lat &&
        city.lon === state.current.lon
      ) {
        li.classList.add("active");
      }

      savedList.appendChild(li);
    });
  }

  /**
   * Save cities to localStorage
   */
  function saveCities() {
    localStorage.setItem("cities", JSON.stringify(state.saved));
  }

  /**
   * Initialize the application
   */
  async function init() {
    // Initialize theme system first
    initTheme();

    // Set up event listeners

    // Search functionality with debouncing
    searchInput.oninput = (e) => {
      clearTimeout(state.searchTimeout);
      state.searchTimeout = setTimeout(() => searchCities(e.target.value), 300);
    };

    searchForm.onsubmit = (e) => e.preventDefault();

    // Initialize saved cities
    renderSavedCities();

    // Load initial weather
    const data = await fetchWeather(state.current);
    if (data) {
      state.weatherData = data; // Store weather data including timezone
      renderWeather(data);
    }

    // Update time periodically
    setInterval(updateDateTime, 60000);
  }

  // Start the app when DOM is ready
  document.addEventListener("DOMContentLoaded", init);

  // Register service worker if available
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(console.error);
  }

  // Cleanup when page is unloaded
  window.addEventListener("beforeunload", () => {
    stopAutoThemeCheck();
  });
})(); // End IIFE
