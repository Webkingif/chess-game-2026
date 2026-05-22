const CACHE_NAME = 'chess-v1';
const ASSETS_TO_CACHE = [
    './',
    'index.html',
    'style.css',
    'app.js',
    'manifest.json',
    'icons/icon-192.png',
    'icons/icon-512.png'
    // Add paths to your chess piece images or sound effects here!
];

// Install Event: Caching game assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching chess assets...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Fetch Event: Serving cached files when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return the cached file if found, otherwise request it from the network
            return cachedResponse || fetch(event.request);
        })
    );
});