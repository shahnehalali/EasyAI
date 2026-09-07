const fs = require('fs');
const path = require('path');

// The Art. 28 GDPR data processing agreement (AVV) is a static, versioned
// legal document, not something generated per organisation: the framework
// text applies the same way to every customer, only the acceptance record
// (who accepted it, when, on behalf of which company) is per-organisation
// data, held in the AvvAcceptance table, not in the PDF body. Adding a new
// version means dropping a new file here and adding one line below; old
// acceptances keep resolving to the version they actually accepted (AVV
// Section 18(a): "Fruehere Fassungen bleiben abrufbar").
const AVV_VERSIONS = {
  '1.0': path.join(__dirname, '..', '..', 'legal', 'avv-v1.0.pdf'),
};

const CURRENT_AVV_VERSION = '1.0';

function avvPdfPath(version) {
  const file = AVV_VERSIONS[version];
  if (!file || !fs.existsSync(file)) return null;
  return file;
}

function getAvvPdfBuffer(version) {
  const file = avvPdfPath(version);
  if (!file) return null;
  return fs.readFileSync(file);
}

module.exports = { AVV_VERSIONS, CURRENT_AVV_VERSION, avvPdfPath, getAvvPdfBuffer };
