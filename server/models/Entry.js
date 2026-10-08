const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
        unique: true
    },
    gym: {
        type: String,
        enum: ['none', 'floor', 'ceiling'],
        default: 'none'
    },
    jobApplications: {
        type: String,
        enum: ['none', 'floor', 'ceiling'],
        default: 'none'
    },
    skincare: {
        type: String,
        enum: ['none', 'floor', 'ceiling'],
        default: 'none'
    },
    nightlyAnchor: {
        type: Boolean,
        default: false
    },
    note: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const Entry = mongoose.model('Entry', entrySchema);

module.exports = Entry;