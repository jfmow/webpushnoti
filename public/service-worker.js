const CACHE_NAME = 'color-update-v1.1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll([
          '/', // Add the URLs of your static assets here
          '/favicon.ico',
          '/manifest.json',
          // Include other static assets such as images, icons, etc.
        ]);
      })
      .then(() => {
        console.log('Service worker installed');
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.filter((name) => {
            return name !== CACHE_NAME;
          }).map((name) => {
            return caches.delete(name);
          })
        );
      })
      .then(() => {
        console.log('Service worker activated');
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // Serve the cached version if available
        }
        return fetch(event.request); // Otherwise, fetch from the network
      })
  );
});

self.addEventListener('push', (event) => {
  let notification = event.data.json();
  self.registration.showNotification(
    notification.title, 
    notification.options
  );
});
