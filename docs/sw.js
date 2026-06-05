/* Service worker — Let's Build on AWS Together: Study Companion.
   Relative scope (registered as './sw.js'). Versioned caches.
   Shell: cache-first with background refresh. API: stale-while-revalidate.
   Always returns a Response; never an unhandled rejection. */
'use strict';

var SHELL_CACHE = 'llat-shell-v1';
var API_CACHE = 'llat-api-v1';
var KNOWN_CACHES = [SHELL_CACHE, API_CACHE];

var SHELL_ASSETS = [
  './',
  './index.html',
  './app.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function (cache) {
      // Add assets individually so one missing file (e.g. icons generated
      // later) does not fail the whole install.
      return Promise.all(SHELL_ASSETS.map(function (url) {
        return cache.add(url).catch(function () { /* skip missing asset */ });
      }));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (KNOWN_CACHES.indexOf(key) === -1) {
          return caches.delete(key);
        }
        return Promise.resolve(false);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function offlineResponse() {
  return new Response('You are offline and this content is not cached yet. Reconnect and reload.', {
    status: 503,
    headers: { 'Content-Type': 'text/plain' }
  });
}

function isApiRequest(url) {
  return url.pathname.indexOf('/api/') !== -1;
}

// Stale-while-revalidate for API JSON.
function handleApi(request) {
  return caches.open(API_CACHE).then(function (cache) {
    return cache.match(request).then(function (cached) {
      var network = fetch(request).then(function (response) {
        if (response && response.ok) {
          cache.put(request, response.clone()).catch(function () { /* quota */ });
        }
        return response;
      }).catch(function () {
        return null;
      });
      if (cached) {
        // Refresh in background; serve cached immediately.
        network.catch(function () { /* already handled */ });
        return cached;
      }
      return network.then(function (response) {
        return response || offlineResponse();
      });
    });
  }).catch(function () {
    return offlineResponse();
  });
}

// Cache-first with background update for the shell.
function handleShell(request) {
  return caches.open(SHELL_CACHE).then(function (cache) {
    return cache.match(request, { ignoreSearch: true }).then(function (cached) {
      var network = fetch(request).then(function (response) {
        if (response && response.ok) {
          cache.put(request, response.clone()).catch(function () { /* quota */ });
        }
        return response;
      }).catch(function () {
        return null;
      });
      if (cached) {
        network.catch(function () { /* noop */ });
        return cached;
      }
      return network.then(function (response) {
        if (response) return response;
        // Navigation fallback: serve cached index if available.
        if (request.mode === 'navigate') {
          return cache.match('./index.html').then(function (idx) {
            return idx || offlineResponse();
          });
        }
        return offlineResponse();
      });
    });
  }).catch(function () {
    return offlineResponse();
  });
}

self.addEventListener('fetch', function (event) {
  try {
    var request = event.request;
    if (request.method !== 'GET') return; // let non-GET pass through
    var url = new URL(request.url);
    if (url.origin !== self.location.origin) return; // never intercept cross-origin

    if (isApiRequest(url)) {
      event.respondWith(handleApi(request).catch(function () { return offlineResponse(); }));
    } else {
      event.respondWith(handleShell(request).catch(function () { return offlineResponse(); }));
    }
  } catch (e) {
    // If anything above throws synchronously, fall through to the network.
  }
});
