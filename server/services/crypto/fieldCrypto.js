// Per-organization field encryption (application-level, at rest).
//
// Model: a random 256-bit Data Encryption Key (DEK) per organisation, itself
// wrapped (AES-256-GCM) by a single master key from config.dataEncKey. Field
// values are encrypted with the org DEK. This means:
//   - a stolen database / backup / disk is unreadable without the master key;
//   - a single organisation can be crypto-shredded by dropping its wrapped DEK.
//
// Ciphertext format (a plain string, so schema stays String/Json):
//   enc:1:<base64(iv|tag|ciphertext)>
// Anything without the "enc:1:" prefix is treated as plaintext, so this is
// backward compatible with existing rows and safe when no master key is set
// (dev passthrough).

const crypto = require('crypto');
const config = require('../../config');
const logger = require('../../utils/logger');
const { prisma } = require('../../db/db');

const PREFIX = 'enc:1:';
const ALG = 'aes-256-gcm';

function masterKey() {
  const b64 = config.dataEncKey;
  if (!b64) return null;
  const key = Buffer.from(b64, 'base64');
  if (key.length !== 32) throw new Error('DATA_ENC_KEY must be base64-encoded 32 bytes');
  return key;
}

// Low-level AES-256-GCM. Returns "enc:1:<base64>".
function seal(key, plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALG, key, iv);
  const ct = Buffer.concat([cipher.update(Buffer.from(plaintext, 'utf8')), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, ct]).toString('base64');
}
function open(key, blob) {
  const raw = Buffer.from(blob.slice(PREFIX.length), 'base64');
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const ct = raw.subarray(28);
  const decipher = crypto.createDecipheriv(ALG, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

// ---- Per-org DEK ----
const dekCache = new Map(); // orgId -> Buffer(32)

// Load (and lazily create) the organisation's data key, unwrapped.
async function getDek(organizationId) {
  if (!organizationId) return null;
  if (dekCache.has(organizationId)) return dekCache.get(organizationId);
  const mk = masterKey();
  if (!mk) return null; // passthrough mode

  const org = await prisma.organization.findUnique({ where: { id: organizationId }, select: { encKeyWrapped: true } });
  if (!org) return null;

  let dek;
  if (org.encKeyWrapped) {
    dek = Buffer.from(open(mk, org.encKeyWrapped), 'base64');
  } else {
    dek = crypto.randomBytes(32);
    const wrapped = seal(mk, dek.toString('base64'));
    await prisma.organization.update({ where: { id: organizationId }, data: { encKeyWrapped: wrapped } });
  }
  dekCache.set(organizationId, dek);
  return dek;
}

// Drop a cached DEK. Called after an organisation is crypto-shredded so a
// long-lived process cannot keep decrypting data whose key is gone.
function forgetDek(organizationId) {
  dekCache.delete(organizationId);
}

// Crypto-shredding (GDPR Art. 17): discard the wrapped data key. Every field
// encrypted with it becomes permanently unrecoverable, which erases the content
// even in backups taken before the request. Irreversible by design.
async function shredOrgKey(organizationId) {
  forgetDek(organizationId);
  await prisma.organization.updateMany({
    where: { id: organizationId },
    data: { encKeyWrapped: null },
  });
}

const isEncrypted = (v) => typeof v === 'string' && v.startsWith(PREFIX);

// ---- Public API (string fields) ----
async function encryptField(organizationId, value) {
  if (value === null || value === undefined || value === '') return value;
  const dek = await getDek(organizationId);
  if (!dek) return value; // passthrough (no master key)
  return seal(dek, String(value));
}
async function decryptField(organizationId, value) {
  if (!isEncrypted(value)) return value; // plaintext / null → as-is
  const dek = await getDek(organizationId);
  if (!dek) return value; // cannot decrypt without key
  try { return open(dek, value); } catch (err) { logger.error('fieldCrypto: decrypt failed', err.message); return value; }
}

// ---- Public API (JSON fields: stored as an encrypted JSON string) ----
async function encryptJson(organizationId, obj) {
  if (obj === null || obj === undefined) return obj;
  const dek = await getDek(organizationId);
  if (!dek) return obj; // passthrough: store the object as-is
  return seal(dek, JSON.stringify(obj));
}
async function decryptJson(organizationId, value) {
  if (!isEncrypted(value)) return value; // already a plain object / null
  const dek = await getDek(organizationId);
  if (!dek) return value;
  try { return JSON.parse(open(dek, value)); } catch (err) { logger.error('fieldCrypto: decryptJson failed', err.message); return value; }
}

// ---- Binary (uploaded files) ----
async function encryptBuffer(organizationId, buf) {
  const dek = await getDek(organizationId);
  if (!dek) return { data: buf, encrypted: false };
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALG, dek, iv);
  const ct = Buffer.concat([cipher.update(buf), cipher.final()]);
  return { data: Buffer.concat([iv, cipher.getAuthTag(), ct]), encrypted: true };
}
async function decryptBuffer(organizationId, buf) {
  const dek = await getDek(organizationId);
  if (!dek) return buf;
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const decipher = crypto.createDecipheriv(ALG, dek, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]);
}

module.exports = {
  encryptField, decryptField, encryptJson, decryptJson,
  encryptBuffer, decryptBuffer, isEncrypted, getDek,
  forgetDek, shredOrgKey,
};
