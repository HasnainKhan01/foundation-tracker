const PERIOD_TYPES = ['week', 'month', 'year'];
const TIERS = ['floor', 'ceiling', 'perfect'];

// Is this a real calendar date written as YYYY-MM-DD, and is it a Monday?
function isMonday(str) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
    const d = new Date(`${str}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === str && d.getUTCDay() === 1;
}

const KEY_CHECKS = {
    week: isMonday,
    month: (s) => /^\d{4}-(0[1-9]|1[0-2])$/.test(s),
    year: (s) => /^\d{4}$/.test(s),
};

// Returns an error message if the period is invalid, otherwise null.
// typeof === 'string' also rejects objects like { "$ne": "" } (Mongo operator injection).
function checkPeriod(periodType, periodKey) {
    if (typeof periodType !== 'string' || !PERIOD_TYPES.includes(periodType)) {
        return 'periodType must be week, month, or year';
    }
    if (typeof periodKey !== 'string' || !KEY_CHECKS[periodType](periodKey)) {
        return `periodKey is not a valid ${periodType}`;
    }
    return null;
}

// 'YYYY-MM-DD' + n days -> 'YYYY-MM-DD' (UTC math, so no daylight-saving surprises)
function addDays(str, n) {
    const d = new Date(`${str}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
}

// First day, last day, and number of days in a period
function periodRange(periodType, periodKey) {
    if (periodType === 'week') {
        return { start: periodKey, end: addDays(periodKey, 6), days: 7 };
    }
    if (periodType === 'month') {
        const [y, m] = periodKey.split('-').map(Number);
        const days = new Date(Date.UTC(y, m, 0)).getUTCDate(); // day 0 of next month = last day of this one
        return { start: `${periodKey}-01`, end: `${periodKey}-${String(days).padStart(2, '0')}`, days };
    }
    const y = Number(periodKey);
    const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    return { start: `${periodKey}-01-01`, end: `${periodKey}-12-31`, days: leap ? 366 : 365 };
}

module.exports = { PERIOD_TYPES, TIERS, checkPeriod, periodRange };