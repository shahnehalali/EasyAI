const ErrorResponse = require('../../utils/errorResponse');
const { avvPdfPath } = require('../../services/avv/avvService');

// GET /api/dpa/versions/:version.pdf
// Public and unauthenticated: the standard AVV template, the same file for
// every visitor, so it can be linked from the Security page and the public
// /avv page for anyone evaluating the product before they have an account.
// Distinct from GET /api/organizations/current/avv/pdf, which is
// authenticated and serves the specific version a given organisation
// actually accepted.
async function pdfByVersion(req, res) {
  const version = req.params.version.replace(/\.pdf$/i, '');
  const filePath = avvPdfPath(version);
  if (!filePath) throw new ErrorResponse('Unknown Data Processing Agreement version', 404);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="avv-compliance-check-v${version}.pdf"`);
  res.sendFile(filePath);
}

module.exports = { pdfByVersion };
