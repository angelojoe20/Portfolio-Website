const CACHE = "angelo-portfolio-v3";
const ASSETS = [
  "/",
  "/index.html",
  "/assets/style.css",
  "/assets/script.js",
  "/images/icon.png",
  "/images/picture.png",
  "/images/angelo.png",
  "/images/down.png",
  "/images/linkedin.png",
  "/images/github.png",
  "/images/instagram.png",
  "/pdfs/AngeloJ_CV.pdf"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put("/index.html", clone));
          return res;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  e.respondWith(
    fetch(e.request).then((res) => {
      if (new URL(e.request.url).origin === location.origin) {
        const clone = res.clone();
        caches.open(CACHE).then((cache) => cache.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
