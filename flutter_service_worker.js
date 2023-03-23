'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "flutter.js": "a85fcf6324d3c4d3ae3be1ae4931e9c5",
"main.dart.js": "cd0333c1c05ec1c42cab455c00c487e2",
"canvaskit/profiling/canvaskit.js": "c21852696bc1cc82e8894d851c01921a",
"canvaskit/profiling/canvaskit.wasm": "371bc4e204443b0d5e774d64a046eb99",
"canvaskit/canvaskit.js": "97937cb4c2c2073c968525a3e08c86a3",
"canvaskit/canvaskit.wasm": "3de12d898ec208a5f31362cc00f09b9e",
"favicon-16x16.png": "151e1a8f2557d58308b7976bb9285c12",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"version.json": "8b3f4fdcd84e6356d7b7bd2bd07bf9a1",
"manifest.json": "9913aa1f7f6d9fc92564ea2a81d530e3",
"assets/AssetManifest.json": "553f4c5e5c4401f3d9c9bb602ad898e2",
"assets/assets/yarn/apartment.yarn": "86e08ba398f31dfedad3d1b7e5f39d76",
"assets/assets/yarn/start.yarn": "70607a2d1dbe59d92b95646734ce1d3f",
"assets/assets/yarn/cafe.yarn": "f950b08e005135ded09ea116f4177d78",
"assets/assets/images/apartment.webp": "d478a717b207ab9a15bcac08688ab0e7",
"assets/assets/images/guy_smile.webp": "a15184b261ccef74327ca22a27e3425a",
"assets/assets/images/guy_surprised.webp": "c64e6245632f8788a5e58bbfe87cef13",
"assets/assets/images/cafe.webp": "c905d38ee1c084f9706210a16b453168",
"assets/assets/images/girl_smile.webp": "fc60264e50b272451387fba233c819ec",
"assets/assets/images/girl_head.webp": "a912209aef77202c55c802ab4ed439dc",
"assets/assets/images/girl.webp": "0328d6054d200f6b13fe42754762d73e",
"assets/assets/images/girl_suprised.webp": "cb40fbfa5fd3655a18089599624f412f",
"assets/assets/images/futon.webp": "ab80c4fed2da8497b9b93141afec835c",
"assets/assets/images/guy.webp": "b4152cb5eb39739892cc4b74df0e2ed6",
"assets/assets/images/train.webp": "762db52f52b2872e1931879cc0f98449",
"assets/assets/images/restaurant.webp": "0a15057b33e24dfd3b83c3263d9a89f5",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/NOTICES": "6990fb32c59be8f36dd4aa98b7c4267a",
"index.html": "abc27baec0a4a5c0599ccd23716a84a8",
"/": "abc27baec0a4a5c0599ccd23716a84a8",
"icons/favicon-32x32.png": "29990fc80f3e9d916e23695c00ef3cc1",
"icons/favicon-16x16.png": "151e1a8f2557d58308b7976bb9285c12",
"icons/site.webmanifest": "053100cb84a50d2ae7f5492f7dd7f25e",
"icons/favicon.ico": "3fad25093cabda68e13258a95b07742a",
"icons/android-chrome-192x192.png": "1ac6229760cce7bbcfbd1360f249e6d3",
"icons/apple-touch-icon.png": "1f2ba066ba2ba621eefc6aadda82a842",
"icons/android-chrome-512x512.png": "d3c0cd271ee7da9a9dd628321bff4a40",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
