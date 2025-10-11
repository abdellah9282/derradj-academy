// تم تعطيل خدمة التخزين المؤقت للموقع (Service Worker)
// هذا الملف موجود فقط لإلغاء التسجيل السابق
self.addEventListener("install", () => {
  self.skipWaiting();
});


self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.map((name) => caches.delete(name))))
  );
  self.clients.claim();
});


