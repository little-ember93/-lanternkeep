const CACHE_NAME = "lanternkeep-shell-v132";

const APP_SHELL = [
  "./",
  "./index.html",
  "./grove.html",
  "./styles-v132.css",
  "./app-v132.js",
  "./grove.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./resident_daisy_icon_v132.png",
  "./resident_silas_icon_v132.png",
  "./resident_mallow_icon_v132.png",
  "./resident_reggie_icon_v132.png",
  "./resident_daisy_idle_v132.png",
  "./resident_silas_idle_v132.png",
  "./resident_mallow_idle_v132.png",
  "./resident_reggie_idle_v132.png"
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
  if (event.request.method !== "GET") return;

  const isPage =
    event.request.mode === "navigate" ||
    event.request.destination === "document";

  if (isPage) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
