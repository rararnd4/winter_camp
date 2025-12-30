// Firebase Messaging Service Worker
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDkECs59wxMt6F-iOTScuGOx9sReF9iKI4",
  authDomain: "winter-came.firebaseapp.com",
  projectId: "winter-came",
  storageBucket: "winter-came.firebasestorage.app",
  messagingSenderId: "1044069050826",
  appId: "1:1044069050826:web:e9af770b733f7e66184733"
});

const messaging = firebase.messaging();

// 백그라운드 메시지 수신
messaging.onBackgroundMessage((payload) => {
  console.log("백그라운드 메시지 수신:", payload);

  self.registration.showNotification(
    payload.notification?.title || "재난 알림",
    {
      body: payload.notification?.body || "새로운 알림이 있습니다.",
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      vibrate: [200, 100, 200]
    }
  );
});

// 알림 클릭 핸들러
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
