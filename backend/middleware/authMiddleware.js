// const jwt = require('jsonwebtoken');
// const User = require('../models/userModel');

// const protect = async (req, res, next) => {
//   let token;

//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     try {
//       token = req.headers.authorization.split(' ')[1];

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       req.user = await User.findById(decoded.id).select('-password');
//       next();
//     } catch (error) {
//       console.error(error);
//       res.status(401).json({ message: 'Not authorized, token failed' });
//     }
//   }

//   if (!token) {
//     res.status(401).json({ message: 'Not authorized, no token' });
//   }
// };

// module.exports = { protect };

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/**
 * Middleware to protect routes that require authentication
 * Verifies JWT token and attaches user to request object
 */
const protect = async (req, res, next) => {
  let token;

  try {
    // Check for token in Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Alternative: Check for token in cookies (useful for browser-based requests)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Alternative: Check for token in query parameters (for specific use cases)
    else if (req.query && req.query.token) {
      token = req.query.token;
    }

    // If no token found, deny access
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login to access this resource.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token has expired (additional verification)
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }

    // Find user by ID from token
    const user = await User.findById(decoded.id).select('-password');

    // Check if user still exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists. Please login again.'
      });
    }

    // Check if user is active (optional - requires isActive field in User model)
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Attach user to request object
    req.user = user;
    req.token = token;

    // Proceed to next middleware/route handler
    next();

  } catch (error) {
    console.error('AUTH MIDDLEWARE ERROR:', error);

    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }

    // Generic error
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Authentication failed.'
    });
  }
};

/**
 * Middleware to check if user has admin role
 * Must be used after protect middleware
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

/**
 * Middleware to check if user has specific role(s)
 * @param {string|string[]} roles - Role or array of roles allowed
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login first.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't block request if token is missing
 */
const optionalAuth = async (req, res, next) => {
  let token;

  try {
    // Check for token in various places
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    // If token exists, try to verify and attach user
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (user && user.isActive !== false) {
        req.user = user;
        req.token = token;
      }
    }

    // Continue regardless of token validity
    next();

  } catch (error) {
    // Silently fail - this is optional auth
    console.log('Optional auth failed:', error.message);
    next();
  }
};

/**
 * Middleware to verify account ownership
 * Ensures user can only access/modify their own data
 */
const verifyOwnership = (req, res, next) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login first.'
    });
  }

  // Get the resource owner ID from params or body
  const resourceOwnerId = req.params.userId || req.params.id || req.body.userId;

  // Check if user owns the resource or is admin
  if (req.user._id.toString() !== resourceOwnerId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.'
    });
  }

  next();
};

/**
 * Rate limiting middleware for authentication routes
 * Prevents brute force attacks
 */
const authRateLimiter = (() => {
  const attempts = new Map();
  const MAX_ATTEMPTS = 5;
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!attempts.has(identifier)) {
      attempts.set(identifier, { count: 1, resetTime: now + WINDOW_MS });
      return next();
    }

    const record = attempts.get(identifier);

    // Reset if window has passed
    if (now > record.resetTime) {
      attempts.set(identifier, { count: 1, resetTime: now + WINDOW_MS });
      return next();
    }

    // Increment attempt count
    record.count++;

    if (record.count > MAX_ATTEMPTS) {
      const remainingTime = Math.ceil((record.resetTime - now) / 1000 / 60);
      return res.status(429).json({
        success: false,
        message: `Too many authentication attempts. Please try again in ${remainingTime} minutes.`
      });
    }

    next();
  };
})();

/**
 * Middleware to check if JWT_SECRET is configured
 * Should be used at app initialization
 */
const validateJWTConfig = (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is not defined in environment variables');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error. Please contact support.'
    });
  }
  next();
};

module.exports = {
  protect,
  admin,
  authorize,
  optionalAuth,
  verifyOwnership,
  authRateLimiter,
  validateJWTConfig
};