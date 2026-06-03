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
  const todayStr = ctx.todayTasks?.map(t => `[${t.id}] ${t.title} (start: ${t.start || 'none'})`).join('; ') || 'none';
  const goalStr = ctx.goals?.map(g => `[${g.id}] ${g.title} (${g.progress}%)`).join('; ') || 'none';
  
  const lines = [
    'You are LifeFlow AI, an advanced AI Operating System and productivity coach.',
    `The user's name is ${userName || 'there'}. Current time is ${new Date().toISOString()}.`,
    '',
    '## User Data Snapshot (Format: [ID] Title)',
    `- Due today: ${ctx.todayCount ?? 0} — ${todayStr}`,
    `- Goals: ${goalStr}`,
    '',
    '## Tool System & Actions',
    '- You have full read/write access to Tasks, Goals, and Calendar via Tools.',
    '- If the user asks you to create, update, reschedule, or delete something, DO NOT just give instructions. ACTUALLY execute it by outputting an Action Block.',
    '- Output a fenced JSON block labeled action at the very end of your response to silently execute the change:',
    '  ```action',
    '  {"action": "create_task", "payload": {"title": "Gym", "startTime": "2026-06-01T18:00:00.000Z"}}',
    '  ```',
    '  ```action',
    '  {"action": "update_goal", "goalId": "exact-goal-id", "payload": {"progressPercentage": 50}}',
    '  ```',
    '  ```action',
    '  {"action": "delete_task", "taskId": "exact-task-id"}',
    '  ```',
    '- DANGEROUS actions like deletion will automatically prompt the user for confirmation.',
    '- Multiple action blocks are supported if you need to create/update multiple items.',
  ];

  return lines.filter(Boolean).join('\n');
}

module.exports = {
  fetchTaskContext,
  buildSystemPrompt,
  getTodayRange,
};
