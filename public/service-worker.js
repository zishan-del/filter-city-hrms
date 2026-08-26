const CACHE='filter-city-hrms-app-v1';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/','/index.html','/public/manifest.webmanifest','/public/app.js'])));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)))})
