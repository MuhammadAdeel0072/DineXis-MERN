const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String,
        trim: true
    },
    discountPercentage: { 
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    category: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    image: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Deal', dealSchema);
