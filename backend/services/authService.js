const jwt = require('jsonwebtoken');

function signToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function formatAuthResponse(user, token) {
  return {
    token,
    user: {
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
  };
}

module.exports = { signToken, formatAuthResponse };
