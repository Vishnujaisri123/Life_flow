const express = require('express');
const { registerFcmToken, sendTestPush } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/fcm-token', registerFcmToken);
router.post('/test-push', sendTestPush);

module.exports = router;
