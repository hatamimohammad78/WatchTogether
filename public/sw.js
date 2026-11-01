const CACHE_NAME = "jahan-hasti-v2";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json",
  "/logo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // فقط درخواست‌های GET همین سایت.
  // ارتباط زنده‌ی Socket.IO (و هر POST) نباید از سرویس‌ورکر عبور کند؛
  // قبلاً این باعث خطا و قطع شدن‌های بی‌دلیل می‌شد.
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/socket.io/")) {
    return;
  }

  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});
