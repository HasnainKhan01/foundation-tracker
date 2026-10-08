const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');

router.get('/:date', async (req, res) => {
  try {
    const entry = await Entry.findOne({ date: req.params.date });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:date', async (req, res) => {
    try {
        const { field, value } = req.body;
        const entry = await Entry.findOneAndUpdate(
            { date: req.params.date },
            { [field]: value },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );
        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/:date/note', async (req, res) => {
    try {
        const { note } = req.body;
        const entry = await Entry.findOneAndUpdate(
            { date: req.params.date },
            { note },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );
        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const { start, end } = req.query;
        const entries = await Entry.find({
            date: { $gte: start, $lte: end }
        }).sort({ date: 1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;