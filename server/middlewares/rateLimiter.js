const rateLimit = require('express-rate-limit');

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const json429 = (req, res) => res.status(429).json({
  error: { message: 'Too many requests. Please wait a few minutes and try again.' },
});

// General limiter for the auth surface (register, verify, reset, etc.).
// Generous by default so it never trips normal use; tune with RATE_LIMIT_MAX.
const authLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: parseInt(process.env.RATE_LIMIT_MAX || '300', 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
});

// Stricter lockout for sign-in: counts only FAILED attempts, keyed by email,
// so brute-forcing a single account is blocked after 10 failures in the window.
const loginLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: parseInt(process.env.LOGIN_LIMIT_MAX || '10', 10),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${req.body?.email || 'unknown'}`.toLowerCase(),
  handler: (req, res) => res.status(429).json({
    error: { message: 'Too many sign-in attempts for this account. Please wait 15 minutes or reset your password.' },
  }),
});

module.exports = { authLimiter, loginLimiter };
