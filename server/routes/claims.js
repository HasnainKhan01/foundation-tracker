const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const { TIERS, checkPeriod } = require('../lib/periods');
const { getProgress } = require('../lib/progress');

// POST /api/claims  { periodType, periodKey, tier }
// The client only says WHAT it wants to claim. The server decides whether it's allowed.
router.post('/', async (req, res) => {
    const { periodType, periodKey, tier } = req.body ?? {};
    const problem = checkPeriod(periodType, periodKey);
    if (problem) return res.status(400).json({ error: problem });
    if (typeof tier !== 'string' || !TIERS.includes(tier)) {
        return res.status(400).json({ error: 'tier must be floor, ceiling, or perfect' });
    }

    try {
        // Recalculate from the saved entries rather than trusting anything from the client
        const progress = await getProgress(periodType, periodKey);
        const t = progress.tiers.find((x) => x.tier === tier);

        if (t.claimed) return res.status(409).json({ error: 'Already claimed' });
        if (!t.reached) return res.status(400).json({ error: 'Not enough points yet' });
        if (!t.prize) return res.status(400).json({ error: 'Set a prize for this tier first' });

        const claim = await Claim.create({ periodType, periodKey, tier, title: t.prize });
        res.status(201).json(claim);
    } catch (err) {
        // Two claims at the same moment both pass the check above; the unique index
        // lets only one insert succeed and rejects the other with error code 11000
        if (err.code === 11000) return res.status(409).json({ error: 'Already claimed' });
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;