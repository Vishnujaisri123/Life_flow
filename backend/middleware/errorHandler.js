const { sendError } = require('../utils/response');

function notFound(req, res) {
  return sendError(res, {
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    statusCode: 404,
  });
}

function errorHandler(err, req, res, _next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return sendError(res, { message: messages.join(', '), statusCode: 400 });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return sendError(res, { message: `${field} already exists`, statusCode: 409 });
  }

  if (err.name === 'CastError') {
    return sendError(res, { message: 'Invalid resource id', statusCode: 400 });
  }

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return sendError(res, { message, statusCode });
}

module.exports = { notFound, errorHandler };
