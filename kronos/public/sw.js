// Service Worker for KRONOS SYNC PWA
const CACHE_NAME = 'kronos-sync-v1'
const urlsToCache = [
    '/',
    '/artist',
    '/kiosk',
    '/offline'
]

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    )
})

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone response and cache it
                const responseToCache = response.clone()
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache)
                })
                return response
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(event.request)
                    .then((response) => response || caches.match('/offline'))
            })
    )
})

// Activate event - Clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName)
                    }
                })
            )
        })
    )
})
