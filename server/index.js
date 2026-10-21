require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const entriesRouter = require('./routes/entries');
const guideRouter = require('./routes/guide');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/entries', entriesRouter);
app.use('/api/guide', guideRouter);

// Health check: the frontend pings this to know when the server (and DB) is awake
app.get('/api/health', (req, res) => {
    res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Connection error:', err));

app.listen(5000, () => console.log('Server running on port 5000'));