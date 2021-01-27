/* 
 * Author: Samuel Lippett
 * Project: COMP3000 Coursework
 */


// Install 
self.addEventListener('install', function(event) {
    console.log("install");
});

// Activate 
self.addEventListener('activate', function(event) {
    console.log("activate");
});

// Listen for network requests from the main document
self.addEventListener('fetch', function(event) {
    console.log("fetch");
});