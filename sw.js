// ⚡️ نولّد اسم كاش ديناميكي باستخدام التاريخ (اليوم والشهر والسنة)
const CACHE_NAME = "derradj-academy-cache-" + new Date().toISOString().slice(0,10);

// ✅ الملفات الأساسية اللي تنحفظ أول مرة
const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/manifest.json",
  "/js/search.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// 📌 تثبيت Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // ⚡️ تفعيل النسخة الجديدة مباشرة
});

// 📌 تفعيل وإزالة الكاش القديم
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// 📌 جلب الملفات: شبكة أولاً ولو فشل → كاش
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
