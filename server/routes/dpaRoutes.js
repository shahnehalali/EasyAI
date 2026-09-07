const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const ctrl = require('../controllers/legal/dpaController');

const router = express.Router();

// No authHandler: this is the public, unauthenticated AVV template.
router.get('/versions/:version', asyncHandler(ctrl.pdfByVersion));

module.exports = router;
