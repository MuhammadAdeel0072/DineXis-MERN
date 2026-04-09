const { getAuth } = require('@clerk/express');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// Development mode: Skip auth for smooth development experience
const isDevelopment = process.env.NODE_ENV === 'development' && process.env.DEV_MODE === 'true';

// Full protect: validates JWT + requires user in MongoDB
// In dev mode, creates a unique user per Clerk ID or uses dev_user
const protect = asyncHandler(async (req, res, next) => {
  // Development mode: bypass auth, attach actual user from DB
  if (isDevelopment) {
    const { userId } = getAuth(req);
    
    // If Clerk is configured and provides a userId, use it
    if (userId) {
      let user = await User.findOne({ clerkId: userId });
      
      if (!user) {
        // Create new user for this Clerk ID
        user = await User.create({
          clerkId: userId,
          email: `${userId}@dev.local`,
          role: 'customer',
          firstName: 'Dev',
          lastName: 'User'
        });
      }
      
      req.user = user;
      return next();
    }

    // Fall back to shared dev_user if Clerk is not configured
    let devUser = await User.findOne({ clerkId: 'dev_user' });
    
    if (!devUser) {
      devUser = await User.create({
        clerkId: 'dev_user',
        email: 'dev@localhost',
        role: 'admin',
        firstName: 'Dev',
        lastName: 'User'
      });
    }
    
    req.user = devUser;
    return next();
  }

  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  // Find user in our database by clerkId
  let user = await User.findOne({ clerkId: userId });

  if (!user) {
    res.status(401);
    throw new Error('User not found in database');
  }

  req.user = user;
  next();
});

// Lightweight auth: validates JWT only, no DB lookup.
// Use for routes that may run before the user exists in MongoDB (e.g. /sync).
// In dev mode, creates a mock user automatically
const clerkAuth = asyncHandler(async (req, res, next) => {
  // Development mode: bypass auth
  if (isDevelopment) {
    const { userId } = getAuth(req);
    req.clerkUserId = userId || 'dev_user';
    return next();
  }

  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  req.clerkUserId = userId;
  next();
});

module.exports = { protect, clerkAuth };
