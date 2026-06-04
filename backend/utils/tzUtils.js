/**
 * IST (Asia/Kolkata) timezone utilities.
 * MongoDB stores all dates as UTC. IST = UTC + 5:30.
 * We convert between IST wall-clock and UTC for queries and display.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5h 30m in ms
const IST_TZ = 'Asia/Kolkata';

/**
 * Returns the current time as an IST-aware Date (UTC internally, but offset applied).
 */
function nowIST() {
  return new Date();
}

/**
 * Returns a human-readable IST datetime string for AI prompts.
 * e.g. "2026-06-05 19:30 IST (Thursday)"
 */
function getISTDateTimeString() {
  const now = new Date();
  return now.toLocaleString('en-IN', {
    timeZone: IST_TZ,
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }) + ' IST';
}

/**
 * Returns just the IST time string for display.
 * e.g. "19:30 IST"
 */
function getISTTimeString() {
  return new Date().toLocaleTimeString('en-IN', {
    timeZone: IST_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }) + ' IST';
}

/**
 * Given a user-spoken time like "7 PM" or "19:00", returns a UTC Date
 * for today at that IST wall-clock time.
 */
function istTimeToUTC(hours, minutes = 0, referenceDate = null) {
  const base = referenceDate ? new Date(referenceDate) : new Date();
  // Build a date string in IST as if it's a local time, then convert to UTC
  const istDateStr = new Date(base.getTime() + IST_OFFSET_MS)
    .toISOString()
    .slice(0, 10); // "YYYY-MM-DD" in IST date
  // Create the timestamp: IST midnight of that date + hours + minutes
  const utcEquivalent = new Date(`${istDateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`);
  // Subtract IST offset to get true UTC
  return new Date(utcEquivalent.getTime() - IST_OFFSET_MS);
}

/**
 * Returns start/end of today in UTC, correctly based on IST calendar day.
 * IST midnight = UTC 18:30 previous day.
 */
function parseISTDateTime(value) {
  if (value === undefined || value === null || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const raw = String(value).trim();

  const explicitTZ = /[zZ]|[+-]\d{2}:?\d{2}$/.test(raw);
  if (explicitTZ) {
    const explicit = new Date(raw);
    return Number.isNaN(explicit.getTime()) ? null : explicit;
  }

  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!match) {
    const fallback = new Date(raw);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  const [, year, month, day, hour = '00', minute = '00', second = '00'] = match;
  const utcMillis = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  ) - IST_OFFSET_MS;
  return new Date(utcMillis);
}

function getISTDayRange(dateString) {
  const start = parseISTDateTime(dateString);
  if (!start) return null;
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { start, end };
}

function getTodayRangeIST() {
  const now = new Date();
  // Current date in IST
  const istDateStr = new Date(now.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
  // IST midnight = that date at 00:00 IST = (date - 5:30) UTC
  const startUTC = new Date(new Date(`${istDateStr}T00:00:00.000Z`).getTime() - IST_OFFSET_MS);
  const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000);
  return { start: startUTC, end: endUTC };
}

/**
 * Format a UTC Date as IST string for AI context.
 */
function formatForAI(date) {
  if (!date) return 'none';
  return new Date(date).toLocaleString('en-IN', {
    timeZone: IST_TZ,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }) + ' IST';
}

module.exports = {
  IST_TZ,
  IST_OFFSET_MS,
  nowIST,
  getISTDateTimeString,
  getISTTimeString,
  istTimeToUTC,
  parseISTDateTime,
  getISTDayRange,
  getTodayRangeIST,
  formatForAI,
};
