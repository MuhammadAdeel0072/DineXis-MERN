const asyncHandler = require('express-async-handler');

const isDevelopment = process.env.NODE_ENV === 'development' && process.env.DEV_MODE === 'true';

const riderMiddleware = asyncHandler(async (req, res, next) => {
    // Development mode: allow all requests
    if (isDevelopment) {
        return next();
    }

    if (req.user && (req.user.role === 'rider' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as a rider');
    }
});

module.exports = { riderMiddleware };
