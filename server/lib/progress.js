const Entry = require('../models/Entry');
const Prize = require('../models/Prize');
const Claim = require('../models/Claim');
const { TIERS, periodRange, daysInclusive } = require('./periods');
const { TRACKING_START, MAX_PER_DAY, TIER_PERCENT, pointsForEntry, thresholdFor } = require('./points');

// Everything about one period: points, thresholds, which tiers are reached,
// each tier's prize, and whether it has been claimed.
// Used by the progress route (to display) and the claims route (to verify).
async function getProgress(periodType, periodKey) {
    const { start, end } = periodRange(periodType, periodKey);

    // Only count days from when you started tracking (YYYY-MM-DD strings compare correctly).
    // Points and the maximum both use this same window, so the target stays fair.
    const windowStart = start > TRACKING_START ? start : TRACKING_START;
    const days = Math.max(0, daysInclusive(windowStart, end));
    const tracked = days > 0; // false for periods that ended before you started

    const [entries, prizes, claims] = await Promise.all([
        Entry.find({ date: { $gte: windowStart, $lte: end } }),
        Prize.find({ periodType, periodKey }),
        Claim.find({ periodType, periodKey }),
    ]);

    const points = entries.reduce((sum, entry) => sum + pointsForEntry(entry), 0);
    const maxPoints = days * MAX_PER_DAY;

    const tiers = TIERS.map((tier) => {
        const prize = prizes.find((p) => p.tier === tier);
        const claim = claims.find((c) => c.tier === tier);
        const threshold = thresholdFor(tier, maxPoints);
        return {
            tier,
            percent: TIER_PERCENT[tier],
            threshold,
            reached: tracked && points >= threshold,
            claimed: Boolean(claim),
            // once claimed, show the name that was claimed
            prize: claim ? claim.title : prize ? prize.title : null,
        };
    });

    return { periodType, periodKey, start, end, windowStart, tracked, points, maxPoints, tiers };
}

module.exports = { getProgress };