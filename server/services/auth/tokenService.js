const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../../config');

// JWT for the session cookie.
function signSession(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
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

module.exports = { signSession, createOpaqueToken, hashToken };
