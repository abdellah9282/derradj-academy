// Service Worker – Derradj Academy
self.addEventListener("install", () => { self.skipWaiting(); });

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.map((name) => caches.delete(name))))
  );
  self.clients.claim();
});

// ===== Pomodoro background notification =====
let _pomTimer = null;

self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'POMODORO_START') {
    clearTimeout(_pomTimer);
    const delay    = Math.max(0, event.data.endTime - Date.now());
    const notifType = event.data.notifType; // 'study' | 'break'

    // event.waitUntil keeps the SW alive until the notification fires
    event.waitUntil(
      new Promise((resolve) => {
        _pomTimer = setTimeout(() => {
          const title = notifType === 'study'
            ? '⏱ انتهت فترة الدراسة!'
            : '⚡ انتهت فترة الراحة!';
          const body  = notifType === 'study'
            ? 'أحسنت! حان وقت الراحة – ارجع إلى Pomodoro لمتابعة الجلسة.'
            : 'أنت جاهز الآن لجولة دراسة جديدة! 💪';

          self.registration.showNotification(title, {
            body,
            icon : '/Logo.jpg',
            badge: '/Logo.jpg',
            vibrate: [250, 100, 250, 100, 250],
            tag  : 'pomodoro-alert',
            requireInteraction: false,
            data : { url: '/pomodoro.html' }
          }).then(resolve).catch(resolve);
        }, delay);
      })
    );
  }

  if (event.data.type === 'POMODORO_CANCEL') {
    clearTimeout(_pomTimer);
  }
});

// فتح صفحة Pomodoro عند الضغط على الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes('pomodoro') && 'focus' in client) return client.focus();
      }
      return clients.openWindow('/pomodoro.html');
    })
  );
});


