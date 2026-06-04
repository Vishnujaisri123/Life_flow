const IST_TIME_ZONE = 'Asia/Kolkata';

function getDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: IST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  return parts.reduce<Record<string, string>>((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});
}

export function formatISTDateTime(value: string | Date, options?: Intl.DateTimeFormatOptions) {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIME_ZONE,
    hour12: false,
    ...options,
  }).format(date);
}

export function formatISTTime(value: string | Date) {
  return formatISTDateTime(value, { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function formatISTDate(value: string | Date) {
  return formatISTDateTime(value, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatISTDateLong(value: string | Date) {
  return formatISTDateTime(value, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatISTDateInput(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  const parts = getDateParts(date);
  if (!parts.year || !parts.month || !parts.day || !parts.hour || !parts.minute) return '';
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function getISTDateKey(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  const parts = getDateParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function isTodayIST(value: string | Date) {
  const today = new Intl.DateTimeFormat('en-GB', {
    timeZone: IST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const candidate = new Intl.DateTimeFormat('en-GB', {
    timeZone: IST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(typeof value === 'string' ? new Date(value) : value);
  return today === candidate;
}

export function getISTTimePixels(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return 0;
  const parts = getDateParts(date);
  const hour = Number(parts.hour || '0');
  const minute = Number(parts.minute || '0');
  return (hour * 60 + minute) * 1.5;
}

export function setISTWallClock(value: string | Date, hours: number, minutes: number) {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return new Date(value);
  const parts = getDateParts(date);
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const utcMillis = Date.UTC(year, month - 1, day, hours, minutes) - (5.5 * 60 * 60 * 1000);
  return new Date(utcMillis);
}
