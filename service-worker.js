const CACHE_NAME = 'goal-tracker-v1';
const urlsToCache = [
  '/',
  '/Untitled-2.html',
  '/Untitled-3.css',
  '/Untitled-4.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
}); 