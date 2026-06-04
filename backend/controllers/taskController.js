const Task = require('../models/Task');
const Reminder = require('../models/Reminder');
const { sendSuccess, sendError } = require('../utils/response');
const { validateTaskBody } = require('../utils/validation');
const { buildTodayFilter, buildListFilter, mapTaskUpdates } = require('../services/taskService');
const googleCalendarService = require('../services/googleCalendarService');

async function getTasks(req, res, next) {
  try {
    const filter = buildListFilter(req.user._id, req.query);
    const tasks = await Task.find(filter).sort({ order: 1, createdAt: -1 });
    return sendSuccess(res, { message: 'Tasks fetched', data: tasks });
  } catch (error) {
    return next(error);
  }
}

async function syncTaskReminder(task) {
  if (task.reminderEnabled && (task.startTime || task.dueDate)) {
    const baseTime = task.startTime || task.dueDate;
    const offset = (task.reminderBefore || 0) * 60_000;
    const rTime = new Date(baseTime.getTime() - offset);
    
    let reminder = await Reminder.findOne({ taskId: task._id, userId: task.userId });
    if (!reminder) {
      reminder = new Reminder({
        taskId: task._id,
        userId: task.userId,
        status: 'pending',
      });
    }
    reminder.reminderTime = rTime;
    reminder.soundType = task.notificationSound || 'chime';
    // Let status reset to pending if time changed and it was triggered
    if (reminder.status !== 'snoozed') {
       reminder.status = 'pending';
    }
    await reminder.save();
  } else {
    await Reminder.deleteOne({ taskId: task._id, userId: task.userId });
  }
}

async function getTodayTasks(req, res, next) {
  try {
    const filter = buildTodayFilter(req.user._id);
    const tasks = await Task.find(filter).sort({ order: 1, startTime: 1, createdAt: -1 });
    return sendSuccess(res, { message: "Today's tasks fetched", data: tasks });
  } catch (error) {
    return next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const errors = validateTaskBody(req.body);
    if (errors.length) {
      return sendError(res, { message: errors.join(', '), statusCode: 400 });
    }

    const maxOrder = await Task.findOne({ userId: req.user._id }).sort({ order: -1 }).select('order');
    const nextOrder = (maxOrder?.order ?? -1) + 1;

    const payload = mapTaskUpdates(req.body);
    const task = await Task.create({
      ...payload,
      title: req.body.title.trim(),
      description: req.body.description?.trim() || '',
      order: req.body.order ?? nextOrder,
      userId: req.user._id,
    });

    req.user.totalTasks = (req.user.totalTasks || 0) + 1;
    if (task.completed) {
      req.user.completedTasks = (req.user.completedTasks || 0) + 1;
    }
    await req.user.save();
    
    await syncTaskReminder(task);

    // Sync with Google Calendar if connected
    if (req.user.googleRefreshToken) {
      await googleCalendarService.upsertCalendarEvent(req.user, task);
    }

    return sendSuccess(res, {
      message: 'Task created',
      data: task,
      statusCode: 201,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const errors = validateTaskBody(req.body, { partial: true });
    if (errors.length) {
      return sendError(res, { message: errors.join(', '), statusCode: 400 });
    }

    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return sendError(res, { message: 'Task not found', statusCode: 404 });
    }

    const wasCompleted = Boolean(task.completed);
    const updates = mapTaskUpdates(req.body);
    if (updates.title) updates.title = updates.title.trim();
    if (updates.description !== undefined) updates.description = updates.description.trim();

    Object.assign(task, updates);
    await task.save();

    const isCompleted = Boolean(task.completed);
    if (!wasCompleted && isCompleted) {
      req.user.completedTasks = (req.user.completedTasks || 0) + 1;
      await req.user.save();
    } else if (wasCompleted && !isCompleted) {
      req.user.completedTasks = Math.max(0, (req.user.completedTasks || 0) - 1);
      await req.user.save();
    }
    
    await syncTaskReminder(task);

    // Sync with Google Calendar if connected
    if (req.user.googleRefreshToken) {
      await googleCalendarService.upsertCalendarEvent(req.user, task);
    }

    return sendSuccess(res, { message: 'Task updated', data: task });
  } catch (error) {
    return next(error);
  }
}

async function reorderTasks(req, res, next) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return sendError(res, { message: 'ids array is required', statusCode: 400 });
    }

    const userId = req.user._id;
    const updates = ids.map((id, index) =>
      Task.updateOne({ _id: id, userId }, { $set: { order: index } }),
    );
    await Promise.all(updates);

    const tasks = await Task.find({ userId }).sort({ order: 1, createdAt: -1 });
    return sendSuccess(res, { message: 'Tasks reordered', data: tasks });
  } catch (error) {
    return next(error);
  }
}

async function completeTask(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return sendError(res, { message: 'Task not found', statusCode: 404 });
    }

    if (!task.completed) {
      task.completed = true;
      task.status = 'done';
      await task.save();

      const user = req.user;
      user.productivityScore = Math.min(100, (user.productivityScore || 0) + 2);
      user.completedTasks = (user.completedTasks || 0) + 1;
      await user.save();

      // Sync with Google Calendar if connected
      if (req.user.googleRefreshToken) {
        await googleCalendarService.upsertCalendarEvent(req.user, task);
      }
    }

    return sendSuccess(res, { message: 'Task completed', data: task });
  } catch (error) {
    return next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return sendError(res, { message: 'Task not found', statusCode: 404 });
    }

    req.user.totalTasks = Math.max(0, (req.user.totalTasks || 0) - 1);
    if (task.completed) {
      req.user.completedTasks = Math.max(0, (req.user.completedTasks || 0) - 1);
    }
    await req.user.save();

    // Delete from Google Calendar if synced
    if (req.user.googleRefreshToken && task.googleEventId) {
      await googleCalendarService.deleteCalendarEvent(req.user, task);
    }

    return sendSuccess(res, { message: 'Task deleted', data: { id: task._id.toString() } });
  } catch (error) {
    return next(error);
  }
}

async function syncGoogleCalendar(req, res, next) {
  try {
    if (!req.user.googleRefreshToken) {
      return sendSuccess(res, { message: 'Google Calendar not connected', data: [] });
    }

    const events = await googleCalendarService.importEventsFromGoogle(req.user);
    const importedTasks = [];

    for (const event of events) {
      let task = await Task.findOne({ googleEventId: event.id, userId: req.user._id });
      if (!task) {
        const startTime = event.start.dateTime ? new Date(event.start.dateTime) : (event.start.date ? new Date(event.start.date) : null);
        const endTime = event.end.dateTime ? new Date(event.end.dateTime) : (event.end.date ? new Date(event.end.date) : null);

        task = await Task.create({
          title: event.summary || 'Google Calendar Event',
          description: event.description || '',
          startTime,
          endTime,
          dueDate: endTime,
          googleEventId: event.id,
          userId: req.user._id,
          reminderEnabled: true,
          reminderBefore: 5,
        });

        req.user.totalTasks = (req.user.totalTasks || 0) + 1;
        await req.user.save();

        await syncTaskReminder(task);
        importedTasks.push(task);
      }
    }

    return sendSuccess(res, { message: `Calendar synced. Imported ${importedTasks.length} tasks.`, data: importedTasks });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTasks,
  getTodayTasks,
  createTask,
  updateTask,
  reorderTasks,
  completeTask,
  deleteTask,
  syncTaskReminder,
  syncGoogleCalendar,
};

