const mongoose = require('mongoose');

// A claim = "I cashed in this tier's prize for this period".
// title is a copy of the prize name at claim time, so the history stays accurate
// even if the prize is edited later.
const claimSchema = new mongoose.Schema({
    periodType: {
        type: String,
        enum: ['week', 'month', 'year'],
        required: true
    },
    periodKey: {
        type: String,
        required: true
    },
    tier: {
        type: String,
        enum: ['floor', 'ceiling', 'perfect'],
        required: true
    },
    title: {
        type: String,
        required: true
    }
}, { timestamps: true });

// The database itself guarantees a tier can be claimed once per period
claimSchema.index({ periodType: 1, periodKey: 1, tier: 1 }, { unique: true });

module.exports = mongoose.model('Claim', claimSchema);