const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const { prisma } = require('../../db/db');
const ErrorResponse = require('../../utils/errorResponse');
const { recordAudit } = require('../../utils/audit');
const { verifyMfaChallenge } = require('../../services/auth/tokenService');
const { encryptField, decryptField } = require('../../services/crypto/fieldCrypto');
const { publicUser, setSessionCookie } = require('./authController');

const ISSUER = 'Compliance Check';
// Accept the code from the adjacent 30s step too, to tolerate clock drift.
authenticator.options = { window: 1 };

const BACKUP_CODE_COUNT = 10;
// Readable one-time codes like "a1b2-c3d4" (~32 bits each).
function generateBackupCodes() {
  return Array.from({ length: BACKUP_CODE_COUNT }, () => {
    const raw = crypto.randomBytes(4).toString('hex');
    return `${raw.slice(0, 4)}-${raw.slice(4)}`;
  });
}

// POST /api/auth/mfa/setup  (authenticated)
// Generates a TOTP secret, stores it (encrypted, not yet enabled), and returns
// the QR + secret for the user's authenticator app.
async function setup(req, res) {
  const user = req.user;
  if (user.mfaEnabled) throw new ErrorResponse('Two-factor authentication is already enabled', 409);
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(user.email, ISSUER, secret);
  const qr = await qrcode.toDataURL(otpauthUrl);
  await prisma.user.update({
    where: { id: user.id },
    data: { mfaSecret: await encryptField(user.organizationId, secret) },
  });
  res.json({ secret, otpauthUrl, qr });
}

// POST /api/auth/mfa/enable  { code }  (authenticated)
// Confirms the user's app is set up by checking one code, then turns MFA on and
// hands back one-time backup codes (shown once).
async function enable(req, res) {
  const user = req.user;
  if (user.mfaEnabled) throw new ErrorResponse('Two-factor authentication is already enabled', 409);
  if (!user.mfaSecret) throw new ErrorResponse('Start setup first', 400);

  const secret = await decryptField(user.organizationId, user.mfaSecret);
  const ok = authenticator.verify({ token: String(req.body.code || '').replace(/\s/g, ''), secret });
  if (!ok) throw new ErrorResponse('That code is not valid. Check your authenticator app and try again.', 400);

  const codes = generateBackupCodes();
  const hashes = await Promise.all(codes.map((c) => bcrypt.hash(c, 10)));
  await prisma.user.update({
    where: { id: user.id },
    data: { mfaEnabled: true, mfaBackupCodes: hashes },
  });
  await recordAudit({ req, action: 'auth.mfa.enabled', entityType: 'User', entityId: user.id });
  res.json({ enabled: true, backupCodes: codes });
}

// POST /api/auth/mfa/disable  { password }  (authenticated)
// Re-authenticates with the password, then clears all MFA material.
async function disable(req, res) {
  const user = req.user;
  const ok = await bcrypt.compare(String(req.body.password || ''), user.passwordHash);
  if (!ok) throw new ErrorResponse('Incorrect password', 403);
  await prisma.user.update({
    where: { id: user.id },
    data: { mfaEnabled: false, mfaSecret: null, mfaBackupCodes: null },
  });
  await recordAudit({ req, action: 'auth.mfa.disabled', entityType: 'User', entityId: user.id });
  res.json({ enabled: false });
}

// POST /api/auth/mfa/verify  { mfaToken, code }  (unauthenticated — completes login)
// Exchanges a valid password-challenge token + a correct TOTP (or backup) code
// for a real session.
async function verify(req, res) {
  const { mfaToken, code } = req.body;
  let payload;
  try { payload = verifyMfaChallenge(mfaToken); } catch (err) {
    throw new ErrorResponse('Your verification session expired. Please sign in again.', 401);
  }
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.mfaEnabled || !user.mfaSecret) throw new ErrorResponse('Please sign in again.', 401);

  const entered = String(code || '').trim();
  const secret = await decryptField(user.organizationId, user.mfaSecret);
  let ok = authenticator.verify({ token: entered.replace(/\s/g, ''), secret });

  // Fall back to a one-time backup code, consuming it on success.
  if (!ok && Array.isArray(user.mfaBackupCodes)) {
    const guess = entered.toLowerCase();
    for (let i = 0; i < user.mfaBackupCodes.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      if (await bcrypt.compare(guess, user.mfaBackupCodes[i])) {
        const remaining = user.mfaBackupCodes.filter((_, idx) => idx !== i);
        // eslint-disable-next-line no-await-in-loop
        await prisma.user.update({ where: { id: user.id }, data: { mfaBackupCodes: remaining } });
        ok = true;
        break;
      }
    }
  }
  if (!ok) throw new ErrorResponse('That code is not valid.', 401);

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await recordAudit({ req, action: 'auth.login.mfa', entityType: 'User', entityId: user.id });
  setSessionCookie(res, user);
  res.json({ message: 'Signed in', user: publicUser(user) });
}

module.exports = { setup, enable, disable, verify };
