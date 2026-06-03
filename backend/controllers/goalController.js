const Goal = require('../models/Goal');
const { sendSuccess, sendError } = require('../utils/response');

async function getGoals(req, res, next) {
  try {
    const filter = { userId: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    
    const goals = await Goal.find(filter).sort({ targetDate: 1, createdAt: -1 });
    return sendSuccess(res, { message: 'Goals fetched', data: goals });
  } catch (error) {
    return next(error);
  }
}

async function createGoal(req, res, next) {
  try {
    const { title, description, category, targetDate, priority, milestones } = req.body;
    
    if (!title || !targetDate) {
      return sendError(res, { message: 'Title and targetDate are required', statusCode: 400 });
    }

    const goal = await Goal.create({
      userId: req.user._id,
      title,
      description,
      category,
      targetDate,
      priority,
      milestones: milestones || [],
    });

    return sendSuccess(res, { message: 'Goal created', data: goal, statusCode: 201 });
  } catch (error) {
    return next(error);
  }
}

async function updateGoal(req, res, next) {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return sendError(res, { message: 'Goal not found', statusCode: 404 });
    }

    const allowedUpdates = [
      'title', 'description', 'category', 'targetDate', 'priority', 
      'progressPercentage', 'status', 'milestones'
    ];

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        goal[key] = req.body[key];
      }
    }

    // Auto-calculate progress if milestones are provided and progressPercentage isn't explicitly set
    if (req.body.milestones && req.body.progressPercentage === undefined) {
      const total = goal.milestones.length;
      if (total > 0) {
        const completed = goal.milestones.filter(m => m.isCompleted).length;
        goal.progressPercentage = Math.round((completed / total) * 100);
      }
    }

    // Auto-update status based on progress
    if (goal.progressPercentage === 100 && goal.status !== 'archived') {
      goal.status = 'completed';
    } else if (goal.progressPercentage < 100 && goal.status === 'completed') {
      goal.status = 'active';
    }

    await goal.save();

    return sendSuccess(res, { message: 'Goal updated', data: goal });
  } catch (error) {
    return next(error);
  }
}

async function deleteGoal(req, res, next) {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return sendError(res, { message: 'Goal not found', statusCode: 404 });
    }

    return sendSuccess(res, { message: 'Goal deleted', data: { id: goal._id.toString() } });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
};
