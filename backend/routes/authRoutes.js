const express = require('express');
const {
  signup,
  login,
  getMe,
  updateMe,
  initiateGoogleAuth,
  googleAuthCallback,
  getGoogleStatus,
  disconnectGoogle
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

// Google OAuth routes
router.get('/google', protect, initiateGoogleAuth);
router.get('/google/callback', googleAuthCallback);
router.get('/google/status', protect, getGoogleStatus);
router.post('/google/disconnect', protect, disconnectGoogle);

module.exports = router;
