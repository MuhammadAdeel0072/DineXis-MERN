const mongoose = require('mongoose');

const loyaltyTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['earned', 'redeemed', 'expired', 'bonus'],
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    transactionDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);
