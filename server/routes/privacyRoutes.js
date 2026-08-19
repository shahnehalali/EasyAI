const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { authHandler } = require('../middlewares/authHandler');
const ctrl = require('../controllers/identity/privacyController');

const router = express.Router();
router.use(authHandler);

// Art. 15 / Art. 20 — access and portability.
router.get('/export', asyncHandler(ctrl.exportMe));
// Art. 17 — erasure. Both require the account password in the body.
router.delete('/me', asyncHandler(ctrl.deleteMe));
router.delete('/organization', asyncHandler(ctrl.deleteOrganization));

module.exports = router;
