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

const jwt = require('jsonwebtoken');
const googleCalendarService = require('../services/googleCalendarService');

async function initiateGoogleAuth(req, res, next) {
  try {
    // Check if Google credentials are set
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(501).json({
        success: false,
        message: 'Google OAuth is not configured on the server. Please define GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.'
      });
    }
    const authUrl = googleCalendarService.getAuthUrl(req.user._id.toString());
    return sendSuccess(res, { message: 'Redirect URL generated', data: { url: authUrl } });
  } catch (error) {
    return next(error);
  }
}

async function googleAuthCallback(req, res, next) {
  const frontendUrl = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',')[0] : 'http://localhost:5173';
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${frontendUrl}/profile?google_error=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      return res.redirect(`${frontendUrl}/profile?google_error=missing_parameters`);
    }

    // Verify state token
    let decoded;
    try {
      decoded = jwt.verify(state, process.env.JWT_SECRET);
    } catch (e) {
      return res.redirect(`${frontendUrl}/profile?google_error=invalid_state`);
    }

    const { userId } = decoded;
    const user = await User.findById(userId);
    if (!user) {
      return res.redirect(`${frontendUrl}/profile?google_error=user_not_found`);
    }

    // Exchange code for access/refresh tokens
    const credentials = await googleCalendarService.getTokensFromCode(code);

    // Save tokens and expiry
    user.googleAccessToken = credentials.accessToken;
    if (credentials.refreshToken) {
      user.googleRefreshToken = credentials.refreshToken;
    }
    user.googleTokensExpiry = new Date(Date.now() + credentials.expiresIn * 1000);
    await user.save();

    return res.redirect(`${frontendUrl}/profile?google_connected=true`);
  } catch (error) {
    console.error('[Google OAuth Callback Error]', error);
    return res.redirect(`${frontendUrl}/profile?google_error=${encodeURIComponent(error.message)}`);
  }
}

async function getGoogleStatus(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    return sendSuccess(res, {
      message: 'Google Calendar status fetched',
      data: { connected: Boolean(user && user.googleRefreshToken) }
    });
  } catch (error) {
    return next(error);
  }
}

async function disconnectGoogle(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.googleAccessToken = null;
      user.googleRefreshToken = null;
      user.googleTokensExpiry = null;
      await user.save();
    }
    return sendSuccess(res, { message: 'Google Calendar disconnected' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  signup,
  login,
  getMe,
  updateMe,
  initiateGoogleAuth,
  googleAuthCallback,
  getGoogleStatus,
  disconnectGoogle
};
