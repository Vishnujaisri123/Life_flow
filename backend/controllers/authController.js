const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const { validateSignupBody, validateLoginBody, validateProfileBody } = require('../utils/validation');
const { signToken, formatAuthResponse } = require('../services/authService');

async function signup(req, res, next) {
  try {
    const errors = validateSignupBody(req.body);
    if (errors.length) {
      return sendError(res, { message: errors.join(', '), statusCode: 400 });
    }

    const { name, email, password } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return sendError(res, { message: 'Email already registered', statusCode: 409 });
    }

    const user = await User.create({ name: name.trim(), email, password });
    const token = signToken(user._id);

    return sendSuccess(res, {
      message: 'Account created',
      data: formatAuthResponse(user, token),
      statusCode: 201,
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const errors = validateLoginBody(req.body);
    if (errors.length) {
      return sendError(res, { message: errors.join(', '), statusCode: 400 });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, { message: 'Invalid email or password', statusCode: 401 });
    }

    const token = signToken(user._id);
    user.password = undefined;

    return sendSuccess(res, {
      message: 'Logged in',
      data: formatAuthResponse(user, token),
    });
  } catch (error) {
    return next(error);
  }
}

async function getMe(req, res) {
  const user = req.user;
  return sendSuccess(res, {
    message: 'Profile fetched',
    data: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar || '',
      timezone: user.timezone || 'UTC',
      productivityScore: user.productivityScore,
      streak: user.streak,
      totalTasks: user.totalTasks,
      completedTasks: user.completedTasks,
      createdAt: user.createdAt,
    },
  });
}

async function updateMe(req, res, next) {
  try {
    const errors = validateProfileBody(req.body, { partial: true });
    if (errors.length) {
      return sendError(res, { message: errors.join(', '), statusCode: 400 });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, { message: 'User not found', statusCode: 404 });
    }

    if (req.body.name !== undefined) {
      user.name = req.body.name.trim();
    }
    if (req.body.avatar !== undefined) {
      user.avatar = String(req.body.avatar).trim();
    }
    if (req.body.timezone !== undefined) {
      user.timezone = String(req.body.timezone).trim();
    }

    await user.save();

    return sendSuccess(res, {
      message: 'Profile updated',
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        timezone: user.timezone || 'UTC',
        productivityScore: user.productivityScore,
        streak: user.streak,
        totalTasks: user.totalTasks,
        completedTasks: user.completedTasks,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { signup, login, getMe, updateMe };
