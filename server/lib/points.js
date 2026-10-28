// ---- The scoring rules live here, in one place ----

// The first day you tracked. A week, month, or year that began earlier is measured
// from this date instead, so the first partial period has a fair target.
// Format: YYYY-MM-DD
const TRACKING_START = '2026-10-19';
// Goals that have a floor and a ceiling
const TIERED_GOALS = ['gym', 'jobApplications', 'skincare'];

// Points for a tiered goal: floor = 1, ceiling = 2
const LEVEL_POINTS = { none: 0, floor: 1, ceiling: 2 };

// The nightly anchor is done / not done, worth 1 point
const ANCHOR_POINTS = 1;

// Best possible day: every tiered goal at ceiling + the anchor = 7
const MAX_PER_DAY = TIERED_GOALS.length * LEVEL_POINTS.ceiling + ANCHOR_POINTS;

// How much of the period's maximum each tier needs (percent).
// Perfect at 100 means everything at ceiling every day.
const TIER_PERCENT = { floor: 60, ceiling: 85, perfect: 100 };

function pointsForEntry(entry) {
    let total = 0;
    for (const goal of TIERED_GOALS) {
        const level = entry[goal];
        if (Object.hasOwn(LEVEL_POINTS, level)) total += LEVEL_POINTS[level];
    }
    if (entry.nightlyAnchor === true) total += ANCHOR_POINTS;
    return total;
}

// Points needed for a tier. Integer math (x * percent / 100) avoids floating-point surprises.
function thresholdFor(tier, maxPoints) {
    return Math.ceil((maxPoints * TIER_PERCENT[tier]) / 100);
}

module.exports = { TRACKING_START, MAX_PER_DAY, TIER_PERCENT, pointsForEntry, thresholdFor };