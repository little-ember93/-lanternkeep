const CACHE_NAME = "lanternkeep-shell-v150";

const APP_SHELL = [
  "./",
  "./index.html",
  "./grove.html",
  "./styles-v141.css",
  "./app-v141.js",
  "./grove-v141.js",
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
  "./keep_pond_morning.webp",
  "./keep_pond_afternoon.webp",
  "./keep_pond_evening.webp",
  "./keep_pond_night.webp",
  "./grove_stage_1_baby.webp",
  "./grove_stage_2_young.webp",
  "./grove_stage_3_flourishing.webp",
  "./grove_stage_4_grand.webp",
  "./lanternkeep_title_v150.png",
  "./gratitude_grove_title_v150.png",
  "./gratitude_date_tag_v150.png",
  "./gratitude_leaf_01_v150.png",
  "./gratitude_leaf_02_v150.png",
  "./gratitude_leaf_03_v150.png",
  "./gratitude_leaf_04_v150.png",
  "./gratitude_leaf_05_v150.png",
  "./gratitude_leaf_06_v150.png",
  "./gratitude_leaf_07_v150.png",
  "./gratitude_leaf_08_v150.png"
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
