const Task = require('../models/Task');
const Goal = require('../models/Goal');
const User = require('../models/User');
const { syncTaskReminder } = require('../controllers/taskController');
const googleCalendarService = require('./googleCalendarService');

/**
 * Handles AI Actions dynamically.
 * Actions marked SAFE are executed immediately.
 * Actions marked DANGEROUS return a "pending_confirmation" flag to the frontend.
 */
async function processAiAction(action, userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // SAFE ACTIONS
    if (action.action === 'create_task') {
      const task = await Task.create({ ...action.payload, userId });
      user.totalTasks = (user.totalTasks || 0) + 1;
      if (task.completed) {
        user.completedTasks = (user.completedTasks || 0) + 1;
      }
      await user.save();

      await syncTaskReminder(task);

      if (user.googleRefreshToken) {
        await googleCalendarService.upsertCalendarEvent(user, task);
      }

      return { success: true, type: 'create_task', message: `Task "${task.title}" created.`, data: task };
    }
    
    if (action.action === 'update_task' || action.action === 'reschedule') {
      const newPayload = action.newTime ? { startTime: action.newTime, dueDate: action.newTime } : action.payload;
      const task = await Task.findOne({ _id: action.taskId, userId });
      if (!task) {
        return { success: false, message: 'Task not found' };
      }

      const wasCompleted = Boolean(task.completed);
      
      if (newPayload) {
        Object.assign(task, newPayload);
        await task.save();
      }

      const isCompleted = Boolean(task.completed);
      if (!wasCompleted && isCompleted) {
        user.completedTasks = (user.completedTasks || 0) + 1;
        await user.save();
      } else if (wasCompleted && !isCompleted) {
        user.completedTasks = Math.max(0, (user.completedTasks || 0) - 1);
        await user.save();
      }

      await syncTaskReminder(task);

      if (user.googleRefreshToken) {
        await googleCalendarService.upsertCalendarEvent(user, task);
      }

      return { success: true, type: 'update_task', message: `Task "${task.title}" updated.`, data: task };
    }

    if (action.action === 'create_goal') {
      const goal = await Goal.create({ ...action.payload, userId });
      return { success: true, type: 'create_goal', message: `Goal "${goal.title}" created.`, data: goal };
    }

    if (action.action === 'update_goal') {
      const goal = await Goal.findOneAndUpdate(
        { _id: action.goalId, userId },
        { $set: action.payload },
        { new: true }
      );
      return { success: true, type: 'update_goal', message: `Goal "${goal?.title || 'Unknown'}" updated.`, data: goal };
    }

    // DANGEROUS ACTIONS
    if (action.action === 'delete_task') {
      if (action.confirmed) {
        const task = await Task.findOneAndDelete({ _id: action.taskId, userId });
        if (task) {
          user.totalTasks = Math.max(0, (user.totalTasks || 0) - 1);
          if (task.completed) {
            user.completedTasks = Math.max(0, (user.completedTasks || 0) - 1);
          }
          await user.save();

          await syncTaskReminder({ ...task.toObject(), reminderEnabled: false });

          if (user.googleRefreshToken && task.googleEventId) {
            await googleCalendarService.deleteCalendarEvent(user, task);
          }
        }
        return { success: true, type: 'delete_task', message: 'Task deleted.' };
      }
      return { requiresConfirmation: true, action };
    }

    if (action.action === 'delete_goal') {
      if (action.confirmed) {
        await Goal.findOneAndDelete({ _id: action.goalId, userId });
        return { success: true, type: 'delete_goal', message: 'Goal deleted.' };
      }
      return { requiresConfirmation: true, action };
    }

    return { success: false, message: `Unknown action: ${action.action}` };
  } catch (error) {
    console.error('AI Tool Execution Failed:', error);
    return { success: false, message: error.message };
  }
}

module.exports = { processAiAction };

