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
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Connection error:', err));

app.listen(5000, () => console.log('Server running on port 5000'));