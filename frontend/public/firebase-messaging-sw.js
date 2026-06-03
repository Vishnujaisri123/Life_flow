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
      const data = payload.data || {};
      
      const options = {
        body: payload.notification?.body || "",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        data: data,
        // Sound files mapped from the payload, fallback to default
        sound: data.soundType ? `/sounds/${data.soundType}.mp3` : "/sounds/chime.mp3",
        // Interactive PWA notification buttons
        actions: [
          { action: "complete", title: "Complete ✅" },
          { action: "snooze", title: "Snooze 15m ⏰" },
          { action: "open", title: "Open Task 📂" }
        ],
        // Keep active until user interacts
        requireInteraction: true
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
  
  const action = event.action;
  const data = event.notification.data || {};
  const taskId = data.taskId;
  const reminderId = data.reminderId;

  event.waitUntil(
    (async () => {
      // 1. Get cached credentials & API URL
      const cache = await caches.open("auth-cache");
      const tokenRes = await cache.match("/token");
      const apiUrlRes = await cache.match("/api-url");
      
      const token = tokenRes ? await tokenRes.text() : null;
      const apiUrl = apiUrlRes ? await apiUrlRes.text() : "https://life-flow-t4xe.onrender.com/api";
      
      if (!token) {
        // If user is not authenticated, fallback to opening the app
        return focusOrOpenWindow("/tasks");
      }

      if (action === "complete" && taskId) {
        // 2. Perform background task completion
        await fetch(`${apiUrl}/tasks/${taskId}/complete`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        // 3. Dismiss the triggering reminder
        if (reminderId) {
          await fetch(`${apiUrl}/reminders/${reminderId}/dismiss`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
        }
      } else if (action === "snooze" && reminderId) {
        // 4. Perform background reminder snooze (15 mins)
        await fetch(`${apiUrl}/reminders/${reminderId}/snooze`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ minutes: 15 })
        });
      } else {
        // 5. Default click or "open" action redirects to the task list
        return focusOrOpenWindow("/tasks");
      }
    })()
  );
});

async function focusOrOpenWindow(url) {
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  if (clients.length > 0) {
    return clients[0].focus();
  }
  return self.clients.openWindow(url);
}
