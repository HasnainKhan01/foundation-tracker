const mongoose = require('mongoose');

// One prize = "for THIS period, this tier earns THIS reward".
// periodKey identifies the specific week/month/year:
//   week  -> the Monday's date, e.g. '2026-10-26'
//   month -> '2026-10'
//   year  -> '2026'
const prizeSchema = new mongoose.Schema({
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
        required: true,
        trim: true,
        maxlength: 100
    }
}, { timestamps: true });

// At most one prize per tier per period. This is enforced by the database itself,
// so even two simultaneous requests can't create a duplicate.
prizeSchema.index({ periodType: 1, periodKey: 1, tier: 1 }, { unique: true });

module.exports = mongoose.model('Prize', prizeSchema);