let admin = null;
let messaging = null;

function isFirebaseConfigured() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
  );
}

function getMessaging() {
  if (!isFirebaseConfigured()) return null;
  if (messaging) return messaging;

  try {
    // eslint-disable-next-line global-require
    admin = require('firebase-admin');
  } catch {
    console.warn('[firebase] firebase-admin not installed — run: npm install firebase-admin');
    return null;
  }

  if (!admin.apps.length) {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }

  messaging = admin.messaging();
  return messaging;
}

async function sendPushToUser(userId, { title, body, data = {} }) {
  const User = require('../models/User');
  const user = await User.findById(userId);
  if (!user?.fcmTokens?.length) {
    return { sent: false, reason: 'no_tokens' };
  }

  const msg = getMessaging();
  if (!msg) {
    return { sent: false, reason: 'firebase_not_configured' };
  }

  const tokens = [...new Set(user.fcmTokens)];
  const response = await msg.sendEachForMulticast({
    tokens,
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)]),
    ),
  });

  return {
    sent: response.successCount > 0,
    successCount: response.successCount,
    failureCount: response.failureCount,
  };
}

module.exports = { isFirebaseConfigured, getMessaging, sendPushToUser };
