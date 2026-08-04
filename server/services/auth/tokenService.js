const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../../config');

// JWT for the session cookie.
function signSession(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

// Short-lived token issued after a correct password when the account has MFA on.
// It only proves "password was correct" — it is NOT a session (no role, purpose
// 'mfa'), so it cannot be used as the session cookie. Exchanged for a real
// session at /auth/mfa/verify once the TOTP/backup code checks out.
function signMfaChallenge(user) {
  return jwt.sign({ sub: user.id, purpose: 'mfa' }, config.jwt.secret, { expiresIn: '10m' });
}
function verifyMfaChallenge(token) {
  const payload = jwt.verify(token, config.jwt.secret);
  if (payload.purpose !== 'mfa') throw new Error('not an mfa challenge token');
  return payload;
}

// Opaque email/reset tokens: return the raw token (emailed) and its SHA-256 hash (stored).
function createOpaqueToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = hashToken(raw);
  return { raw, hash };
}

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

module.exports = { signSession, signMfaChallenge, verifyMfaChallenge, createOpaqueToken, hashToken };
