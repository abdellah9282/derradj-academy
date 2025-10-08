// ⚡️ إنشاء اسم كاش ديناميكي مع تاريخ اليوم
const CACHE_NAME = "derradj-academy-cache-" + new Date().toISOString().slice(0, 10);

// ✅ الملفات الأساسية التي يتم تخزينها أول مرة
const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/manifest.json",
  "/js/search.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// 📌 التثبيت: تخزين الملفات الأساسية
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .catch((err) => console.error("⚠️ فشل تحميل الملفات:", err))
  );
  self.skipWaiting(); // تفعيل النسخة الجديدة فورًا
});

// 📌 التفعيل: حذف الكاش القديم
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// 📌 الجلب: استراتيجية ذكية (Cache First مع تحديث لاحق)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => cachedResponse);

      // ⚡️ إذا عندنا نسخة من الكاش، رجّعها فورًا لتسريع التحميل
      return cachedResponse || fetchPromise;
    })
  );
});
