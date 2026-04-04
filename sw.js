/* ═══════════════════════════════════════════════════════════
   DIUSF — sw.js  v2.1
   Estrategia: network-first para HTML, cache-first para assets
   Para forzar update en producción: bump CACHE_VERSION
═══════════════════════════════════════════════════════════ */
'use strict';

const CACHE_VERSION = 'diusf-v2.1';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;

const PRECACHE_URLS = [
  '/index.html',
  '/css/diusf.css',
  '/js/unicode.js',
  '/js/app.js',
  '/manifest.json'
];

/* Install — pre-cachea y toma control sin esperar */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* Activate — elimina caches de versiones anteriores */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== STATIC_CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* Fetch — network-first HTML, cache-first assets */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          caches.open(STATIC_CACHE).then(c => c.put(event.request, res.clone()));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const net = fetch(event.request).then(res => {
          if (res && res.status === 200)
            caches.open(STATIC_CACHE).then(c => c.put(event.request, res.clone()));
          return res;
        });
        return cached || net;
      })
    );
  }
});

/* Acepta mensaje para forzar update desde la app */
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
