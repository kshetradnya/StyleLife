/* ============================================================
   StyleScroll — Service Worker
   ============================================================ */

const CACHE_NAME = 'StyleScroll-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/auth.html',
    '/studio.html',
    '/ar.html',
    '/feed.html',
    '/creator.html',
    '/messages.html',
    '/profile.html',
    '/author.html',
    '/css/main.css',
    '/css/landing.css',
    '/css/auth.css',
    '/css/studio.css',
    '/css/ar.css',
    '/css/feed.css',
    '/css/creator.css',
    '/css/messages.css',
    '/css/profile.css',
    '/css/author.css',
    '/js/app.js',
    '/js/landing.js',
    '/js/auth.js',
    '/js/studio.js',
    '/js/ar.js',
    '/js/feed.js',
    '/js/creator.js',
    '/js/messages.js',
    '/js/profile.js',
    '/js/author.js',
    '/manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((res) => res || fetch(e.request))
    );
});
