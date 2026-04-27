const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // TTL: auto-delete after 5 minutes
    }
});

// Compound index for quick lookups
otpSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('OTP', otpSchema);
