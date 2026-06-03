const { sendError } = require('../utils/response');

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

/** @type {Map<string, { count: number; resetAt: number }>} */
const buckets = new Map();

function aiRateLimit(req, res, next) {
  const key = req.user?._id?.toString() || req.ip || 'anon';
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(key, bucket);
  }

  bucket.count += 1;

  if (bucket.count > MAX_REQUESTS) {
    return sendError(res, {
      message: 'Too many AI requests. Please wait a minute and try again.',
      statusCode: 429,
    });
  }

  return next();
}

module.exports = { aiRateLimit };
