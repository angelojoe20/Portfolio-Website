const CACHE = "angelo-portfolio-v1";
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
  e.respondWith(
    caches.match(e.request).then((cached) =>
      cached || fetch(e.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((cache) => cache.put(e.request, clone));
        return res;
      })
    ).catch(() => caches.match("/index.html"))
  );
});
