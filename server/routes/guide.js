const express = require('express');
const router = express.Router();
const guideContent = process.env.GUIDE_CONTENT;

router.post('/unlock', (req, res) => {
    const { password } = req.body;

    if (password === process.env.GUIDE_PASSWORD) {
        res.json({ success: true, content: guideContent });
    } else {
        res.status(401).json({ success: false, error: 'Incorrect password' });
    }
});

module.exports = router;