// Local-time date helpers. toISOString() returns the UTC date, which flips to
// "tomorrow" in the evening for US timezones, so everything goes through these.

function pad(n) {
  return String(n).padStart(2, '0');
}

// Date -> 'YYYY-MM-DD' in the user's local timezone
export function toDateString(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// 'YYYY-MM-DD' -> Date at local midnight
export function parseDateString(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// 'YYYY-MM-DD' + n days -> 'YYYY-MM-DD'
export function addDays(str, n) {
  const d = parseDateString(str);
  d.setDate(d.getDate() + n);
  return toDateString(d);
}

// 'YYYY-MM-DD' -> 'Tuesday, Oct 20'
export function formatLongDate(str) {
  return parseDateString(str).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

// ---- Period helpers (week / month / year) used by the prize pages ----
// A period is identified by a "key": week -> Monday's date ('2026-10-26'),
// month -> '2026-10', year -> '2026'. Weeks run Monday to Sunday.

// 'YYYY-MM-DD' -> the Monday of that date's week
export function mondayOf(str) {
  const day = parseDateString(str).getDay(); // 0 = Sunday
  return addDays(str, day === 0 ? -6 : 1 - day);
}

// The key of the period containing a date (defaults to today)
export function periodKeyFor(type, str = toDateString()) {
  if (type === 'week') return mondayOf(str);
  if (type === 'month') return str.slice(0, 7);
  return str.slice(0, 4);
}

// Move a period key forward (n = 1) or back (n = -1)
export function shiftPeriod(type, key, n) {
  if (type === 'week') return addDays(key, n * 7);
  if (type === 'month') {
    const [y, m] = key.split('-').map(Number);
    const d = new Date(y, m - 1 + n, 1);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  }
  return String(Number(key) + n);
}

// 'YYYY-MM-DD' -> 'Oct 19'
export function formatShortDate(str) {
  return parseDateString(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Human label: 'Oct 26 – Nov 1', 'October 2026', '2026'
export function formatPeriodLabel(type, key) {
  if (type === 'week') {
    const short = { month: 'short', day: 'numeric' };
    const start = parseDateString(key).toLocaleDateString('en-US', short);
    const end = parseDateString(addDays(key, 6)).toLocaleDateString('en-US', short);
    return `${start} – ${end}`;
  }
  if (type === 'month') {
    const [y, m] = key.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  return key;
}