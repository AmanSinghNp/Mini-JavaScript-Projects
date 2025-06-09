/**
 * Service Worker for Weather App
 * Provides offline functionality and caching
 */

const CACHE_NAME = "weather-app-v1";
const STATIC_FILES = [
  ".",
  "index.html",
  "styles.css",
  "app.js",
  "manifest.json",
  "icons/clear.svg",
  "icons/cloud.svg",
  "icons/overcast.svg",
  "icons/rain.svg",
  "icons/snow.svg",
  "icons/thunder.svg",
  "icons/mist.svg",
  "assets/Sunny.png",
  "assets/Cloudy.png",
  "assets/Overcast.png",
  "assets/Rain.png",
  "assets/Snow.png",
  "assets/Thunder.png",
  "assets/Mist.png",
];

// Install event - cache static files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Handle API requests with stale-while-revalidate
  if (
    request.url.includes("api.open-meteo.com") ||
    request.url.includes("geocoding-api.open-meteo.com")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              // Update cache with fresh data
              cache.put(request, networkResponse.clone());
              return networkResponse;
            })
            .catch(() => {
              // If network fails, return cached response if available
              return cachedResponse;
            });

          // Return cached response immediately if available, otherwise wait for network
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Handle static files - cache first
  event.respondWith(
    caches
      .match(request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(request);
      })
      .catch(() => {
        // If offline and no cache, return offline page
        if (request.mode === "navigate") {
          return caches.match("index.html");
        }
      })
  );
});
