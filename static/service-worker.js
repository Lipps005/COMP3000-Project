/* 
 * Author: Samuel Lippett
 * Project: COMP3000 Coursework
 */

var version = 'v3:4:1';
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
self.addEventListener('fetch', function(event) {
    if(event.request.method !=="GET")
    {
        return;
    }
    event.respondWith(caches.match(event.request)//promise that resolves into a cache entry we can serve to the response.
    .then(function(cached) {
        var networked = fetch(event.request)//still go to network as well to produce an 'eventually fresh' reponse
        .then(fetchedFromNetwork, unableToResolve).catch(unableToResolve);

        console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
        return cached || networked;

        function fetchedFromNetwork(response) {
            var cacheCopy = response.clone();
            //create a copy of the reponse to store in cache

            console.log('WORKER: fetch response from network.', event.request.url);


                caches // We open a cache to store the response for this request.
                .open(version + 'pages').then(function add(cache) {
                    cache.put(event.request, cacheCopy);
                }).then(function() {
                    console.log('WORKER: fetch response stored in cache.', event.request.url);
                });


            return response;
        }

        //this function is called when we a reponse was unavailable from either the cache or
        //the network. 

    }));
});

function unableToResolve() {
    /* There's a couple of things we can do here.
                  - Test the Accept header and then return one of the `offlineFundamentals`
                  e.g: `return caches.match('/some/cached/image.png')`
                  - You should also consider the origin. It's easier to decide what
                  "unavailable" means for requests against your origins than for requests
                  against a third party.
                  - Generate a Response programmaticaly, as shown below, and return that
                  */

    console.log('WORKER: fetch request failed in both cache and network.');

    /* Here we're creating a response programmatically. The first parameter is the
                  response body, and the second one defines the options for the response.
                  */
    return new Response('<h1>Service Unavailable</h1>',{
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
            'Content-Type': 'text/html'
        })
    });
    notifyOffline();
}
