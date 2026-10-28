const Entry = require('../models/Entry');
const Prize = require('../models/Prize');
const Claim = require('../models/Claim');
const { TIERS, periodRange } = require('./periods');
const { MAX_PER_DAY, TIER_PERCENT, pointsForEntry, thresholdFor } = require('./points');

// Everything about one period: points, thresholds, which tiers are reached,
// each tier's prize, and whether it has been claimed.
// Used by the progress route (to display) and the claims route (to verify).
async function getProgress(periodType, periodKey) {
    const { start, end, days } = periodRange(periodType, periodKey);

    const [entries, prizes, claims] = await Promise.all([
        Entry.find({ date: { $gte: start, $lte: end } }),
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
            reached: points >= threshold,
            claimed: Boolean(claim),
            // once claimed, show the name that was claimed
            prize: claim ? claim.title : prize ? prize.title : null,
        };
    });

    return { periodType, periodKey, start, end, points, maxPoints, tiers };
}

module.exports = { getProgress };