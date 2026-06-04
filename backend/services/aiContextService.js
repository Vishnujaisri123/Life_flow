const Task = require('../models/Task');
const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const { buildTodayFilter, getTodayRange } = require('./taskService');

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

async function fetchTaskContext(userId) {
  const todayFilter = buildTodayFilter(userId);
  const [todayTasks, allOpen, completedTasks, goals, habits] = await Promise.all([
    Task.find(todayFilter).sort({ order: 1, priority: -1 }).limit(30),
    Task.find({ userId, completed: { $ne: true } }).sort({ dueDate: 1, order: 1 }).limit(80),
    Task.find({ userId, completed: true }).sort({ updatedAt: -1 }).limit(10), // Recent completed
    Goal.find({ userId, status: { $ne: 'archived' } }),
    Habit.find({ userId, isArchived: { $ne: true } })
  ]);

  const now = new Date();
  const todayStart = startOfDay(now);

  let overdueCount = 0;
  const overdueTasks = [];
  const upcomingTasks = [];

  for (const task of allOpen) {
    const due = task.dueDate || task.endTime;
    if (!due) continue;
    const dueDay = startOfDay(due);
    if (dueDay < todayStart) {
      overdueCount += 1;
      if (overdueTasks.length < 15) overdueTasks.push({ id: task._id, title: task.title, due: due.toISOString() });
    } else if (dueDay > todayStart && upcomingTasks.length < 15) {
      upcomingTasks.push({ id: task._id, title: task.title, due: due.toISOString() });
    }
  }

  const todayList = todayTasks.map((t) => ({
    id: t._id,
    title: t.title,
    start: t.startTime ? t.startTime.toISOString() : null,
    end: t.endTime ? t.endTime.toISOString() : null,
    due: t.dueDate ? t.dueDate.toISOString() : null,
    duration: t.duration || null,
  })).slice(0, 20);

  const activeGoals = goals.map(g => ({
    id: g._id,
    title: g.title,
    progress: g.progressPercentage,
    target: g.targetDate,
    status: g.status
  }));

  return {
    todayCount: todayTasks.length,
    todayTasks: todayList,
    overdueCount,
    overdueTasks,
    upcomingTasks,
    openCount: allOpen.length,
    goals: activeGoals,
    habits: habits.map(h => ({ id: h._id, title: h.name, streak: h.currentStreak })),
  };
}

function buildSystemPrompt({ userName, taskContext, mode }) {
  const ctx = taskContext || {};
  const todayStr = ctx.todayTasks?.map(t => `[${t.id}] ${t.title} (start: ${t.start || 'none'}, end: ${t.end || 'none'})`).join('; ') || 'none';
  const overdueStr = ctx.overdueTasks?.map(t => `[${t.id}] ${t.title}`).join('; ') || 'none';
  const upcomingStr = ctx.upcomingTasks?.map(t => `[${t.id}] ${t.title}`).join('; ') || 'none';
  const goalStr = ctx.goals?.map(g => `[${g.id}] ${g.title} (${g.progress}%)`).join('; ') || 'none';

  const lines = [
    'You are LifeFlow AI, an advanced AI Operating System and productivity coach.',
    `The user is ${userName || 'there'}. Current time: ${new Date().toISOString()}.`,
    '',
    '## User Task Snapshot (Format: [ID] Title)',
    `- Today (${ctx.todayCount ?? 0}): ${todayStr}`,
    `- Overdue (${ctx.overdueCount ?? 0}): ${overdueStr}`,
    `- Upcoming: ${upcomingStr}`,
    `- Goals: ${goalStr}`,
    '',
    '## AI Tool Actions — CRITICAL RULES',
    '- When user asks to edit, move, rename, reschedule, delete, or complete a task: FIND the task ID from the snapshot above and execute an action block.',
    '- NEVER say "I cannot do that". ALWAYS execute the action using the correct tool.',
    '- Output a fenced ```action JSON block at the END of your reply for each operation.',
    '',
    '## Available Actions:',
    '',
    '### updateTask — edit title, time, priority, category, description',
    '```action',
    '{"action": "update_task", "taskId": "<exact-id>", "payload": {"title": "New Title"}}',
    '```',
    '',
    '### reschedule — move task to new time (updates reminder automatically)',
    '```action',
    '{"action": "update_task", "taskId": "<exact-id>", "payload": {"startTime": "2026-06-05T20:00:00.000Z", "dueDate": "2026-06-05T21:00:00.000Z", "endTime": "2026-06-05T21:00:00.000Z"}}',
    '```',
    '',
    '### rename task',
    '```action',
    '{"action": "update_task", "taskId": "<exact-id>", "payload": {"title": "New Name"}}',
    '```',
    '',
    '### complete task',
    '```action',
    '{"action": "update_task", "taskId": "<exact-id>", "payload": {"status": "done", "completed": true}}',
    '```',
    '',
    '### delete task — DANGEROUS, will show confirmation card to user',
    '```action',
    '{"action": "delete_task", "taskId": "<exact-id>"}',
    '```',
    '',
    '### create task',
    '```action',
    '{"action": "create_task", "payload": {"title": "Task", "startTime": "2026-06-05T09:00:00.000Z", "reminderEnabled": true, "reminderBefore": 5}}',
    '```',
    '',
    '### update goal',
    '```action',
    '{"action": "update_goal", "goalId": "<exact-id>", "payload": {"progressPercentage": 75}}',
    '```',
    '',
    '- All times must be valid ISO 8601 UTC strings.',
    '- When rescheduling, ALWAYS update startTime, endTime, AND dueDate together.',
    '- Reminder time is auto-calculated from reminderBefore (minutes before startTime) on the backend.',
    '- If you cannot find the task ID in the snapshot, say so and ask the user to be more specific.',
    '- Delete actions require user confirmation — they will see a confirmation card.',
  ];

  return lines.join('\n');
}

module.exports = {
  fetchTaskContext,
  buildSystemPrompt,
  getTodayRange,
};
