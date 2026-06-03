/* LifeFlow FCM service worker — background push handler */
importScripts("https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js");

let messaging = null;

async function initFirebase() {
  try {
    const res = await fetch("/firebase-config.json");
    if (!res.ok) return false;
    const config = await res.json();
    if (!config?.apiKey || !config?.projectId) return false;
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      const title = payload.notification?.title || "LifeFlow";
      const options = {
        body: payload.notification?.body || "",
        icon: "/favicon.ico",
        data: payload.data || {},
      };
      self.registration.showNotification(title, options);
    });
    return true;
  } catch (e) {
    console.warn("[fcm-sw] init skipped:", e);
  }
  return false;
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
  event.waitUntil(initFirebase());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) return clients[0].focus();
      return self.clients.openWindow("/app/notifications");
    }),
  );
});
