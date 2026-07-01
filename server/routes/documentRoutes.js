const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { authHandler, requireOrg, requirePermission } = require('../middlewares/authHandler');
const { upload } = require('../config/upload');
const ctrl = require('../controllers/compliance/documentController');

const router = express.Router();
router.use(authHandler, requireOrg);

router.post('/', requirePermission('compliance.edit'), upload.single('file'), asyncHandler(ctrl.create));
router.get('/', asyncHandler(ctrl.list));
router.get('/:id/download', asyncHandler(ctrl.download));
router.delete('/:id', requirePermission('compliance.edit'), asyncHandler(ctrl.remove));

module.exports = router;
