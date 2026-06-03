/**
 * Returns start/end of local day in UTC for MongoDB date queries.
 */
function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

function buildTodayFilter(userId) {
  const { start, end } = getTodayRange();
  return {
    userId,
    completed: { $ne: true },
    $or: [
      { startTime: { $gte: start, $lt: end } },
      { endTime: { $gte: start, $lt: end } },
      { dueDate: { $gte: start, $lt: end } },
      {
        createdAt: { $gte: start, $lt: end },
        startTime: null,
        endTime: null,
        dueDate: null,
      },
    ],
  };
}

function buildListFilter(userId, query = {}) {
  const filter = { userId };

  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.category) filter.category = query.category;
  if (query.completed === 'true') filter.completed = true;
  if (query.completed === 'false') filter.completed = false;

  const dateField = query.dateField === 'startTime' ? 'startTime' : 'dueDate';
  if (query.dateFrom || query.dateTo) {
    const range = {};
    if (query.dateFrom) range.$gte = new Date(query.dateFrom);
    if (query.dateTo) {
      const to = new Date(query.dateTo);
      to.setHours(23, 59, 59, 999);
      range.$lte = to;
    }
    filter.$or = [
      { [dateField]: range },
      { endTime: range },
      { dueDate: range },
    ];
  }

  if (query.search && String(query.search).trim()) {
    const term = String(query.search).trim();
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [{ title: regex }, { description: regex }],
    });
  }

  return filter;
}

function mapTaskUpdates(body) {
  const allowed = [
    'title',
    'description',
    'category',
    'priority',
    'status',
    'order',
    'startDate',
    'startTime',
    'endTime',
    'duration',
    'dueDate',
    'reminderTime',
    'reminderEnabled',
    'reminderBefore',
    'soundEnabled',
    'vibrationEnabled',
    'fullscreenAlertEnabled',
    'notificationSound',
    'tags',
    'aiGenerated',
    'recurring',
    'completed',
    'recurrenceFrequency',
    'recurrenceInterval',
    'recurrenceEnd',
  ];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      updates[key] = body[key];
    }
  }
  const dateKeys = ['startDate', 'startTime', 'endTime', 'dueDate', 'reminderTime', 'recurrenceEnd'];
  for (const key of dateKeys) {
    if (updates[key]) updates[key] = new Date(updates[key]);
    if (updates[key] === null || updates[key] === '') updates[key] = null;
  }
  if (updates.recurrenceFrequency === '' || updates.recurrenceFrequency === 'none') {
    updates.recurrenceFrequency = null;
  }
  if (updates.tags !== undefined) {
    if (Array.isArray(updates.tags)) {
      updates.tags = updates.tags.filter((tag) => typeof tag === 'string').map((tag) => tag.trim()).filter(Boolean);
    } else {
      updates.tags = [];
    }
  }
  if (updates.completed === true) updates.status = 'done';
  if (updates.completed === false && updates.status === undefined) {
    updates.status = 'todo';
  }
  if (updates.dueDate && !updates.endTime) updates.endTime = updates.dueDate;
  if (updates.endTime && !updates.dueDate) updates.dueDate = updates.endTime;
  return updates;
}

module.exports = {
  buildTodayFilter,
  buildListFilter,
  mapTaskUpdates,
  getTodayRange,
};
