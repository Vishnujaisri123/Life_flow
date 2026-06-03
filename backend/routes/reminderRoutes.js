const express = require('express');
const {
  getReminders,
  getDueReminders,
  getReminderHistory,
  createReminder,
  updateReminder,
  deleteReminder,
  snoozeReminder,
  dismissReminder,
  markReminderRead,
  markTriggered,
} = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/history', getReminderHistory);
router.get('/due', getDueReminders);
router.get('/', getReminders);
router.post('/', createReminder);
router.patch('/:id/snooze', snoozeReminder);
router.patch('/:id/dismiss', dismissReminder);
router.patch('/:id/read', markReminderRead);
router.patch('/:id/trigger', markTriggered);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);

module.exports = router;
