const express = require('express');
const router = express.Router();
const guideContent = require('../guideContent');

router.post('/unlock', (req, res) => {
    const { password } = req.body;

    if (password === process.env.GUIDE_PASSWORD) {
        res.json({ success: true, content: guideContent });
    } else {
        res.status(401).json({ success: false, error: 'Incorrect password' });
    }
});

module.exports = router;