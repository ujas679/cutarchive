// sw.js (root ma mukho)
const CACHE_NAME = 'cut-archive-gallery-v1';
const IMG_EXT = /\.(avif|webp|jpg|jpeg|png)$/i;

self.addEventListener('install', (e) => self.skipWaiting());

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

    // only GET requests
    if (request.method !== 'GET') return;

    // only images + photos.json
    if (!IMG_EXT.test(url.pathname) && !url.pathname.endsWith('/gallery/photos.json')) return;

    e.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const hit = await cache.match(request, { ignoreVary: true });
        if (hit) return hit;

        try {
            const res = await fetch(request, { cache: 'no-store' });
            if (res.ok) cache.put(request, res.clone());
            return res;
        } catch (err) {
            // offline fallback for photos.json
            if (url.pathname.endsWith('/gallery/photos.json')) {
                return new Response('[]', {
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            return new Response('', { status: 504 });
        }
    })());
});
