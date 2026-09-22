/* ===============================
   3タップルールズ Service Worker
   =============================== */

const CACHE_NAME = "3tap-v13-hd-guides";

/* キャッシュ対象ファイル */
const urlsToCache = [
  "./",
  "./index.html",
  "./basic_rules.html",
  "./basic_rules.json",

  "./rules.html",
  "./rule.html",
  "./rule_detail.html",
  "./favorites.html",

  "./rules.json",

  "./style.css",
  "./assets/rule-guides.js?v=20260922-hd2",
  "./assets/rule-guides.css?v=20260922-hd2",

  "./home-icon.png",
  "./book-icon.png",
  "./star-icon.png",
  "./hoshi.png",
  "./hoshi-4.png"
];

/* ---------- install ---------- */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

/* ---------- activate ---------- */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/* ---------- fetch ---------- */
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  const isFreshContent =
    request.mode === "navigate" ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith(".json");

  if (isFreshContent) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(r => r || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      });
    })
  );
});
