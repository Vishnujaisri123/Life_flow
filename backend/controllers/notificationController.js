const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const { validateFcmTokenBody } = require('../utils/validation');
const { sendPushToUser, isFirebaseConfigured } = require('../services/firebase');

async function registerFcmToken(req, res, next) {
  try {
    const errors = validateFcmTokenBody(req.body);
    if (errors.length) {
      return sendError(res, { message: errors.join(', '), statusCode: 400 });
    }

    const { token } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, { message: 'User not found', statusCode: 404 });
    }

    if (!user.fcmTokens.includes(token)) {
      user.fcmTokens.push(token);
      if (user.fcmTokens.length > 20) {
        user.fcmTokens = user.fcmTokens.slice(-20);
      }
      await user.save();
    }

    const pushEnabled = isFirebaseConfigured();

    return sendSuccess(res, {
      message: pushEnabled
        ? 'FCM token registered'
        : 'FCM token stored (push disabled until Firebase is configured)',
      data: {
        registered: true,
        pushEnabled,
        tokenCount: user.fcmTokens.length,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function sendTestPush(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return sendSuccess(res, {
        message: 'Firebase not configured — token stored only',
        data: { sent: false, reason: 'missing_credentials' },
      });
    }

    const result = await sendPushToUser(req.user._id, {
      title: 'LifeFlow test',
      body: 'Push notifications are working.',
    });

    return sendSuccess(res, {
      message: result.sent ? 'Test push sent' : 'No tokens or send failed',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { registerFcmToken, sendTestPush };
