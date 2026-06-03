const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

async function protect(req, res, next) {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, { message: 'Not authorized — no token', statusCode: 401 });
    }

    if (!process.env.JWT_SECRET) {
      return sendError(res, { message: 'Server misconfiguration', statusCode: 500 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, { message: 'User not found', statusCode: 401 });
    }

    req.user = user;
    return next();
  } catch (error) {
    return sendError(res, {
      message: error.name === 'TokenExpiredError' ? 'Token expired' : 'Not authorized',
      statusCode: 401,
    });
  }
}

module.exports = { protect };
