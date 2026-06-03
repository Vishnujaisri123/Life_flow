const Task = require('../models/Task');
const { sendSuccess } = require('../utils/response');

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildWeeklySeries(tasks, productivityScore) {
  const today = startOfDay(new Date());
  const series = [];

  for (let i = 6; i >= 0; i -= 1) {
    const dayStart = new Date(today);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const completedThatDay = tasks.filter((task) => {
      if (task.status !== 'done' && !task.completed) return false;
      const updated = task.updatedAt ? new Date(task.updatedAt) : null;
      if (!updated) return false;
      return updated >= dayStart && updated < dayEnd;
    }).length;

    series.push({
      day: DAY_LABELS[dayStart.getDay()],
      focus: productivityScore,
      tasks: completedThatDay,
    });
  }

  return series;
}

async function getAnalytics(req, res, next) {
  try {
    const user = req.user;
    const tasks = await Task.find({ userId: user._id });

    const todayStart = startOfDay(new Date());
    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isDone = (t) => t.status === 'done' || t.completed;
    const doneToday = tasks.filter((t) => {
      if (!isDone(t)) return false;
      const updated = t.updatedAt ? new Date(t.updatedAt) : null;
      return updated && updated >= todayStart && updated < tomorrow;
    }).length;

    const tasksDoneTotal = tasks.filter(isDone).length;
    const tasksOpen = tasks.filter((t) => !isDone(t)).length;

    return sendSuccess(res, {
      message: 'Analytics fetched',
      data: {
        productivityScore: user.productivityScore ?? 0,
        streak: user.streak ?? 0,
        tasksDoneToday: doneToday,
        tasksDoneTotal,
        tasksOpen,
        tasksTotal: tasks.length,
        totalTasks: user.totalTasks ?? tasks.length,
        completedTasks: user.completedTasks ?? tasksDoneTotal,
        weeklySeries: buildWeeklySeries(tasks, user.productivityScore ?? 0),
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getAnalytics };
