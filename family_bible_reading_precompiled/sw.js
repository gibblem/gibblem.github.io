self.addEventListener('install', e=>{
  e.waitUntil(caches.open('fbr-v3').then(c=>c.addAll([
    './','./index.html','./manifest.json',
    'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css'
  ])));
});
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
});