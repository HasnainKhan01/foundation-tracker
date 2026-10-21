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
