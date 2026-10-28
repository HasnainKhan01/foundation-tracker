const express = require('express');
const router = express.Router();
const { checkPeriod } = require('../lib/periods');
const { getProgress } = require('../lib/progress');

// GET /api/progress?periodType=week&periodKey=2026-10-26
// Points are always calculated on the server from the saved entries and never stored,
// so the numbers can't drift out of sync with what was actually logged.
router.get('/', async (req, res) => {
    const { periodType, periodKey } = req.query;
    const problem = checkPeriod(periodType, periodKey);
    if (problem) return res.status(400).json({ error: problem });

    try {
        res.json(await getProgress(periodType, periodKey));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;