const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const Prize = require('../models/Prize');
const { TIERS, checkPeriod, periodRange } = require('../lib/periods');
const { MAX_PER_DAY, TIER_PERCENT, pointsForEntry, thresholdFor } = require('../lib/points');

// GET /api/progress?periodType=week&periodKey=2026-10-26
// Points are always calculated here from the saved entries and never stored,
// so the numbers can't drift out of sync with what was actually logged.
router.get('/', async (req, res) => {
    const { periodType, periodKey } = req.query;
    const problem = checkPeriod(periodType, periodKey);
    if (problem) return res.status(400).json({ error: problem });

    try {
        const { start, end, days } = periodRange(periodType, periodKey);

        const [entries, prizes] = await Promise.all([
            Entry.find({ date: { $gte: start, $lte: end } }),
            Prize.find({ periodType, periodKey }),
        ]);

        const points = entries.reduce((sum, entry) => sum + pointsForEntry(entry), 0);
        const maxPoints = days * MAX_PER_DAY;

        const tiers = TIERS.map((tier) => {
            const threshold = thresholdFor(tier, maxPoints);
            const prize = prizes.find((p) => p.tier === tier);
            return {
                tier,
                percent: TIER_PERCENT[tier],
                threshold,
                reached: points >= threshold,
                prize: prize ? prize.title : null,
            };
        });

        res.json({ periodType, periodKey, start, end, points, maxPoints, tiers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;