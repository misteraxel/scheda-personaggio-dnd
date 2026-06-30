const CACHE_NAME = 'dnd-scheda-v10'; 
const assets = ['index.html', 'style.css', 'data.js', 'logic.js', 'manifest.json', 'icon.png'];
// ... resto del codice sw.js invariato

// Installa il Service Worker e salva i file nella cache locale
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Intercetta le richieste e usa la cache anche se sei offline
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});