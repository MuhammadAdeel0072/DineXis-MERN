const rateLimit = require('express-rate-limit');

// Rate limiter for OTP send requests
// Max 3 OTP requests per IP per minute
const otpSendLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3,
    message: {
        status: 429,
        message: 'Too many OTP requests. Please wait 1 minute before trying again.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Rate limit by IP + email combination
        return `${req.ip}-${req.body?.email || 'unknown'}`;
    }
});

// Rate limiter for OTP verification attempts
// Max 5 verify attempts per IP per 5 minutes
const otpVerifyLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5,
    message: {
        status: 429,
        message: 'Too many verification attempts. Please request a new OTP.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return `${req.ip}-${req.body?.email || 'unknown'}`;
    }
});

module.exports = { otpSendLimiter, otpVerifyLimiter };
