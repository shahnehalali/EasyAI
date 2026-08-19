const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', 'uploads');

// Memory storage, NOT diskStorage: the file has to be encrypted with the
// organisation's data key before anything is written, so multer must hand us
// the bytes rather than persist them itself. The 10 MB cap keeps this bounded.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Opaque on-disk name. Keeps the original filename (which can itself be
// personal data, e.g. "DPIA-Mueller.pdf") out of the filesystem — it lives
// only in the Document row.
function newStorageKey(originalName) {
  const ext = path.extname(originalName || '');
  return `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
}

module.exports = { upload, uploadDir, newStorageKey };
