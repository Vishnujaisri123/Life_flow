const Task = require('../models/Task');
const Goal = require('../models/Goal');

/**
 * Handles AI Actions dynamically.
 * Actions marked SAFE are executed immediately.
 * Actions marked DANGEROUS return a "pending_confirmation" flag to the frontend.
 */
async function processAiAction(action, userId) {
  try {
    // SAFE ACTIONS
    if (action.action === 'create_task') {
      const task = await Task.create({ ...action.payload, userId });
      return { success: true, type: 'create_task', message: `Task "${task.title}" created.`, data: task };
    }
    
    if (action.action === 'update_task' || action.action === 'reschedule') {
      const newPayload = action.newTime ? { startTime: action.newTime, dueDate: action.newTime } : action.payload;
      const task = await Task.findOneAndUpdate(
        { _id: action.taskId, userId },
        { $set: newPayload },
        { new: true }
      );
      return { success: true, type: 'update_task', message: `Task "${task?.title || 'Unknown'}" updated.`, data: task };
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
        await Task.findOneAndDelete({ _id: action.taskId, userId });
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
