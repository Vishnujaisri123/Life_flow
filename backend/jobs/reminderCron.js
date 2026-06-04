const Reminder = require('../models/Reminder');
const { isDue } = require('../controllers/reminderController');
const { sendPushToUser, isFirebaseConfigured } = require('../services/firebase');

async function processDueReminders() {
  const now = new Date();
  const candidates = await Reminder.find({
    status: { $in: ['pending', 'snoozed'] },
  }).populate('taskId', 'title description startTime endTime dueDate status fullscreenAlertEnabled soundEnabled vibrationEnabled');

  for (const reminder of candidates) {
    if (!isDue(reminder, now)) continue;

    reminder.status = 'triggered';
    reminder.triggeredAt = now;
    reminder.read = false;
    await reminder.save();

    if (isFirebaseConfigured()) {
      const taskTitle = reminder.taskId?.title || 'Task';
      await sendPushToUser(reminder.userId, {
        title: 'LifeFlow reminder',
        body: taskTitle,
        data: { 
          reminderId: reminder._id.toString(), 
          taskId: reminder.taskId?._id.toString() || '',
          fullscreenAlertEnabled: String(reminder.taskId?.fullscreenAlertEnabled || false),
          soundEnabled: String(reminder.taskId?.soundEnabled || false),
          vibrationEnabled: String(reminder.taskId?.vibrationEnabled || false)
        },
      }).catch((err) => {
        console.warn('[reminderCron] push failed:', err.message);
      });
    }
  }
}

function startReminderCron(intervalMs = 60_000) {
  const tick = () => {
    processDueReminders().catch((err) => {
      console.warn('[reminderCron]', err.message);
    });
  };
  tick();
  return setInterval(tick, intervalMs);
}

module.exports = { startReminderCron, processDueReminders };
