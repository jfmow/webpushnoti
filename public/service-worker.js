self.addEventListener('install', (event) => {
  event.waitUntil(
    // Perform any necessary installation steps here
    // (e.g., caching static assets)
    console.log('Service worker installed')
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Perform any necessary activation steps here
    // (e.g., clearing old caches)
    console.log('Service worker activated')
  );
});

self.addEventListener('push', (event) => {
  let notification = event.data.json();
  self.registration.showNotification(
    notification.title, 
    notification.options
  );
});
