const CACHE_NAME = "lanternkeep-shell-v140";

const APP_SHELL = [
  "./",
  "./index.html",
  "./grove.html",
  "./styles-v140.css",
  "./app-v140.js",
  "./grove-v140.js",
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
  "./resident_reggie_idle_v132.png",
  "./assets/scenes/keep_pond_morning.webp",
  "./assets/scenes/keep_pond_afternoon.webp",
  "./assets/scenes/keep_pond_evening.webp",
  "./assets/scenes/keep_pond_night.webp",
  "./assets/grove/grove_stage_1_baby.webp",
  "./assets/grove/grove_stage_2_young.webp",
  "./assets/grove/grove_stage_3_flourishing.webp",
  "./assets/grove/grove_stage_4_grand.webp"
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
