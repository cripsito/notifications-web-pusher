self.addEventListener('install', function (event) {
  self.registration.showNotification('Bienvenido', {
    body: 'Gracias por permitirnos enviar notificaciones.',
    icon: '/path/to/icon.png',
  });
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  const title = 'Título de la notificación';
  const options = {
    body: 'Este es el cuerpo de la notificación',
    icon: './vercel.svg',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('https://ejemplo.com'));
});
