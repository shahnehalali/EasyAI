const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const json429 = (req, res) => res.status(429).json({
  error: { message: 'Too many requests. Please wait a few minutes and try again.' },
});

// General limiter for the auth surface (register, verify, reset, etc.).
// Generous by default so it never trips normal use; tune with RATE_LIMIT_MAX.
//
// Keying: the default is req.ip, but this cluster SNATs the source address, so
// every visitor shares one bucket and a single noisy caller could lock out all
// of them. Prefer the email in the body when there is one — that is the thing
// worth rate limiting on these routes anyway — and fall back to the (shared)
// IP only when there is nothing better.
const authLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: parseInt(process.env.RATE_LIMIT_MAX || '300', 10),
  standardHeaders: true,
  legacyHeaders: false,
  // ipKeyGenerator normalises IPv6 to a subnet, so a caller with a /64 cannot
  // sidestep the limit by rotating addresses.
  keyGenerator: (req) => {
    const email = req.body?.email;
    if (email) return `email:${String(email).toLowerCase()}`;
    return `ip:${ipKeyGenerator(req.ip)}`;
  },
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
