const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value, minLength = 1) {
  return typeof value === 'string' && value.trim().length >= minLength;
}

function validateSignupBody({ name, email, password }) {
  const errors = [];
  if (!isNonEmptyString(name, 2)) errors.push('Name must be at least 2 characters');
  if (!isNonEmptyString(email) || !EMAIL_REGEX.test(email)) errors.push('Valid email is required');
  if (!isNonEmptyString(password, 6)) errors.push('Password must be at least 6 characters');
  return errors;
}

function validateLoginBody({ email, password }) {
  const errors = [];
  if (!isNonEmptyString(email) || !EMAIL_REGEX.test(email)) errors.push('Valid email is required');
  if (!isNonEmptyString(password)) errors.push('Password is required');
  return errors;
}

function validateProfileBody(body, { partial = false } = {}) {
  const errors = [];
  if (!partial && !isNonEmptyString(body.name, 2)) {
    errors.push('Name must be at least 2 characters');
  }
  if (body.name !== undefined && body.name !== null && !isNonEmptyString(body.name, 2)) {
    errors.push('Name must be at least 2 characters');
  }
  if (body.avatar !== undefined && body.avatar !== null && typeof body.avatar !== 'string') {
    errors.push('Avatar must be a string URL or path');
  }
  if (body.timezone !== undefined && body.timezone !== null && !isNonEmptyString(body.timezone)) {
    errors.push('Timezone must be a valid identifier');
  }
  return errors;
}

const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const TASK_STATUSES = ['todo', 'in_progress', 'done'];
const TASK_CATEGORIES = ['work', 'personal', 'health', 'learning', 'other'];
const RECURRENCE_FREQUENCIES = ['daily', 'weekly', 'monthly', null];
const SOUND_TYPES = ['default', 'chime', 'bell', 'soft', 'urgent', 'silent'];
const NOTIFICATION_TYPES = ['push', 'email', 'in_app', 'browser'];
const REMINDER_STATUSES = ['pending', 'triggered', 'snoozed', 'dismissed'];
const SNOOZE_MINUTES = [5, 10, 15, 30, 60];

function validateTaskBody(body, { partial = false } = {}) {
  const errors = [];
  const required = partial
    ? []
    : ['title'];

  for (const field of required) {
    if (!isNonEmptyString(body[field])) {
      errors.push(`${field} is required`);
    }
  }

  if (body.title !== undefined && !isNonEmptyString(body.title)) {
    errors.push('title cannot be empty');
  }
  if (body.priority !== undefined && !TASK_PRIORITIES.includes(body.priority)) {
    errors.push(`priority must be one of: ${TASK_PRIORITIES.join(', ')}`);
  }
  if (body.status !== undefined && !TASK_STATUSES.includes(body.status)) {
    errors.push(`status must be one of: ${TASK_STATUSES.join(', ')}`);
  }
  if (body.category !== undefined && !isNonEmptyString(body.category)) {
    errors.push('category cannot be empty');
  }
  if (
    body.recurrenceFrequency !== undefined &&
    body.recurrenceFrequency !== null &&
    body.recurrenceFrequency !== '' &&
    body.recurrenceFrequency !== 'none' &&
    !['daily', 'weekly', 'monthly'].includes(body.recurrenceFrequency)
  ) {
    errors.push('recurrenceFrequency must be daily, weekly, or monthly');
  }
  if (body.recurrenceInterval !== undefined) {
    const n = Number(body.recurrenceInterval);
    if (!Number.isInteger(n) || n < 1) errors.push('recurrenceInterval must be a positive integer');
  }
  if (body.order !== undefined && typeof body.order !== 'number') {
    errors.push('order must be a number');
  }

  return errors;
}

function validateReminderBody(body, { partial = false } = {}) {
  const errors = [];
  if (!partial && !body.taskId) errors.push('taskId is required');
  if (body.reminderTime !== undefined && body.reminderTime && Number.isNaN(Date.parse(body.reminderTime))) {
    errors.push('reminderTime must be a valid date');
  }
  if (body.soundType !== undefined && !SOUND_TYPES.includes(body.soundType)) {
    errors.push(`soundType must be one of: ${SOUND_TYPES.join(', ')}`);
  }
  if (body.notificationType !== undefined && !NOTIFICATION_TYPES.includes(body.notificationType)) {
    errors.push(`notificationType must be one of: ${NOTIFICATION_TYPES.join(', ')}`);
  }
  if (body.status !== undefined && !REMINDER_STATUSES.includes(body.status)) {
    errors.push(`status must be one of: ${REMINDER_STATUSES.join(', ')}`);
  }
  return errors;
}

function validateSnoozeBody({ minutes }) {
  const errors = [];
  const m = Number(minutes);
  if (!SNOOZE_MINUTES.includes(m)) {
    errors.push(`minutes must be one of: ${SNOOZE_MINUTES.join(', ')}`);
  }
  return errors;
}

function validateFcmTokenBody({ token }) {
  const errors = [];
  if (!isNonEmptyString(token, 10)) errors.push('token is required');
  return errors;
}

module.exports = {
  validateSignupBody,
  validateLoginBody,
  validateProfileBody,
  validateTaskBody,
  validateReminderBody,
  validateSnoozeBody,
  validateFcmTokenBody,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_CATEGORIES,
};
