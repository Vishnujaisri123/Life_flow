/**
 * Standard API response helpers.
 * @param {import('express').Response} res
 */
function sendSuccess(res, { message = 'Success', data = null, statusCode = 200 }) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function sendError(res, { message = 'Something went wrong', statusCode = 500, data = null }) {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
  });
}

module.exports = { sendSuccess, sendError };
