const Reminder = require('../models/Reminder');
const ReminderHistory = require('../models/ReminderHistory');
const Task = require('../models/Task');
const { sendSuccess, sendError } = require('../utils/response');
const { validateReminderBody, validateSnoozeBody } = require('../utils/validation');

async function assertTaskOwnership(taskId, userId) {
  return Task.findOne({ _id: taskId, userId });
}

function effectiveDueTime(reminder) {
  if (reminder.status === 'snoozed' && reminder.snoozeUntil) {
    return new Date(reminder.snoozeUntil);
  }
  return new Date(reminder.reminderTime);
}

function isDue(reminder, now = new Date()) {
  if (reminder.status === 'dismissed') return false;
  if (reminder.status === 'pending' || reminder.status === 'snoozed' || reminder.status === 'triggered') {
    return effectiveDueTime(reminder) <= now;
  }
  return false;
}

async function recordHistory(reminder, extra = {}) {
  return ReminderHistory.create({
    reminderId: reminder._id,
    taskId: reminder.taskId,
    userId: reminder.userId,
    triggeredAt: reminder.triggeredAt || new Date(),
    dismissedAt: reminder.dismissedAt || null,
    snoozedCount: reminder.snoozedCount || 0,
    soundType: reminder.soundType,
    notificationType: reminder.notificationType,
    ...extra,
  });
}

async function getReminders(req, res, next) {
  try {
    const filter = { userId: req.user._id };
    if (req.query.taskId) filter.taskId = req.query.taskId;
    if (req.query.status) filter.status = req.query.status;

    const reminders = await Reminder.find(filter)
      .populate('taskId', 'title fullscreenAlertEnabled soundEnabled vibrationEnabled')
      .sort({ reminderTime: 1 });
    return sendSuccess(res, { message: 'Reminders fetched', data: reminders });
  } catch (error) {
    return next(error);
  }
}

async function getDueReminders(req, res, next) {
  try {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + 60_000);

    const candidates = await Reminder.find({
      userId: req.user._id,
      status: { $in: ['pending', 'snoozed', 'triggered'] },
    }).populate('taskId', 'title fullscreenAlertEnabled soundEnabled vibrationEnabled');

    const due = candidates.filter((r) => {
      const t = effectiveDueTime(r);
      return t <= windowEnd;
    });

    return sendSuccess(res, { message: 'Due reminders', data: due });
  } catch (error) {
    return next(error);
  }
}

async function getReminderHistory(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const history = await ReminderHistory.find({ userId: req.user._id })
      .sort({ triggeredAt: -1 })
      .limit(limit)
      .populate('taskId', 'title fullscreenAlertEnabled soundEnabled vibrationEnabled');
    return sendSuccess(res, { message: 'Reminder history', data: history });
  } catch (error) {
    return next(error);
  }
}

async function createReminder(req, res, next) {
  try {
    const errors = validateReminderBody(req.body);
    if (errors.length) {
      return sendError(res, { message: errors.join(', '), statusCode: 400 });
    }

    const task = await assertTaskOwnership(req.body.taskId, req.user._id);
    if (!task) {
      return sendError(res, { message: 'Task not found', statusCode: 404 });
    }

    const reminder = await Reminder.create({
      taskId: req.body.taskId,
      userId: req.user._id,
      reminderTime: new Date(req.body.reminderTime),
      soundType: req.body.soundType || 'chime',
      notificationType: req.body.notificationType || 'in_app',
      status: 'pending',
      read: false,
    });

    if (req.body.reminderEnabled !== false) {
      task.reminderEnabled = true;
      await task.save();
    }

    return sendSuccess(res, {
      message: 'Reminder created',
      data: reminder,
      statusCode: 201,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateReminder(req, res, next) {
  try {
    const errors = validateReminderBody(req.body, { partial: true });
    if (errors.length) {
      return sendError(res, { message: errors.join(', '), statusCode: 400 });
    }

    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!reminder) {
      return sendError(res, { message: 'Reminder not found', statusCode: 404 });
    }

    if (req.body.reminderTime) reminder.reminderTime = new Date(req.body.reminderTime);
    if (req.body.soundType) reminder.soundType = req.body.soundType;
    if (req.body.notificationType) reminder.notificationType = req.body.notificationType;
    if (req.body.status) reminder.status = req.body.status;
    if (req.body.read !== undefined) reminder.read = Boolean(req.body.read);

    await reminder.save();
    return sendSuccess(res, { message: 'Reminder updated', data: reminder });
  } catch (error) {
    return next(error);
  }
}

async function deleteReminder(req, res, next) {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!reminder) {
      return sendError(res, { message: 'Reminder not found', statusCode: 404 });
    }
    return sendSuccess(res, {
      message: 'Reminder deleted',
      data: { id: reminder._id.toString() },
    });
  } catch (error) {
    return next(error);
  }
}

async function snoozeReminder(req, res, next) {
  try {
    const errors = validateSnoozeBody(req.body);
    if (errors.length) {
      return sendError(res, { message: errors.join(', '), statusCode: 400 });
    }

    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!reminder) {
      return sendError(res, { message: 'Reminder not found', statusCode: 404 });
    }

    const minutes = Number(req.body.minutes);
    const snoozeUntil = new Date(Date.now() + minutes * 60_000);

    reminder.snoozeUntil = snoozeUntil;
    reminder.reminderTime = snoozeUntil;
    reminder.status = 'snoozed';
    reminder.snoozedCount = (reminder.snoozedCount || 0) + 1;
    reminder.read = false;
    await reminder.save();

    return sendSuccess(res, { message: 'Reminder snoozed', data: reminder });
  } catch (error) {
    return next(error);
  }
}

async function dismissReminder(req, res, next) {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!reminder) {
      return sendError(res, { message: 'Reminder not found', statusCode: 404 });
    }

    reminder.status = 'dismissed';
    reminder.dismissedAt = new Date();
    reminder.read = true;
    if (!reminder.triggeredAt) reminder.triggeredAt = new Date();
    await reminder.save();

    await recordHistory(reminder);

    return sendSuccess(res, { message: 'Reminder dismissed', data: reminder });
  } catch (error) {
    return next(error);
  }
}

async function markReminderRead(req, res, next) {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!reminder) {
      return sendError(res, { message: 'Reminder not found', statusCode: 404 });
    }

    reminder.read = true;
    await reminder.save();

    return sendSuccess(res, { message: 'Reminder marked read', data: reminder });
  } catch (error) {
    return next(error);
  }
}

async function markTriggered(req, res, next) {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!reminder) {
      return sendError(res, { message: 'Reminder not found', statusCode: 404 });
    }

    if (reminder.status === 'dismissed') {
      return sendError(res, { message: 'Reminder already dismissed', statusCode: 400 });
    }

    reminder.status = 'triggered';
    reminder.triggeredAt = new Date();
    reminder.read = false;
    await reminder.save();

    await recordHistory(reminder, { dismissedAt: null });

    return sendSuccess(res, { message: 'Reminder triggered', data: reminder });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
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
  isDue,
  effectiveDueTime,
};
