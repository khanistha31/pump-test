const CACHE_NAME = 'pump-instant-v4'; // อัปเกรดเป็น v4 บังคับลบหน่วยความจำอืดในมือถือออก
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'icon.png'
];

// สั่งเซฟหน้าเว็บและดีไซน์ทั้งหมดลงในเครื่องพนักงานทันทีตั้งแต่ตอนติดตั้ง
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ⚡ ตรรกะเปิดปุ๊บติดปั๊บ: ทรัพยากรแอปทั้งหมดดึงจากเครื่องพนักงานโดยตรง ไม่ใช้อินเทอร์เน็ต
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // สำหรับการเชื่อมต่อข้อมูล API ของ Google Sheets ให้พุ่งตรงไปหาเครือข่ายอินเทอร์เน็ตทันที
  if (e.request.method === 'POST' || url.includes('script.google.com')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // โหลดหน้ากากเว็บสปีด 0 วินาที จาก Cache ในเครื่องก่อนเสมอ
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
