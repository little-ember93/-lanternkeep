const CACHE_NAME = "lanternkeep-shell-v1-3-1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./grove.html",
  "./styles.css",
  "./app.js",
  "./grove.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./resident_daisy_icon.png",
  "./resident_silas_icon.png",
  "./resident_mallow_icon.png",
  "./resident_reggie_icon.png",
  "./resident_daisy_idle.png",
  "./resident_silas_idle.png",
  "./resident_mallow_idle.png",
  "./resident_reggie_idle.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
