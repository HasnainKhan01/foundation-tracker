const express = require('express');
const router = express.Router();
const Prize = require('../models/Prize');

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

// GET /api/prizes?periodType=week&periodKey=2026-10-26  -> prizes for that period
router.get('/', async (req, res) => {
    const { periodType, periodKey } = req.query;
    const problem = checkPeriod(periodType, periodKey);
    if (problem) return res.status(400).json({ error: problem });

    try {
        const prizes = await Prize.find({ periodType, periodKey });
        res.json(prizes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/prizes  { periodType, periodKey, tier, title }  -> create or replace that tier's prize
router.put('/', async (req, res) => {
    const { periodType, periodKey, tier, title } = req.body ?? {};
    const problem = checkPeriod(periodType, periodKey);
    if (problem) return res.status(400).json({ error: problem });
    if (typeof tier !== 'string' || !TIERS.includes(tier)) {
        return res.status(400).json({ error: 'tier must be floor, ceiling, or perfect' });
    }
    if (typeof title !== 'string' || title.trim() === '' || title.trim().length > 100) {
        return res.status(400).json({ error: 'title must be 1 to 100 characters' });
    }

    try {
        // Upsert: update the prize if one exists for this period+tier, otherwise create it
        const prize = await Prize.findOneAndUpdate(
            { periodType, periodKey, tier },
            { $set: { title: title.trim() } },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );
        res.json(prize);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/prizes?periodType=...&periodKey=...&tier=...  -> remove that tier's prize
router.delete('/', async (req, res) => {
    const { periodType, periodKey, tier } = req.query;
    const problem = checkPeriod(periodType, periodKey);
    if (problem) return res.status(400).json({ error: problem });
    if (typeof tier !== 'string' || !TIERS.includes(tier)) {
        return res.status(400).json({ error: 'tier must be floor, ceiling, or perfect' });
    }

    try {
        await Prize.deleteOne({ periodType, periodKey, tier });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;