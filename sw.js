const CACHE_NAME = 'pump-turbo-v3'; // ⚡ อัพเกรดเป็น v3 เพื่อบังคับให้เครื่องพนักงานทุกคนเคลียร์ระบบเก่าทิ้งทันที
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'icon.png'
];

// ติดตั้งและบันทึกโครงสร้างหน้าเว็บลงเครื่องพนักงาน
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

// ⚡ ฟังก์ชันกรองสัญญาณสำหรับมือถือ (แยกสัญญาณเน็ตและหน่วยความจำออกจากกันเด็ดขาด)
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // ถ้าคำขอเป็นสคริปต์ดึงข้อมูลจาก Google Sheets (คำสั่ง POST จากหน้าเว็บ)
  if (e.request.method === 'POST' || url.includes('script.google.com')) {
    e.respondWith(
      // พุ่งตัวไปดึงข้อมูลจาก Google Sheets ทันที ไม่ต้องแวะเช็คไฟล์แคชให้ช้าค้าง
      fetch(e.request).catch(() => {
        // หากอินเทอร์เน็ตมือถือหลุดถาวร ค่อยสั่งเปิดตรรกะหน้าต่างสำรอง
        return caches.match(e.request);
      })
    );
    return;
  }

  // สำหรับหน้าตาเว็บ, รูปภาพไอคอน, ฟอนต์สไตล์ ให้โหลดจากเครื่องทันที (สปีด 0 วินาที)
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return fetch(e.request);
    })
  );
});
