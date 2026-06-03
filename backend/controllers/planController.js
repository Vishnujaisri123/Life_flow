const SavedPlan = require('../models/SavedPlan');
const { sendSuccess, sendError } = require('../utils/response');

async function getPlans(req, res, next) {
  try {
    const plans = await SavedPlan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, { message: 'Plans fetched successfully', data: plans });
  } catch (error) {
    next(error);
  }
}

async function getPlan(req, res, next) {
  try {
    const plan = await SavedPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!plan) {
      return sendError(res, { message: 'Plan not found', statusCode: 404 });
    }
    return sendSuccess(res, { message: 'Plan fetched', data: plan });
  } catch (error) {
    next(error);
  }
}

async function createPlan(req, res, next) {
  try {
    const { title, planData } = req.body;
    if (!title || !planData || !planData.blocks) {
      return sendError(res, { message: 'Title and plan data are required', statusCode: 400 });
    }
    const newPlan = new SavedPlan({
      userId: req.user._id,
      title,
      planData,
    });
    const saved = await newPlan.save();
    return sendSuccess(res, { message: 'Plan saved successfully', data: saved, statusCode: 201 });
  } catch (error) {
    next(error);
  }
}

async function updatePlan(req, res, next) {
  try {
    const { title, planData } = req.body;
    const plan = await SavedPlan.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { title, planData } },
      { new: true }
    );
    if (!plan) {
      return sendError(res, { message: 'Plan not found', statusCode: 404 });
    }
    return sendSuccess(res, { message: 'Plan updated', data: plan });
  } catch (error) {
    next(error);
  }
}

async function deletePlan(req, res, next) {
  try {
    const plan = await SavedPlan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!plan) {
      return sendError(res, { message: 'Plan not found', statusCode: 404 });
    }
    return sendSuccess(res, { message: 'Plan deleted' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
};
