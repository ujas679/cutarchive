// Tiny cache-first SW for gallery images
const CACHE_NAME = 'ca-gallery-v1';
const IMG_EXT = /\.(avif|webp|jpg|jpeg|png)$/i;

self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    const { request } = e;
    const url = new URL(request.url);

    // Only handle GET image requests (gallery thumbs or full-res)
    if (request.method !== 'GET') return;
    if (!IMG_EXT.test(url.pathname)) return;

    e.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const hit = await cache.match(request, { ignoreVary: true });
        if (hit) return hit;

        try {
            const res = await fetch(request, { cache: 'no-store' });
            // clone & store if OK
            if (res.ok) cache.put(request, res.clone());
            return res;
        } catch (err) {
            // offline fallback: show nothing (or you could return a tiny placeholder)
            return new Response('', { status: 504 });
        }
    })());
});
