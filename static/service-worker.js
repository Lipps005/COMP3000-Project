/* 
 * Author: Samuel Lippett
 * Project: COMP3000 Coursework
 */

var version = 'v3:7:1';
const regex = new RegExp("/localhost:5000/newimage");

// Install 
self.addEventListener('install', function(event) {
    console.log('WORKER: install event in progress.');
    event.waitUntil(caches.open(version + 'pages').then(function(cache) {
        return cache.addAll(['/app', '/css/app.css', 'appmain.js']);
    }).then(function() {
        console.log('WORKER: install completed');
    }));
});

// Activate 
self.addEventListener('activate', function(event) {
    event.waitUntil(caches /* This method returns a promise which will resolve to an array of available
            cache keys.
            */
    .keys().then(function(keys) {
        // We return a promise that settles when all outdated caches are deleted.
        return Promise.all(keys.filter(function(key) {
            // Filter by keys that don't start with the latest version prefix.
            return !key.startsWith(version);
        }).map(function(key) {
            /* Return a promise that's fulfilled
                          when each outdated cache is deleted.
                          */
            return caches.delete(key);
        }));
    }).then(function() {
        console.log('WORKER: activate completed.');
    }));
});

// Listen for network requests from the main document
self.addEventListener('fetch', async function(event) {

    //if request method is POST, don't look in cache, and don't store the result in cache. 
    //However, we still want the same process to occur if there was an error completing the request.
    var response;

    async function storeInCache(response) {
        var cacheCopy = response.clone();
        caches // We open a cache to store the response for this request.
        .open(version + 'pages').then(function add(cache) {
            cache.put(event.request, cacheCopy);
        }).then(function() {
            console.log('WORKER: fetch response stored in cache.', event.request.url);
        });

        return response;
    }
    
    async function fetchedFromNetwork(response)
    {
        if(event.request.method !== "POST")
        {
           await storeInCache(response); 
        }

        return response;
    }

event.respondWith(
    caches
      /* This method returns a promise that resolves to a cache entry matching
         the request. Once the promise is settled, we can then provide a response
         to the fetch request.
      */
      .match(event.request)
      .then(function(cached) {
    

    var networked = fetch(event.request) 
      .then(fetchedFromNetwork, unableToResolve)
      .catch(unableToResolve);

      console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
    return cached || networked;
      })
     );

});

function unableToResolve() {

    console.log('WORKER: fetch request failed in both cache and network.');
    return new Response('<h1>Service Unavailable</h1>',{
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
            'Content-Type': 'text/html'
        })
    });
}
