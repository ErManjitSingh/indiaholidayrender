/**
 * Authentication Middleware
 * Protects GA4 admin routes
 */

const jwt = require('jsonwebtoken');

/**
 * Optional: skip GA4 auth when SKIP_GA4_AUTH=1 (e.g. for health checks / testing)
 */
const skipAuth = process.env.SKIP_GA4_AUTH === '1' || process.env.SKIP_GA4_AUTH === 'true';

/**
 * Simple admin authentication middleware
 * TODO: Replace with proper JWT/session authentication
 */
const authenticateAdmin = (req, res, next) => {
  if (skipAuth) {
    req.admin = { id: 'admin', role: 'admin' };
    return next();
  }

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

  // If JWT_SECRET is set, verify token from POST /api/auth/login
  const secret = process.env.JWT_SECRET;
  if (secret) {
    try {
      const decoded = jwt.verify(token, secret);
      req.admin = { id: decoded.email, email: decoded.email, role: decoded.role || 'admin' };
      return next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
      });
    }
  }

  // No JWT_SECRET: accept any token (dev only)
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
