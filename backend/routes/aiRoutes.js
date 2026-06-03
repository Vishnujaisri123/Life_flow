const express = require('express');
const { protect } = require('../middleware/auth');
const { aiRateLimit } = require('../middleware/aiRateLimit');
const { postChat, getHistory, clearHistory } = require('../controllers/aiController');
const aiController = require('../controllers/aiController');

const router = express.Router();

router.use(protect);
router.use(aiRateLimit);

router.post('/chat', aiController.postChat);
router.post('/action/confirm', aiController.confirmAction);
router.get('/history', aiController.getHistory);
router.delete('/history', aiController.clearHistory);

module.exports = router;
