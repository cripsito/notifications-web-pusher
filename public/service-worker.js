self.addEventListener('push', (event) => {
  const data = event.data.json();

  const title = data.title || 'Default Title';
  const options = {
    body: data.body || 'Default Message',
    icon: data.icon || '/default-icon.png',
    badge: data.badge || '/default-badge.png',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
});
