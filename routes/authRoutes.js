/**
 * Auth Routes
 * POST /api/auth/login – admin login, returns JWT
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { success, token, user: { email }, expiresIn } or 401
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_CREDENTIALS',
        message: 'Email and password are required',
      },
    });
  }

  const secret = process.env.JWT_SECRET;
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!secret || !adminEmail || adminPassword === undefined || adminPassword === '') {
    return res.status(503).json({
      success: false,
      error: {
        code: 'AUTH_NOT_CONFIGURED',
        message: 'Server auth (JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD) is not configured',
      },
    });
  }

  if (email.trim().toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    });
  }

  const expiresIn = '7d';
  const token = jwt.sign(
    { email: adminEmail, role: 'admin' },
    secret,
    { expiresIn }
  );

  res.json({
    success: true,
    token,
    user: { email: adminEmail, role: 'admin' },
    expiresIn,
  });
});

module.exports = router;
