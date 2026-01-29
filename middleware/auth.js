/**
 * Authentication Middleware
 * Protects GA4 admin routes
 */

const jwt = require('jsonwebtoken');

/**
 * Simple admin authentication middleware
 * TODO: Replace with proper JWT/session authentication
 */
const authenticateAdmin = (req, res, next) => {
  // For now, check for admin token in header
  // In production, implement proper JWT validation
  const token = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-admin-token'];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Admin authentication required',
      },
    });
  }

  // Simple token validation (replace with proper JWT verification)
  // For development, accept any token. In production, verify JWT:
  /*
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      },
    });
  }
  */

  // Development mode - accept any token
  req.admin = { id: 'admin', role: 'admin' };
  next();
};

/**
 * Rate limiting helper (basic)
 * Use express-rate-limit for production
 */
const rateLimit = (windowMs = 60000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [k, v] of requests.entries()) {
      if (v.lastRequest < windowStart) {
        requests.delete(k);
      }
    }

    const userRequests = requests.get(key) || { count: 0, lastRequest: now };

    if (userRequests.lastRequest < windowStart) {
      userRequests.count = 0;
    }

    if (userRequests.count >= max) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
        },
      });
    }

    userRequests.count++;
    userRequests.lastRequest = now;
    requests.set(key, userRequests);

    next();
  };
};

module.exports = {
  authenticateAdmin,
  rateLimit,
};
