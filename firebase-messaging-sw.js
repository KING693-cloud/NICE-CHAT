// firebase-messaging-sw.js

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/12.5.0/firebase-messaging.js');

// Initialize Firebase in Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyB0UlT0KzzDfBchubvm5noKk7k4UlH52VM",
  authDomain: "nice-chat-aaee5.firebaseapp.com",
  projectId: "nice-chat-aaee5",
  storageBucket: "nice-chat-aaee5.appspot.com",
  messagingSenderId: "717368271513",
  appId: "1:717368271513:web:47452e93114b7c502dce08"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[SW] Background message received', payload);

  const notificationTitle = payload.notification?.title || "New message";
  const notificationOptions = {
    body: payload.notification?.body || "You received a new message",
    icon: './images(1).jpeg', // Your single image
    silent: false
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);

  // Play notification sound in all open clients
  const soundUrl = 'https://actions.google.com/sounds/v1/alarms/medium_bell_ring.ogg';
  const playSound = async () => {
    try {
      const clientsList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      clientsList.forEach(client => {
        client.postMessage({ action: 'playSound', url: soundUrl });
      });
    } catch(e) {
      console.warn("Unable to play background sound", e);
    }
  };
  playSound();
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        return clientList[0].focus(); // Focus already open tab
      }
      return clients.openWindow('./index.html'); // Open homepage
    })
  );
});

// Optional: cache the app shell for offline support
const CACHE_NAME = 'nice-chat-cache-v1';
const urlsToCache = [
  './index.html',
  './manifest.json',
  './images(1).jpeg',
  './groups.html',
  './group-manager.html'
  // Add other HTML/CSS/JS files here
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});