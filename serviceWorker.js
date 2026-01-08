/* ===============================
   3タップルールズ Service Worker
   =============================== */

const CACHE_NAME = "3tap-v10";

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
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        // HTML / JSON は動的にキャッシュ更新
        if (
          event.request.url.endsWith(".html") ||
          event.request.url.endsWith(".json")
        ) {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }

        return networkResponse;
      });
    }).catch(() => {
      // オフライン時の最低限フォールバック
      if (event.request.destination === "document") {
        return caches.match("./index.html");
      }
    })
  );
});
