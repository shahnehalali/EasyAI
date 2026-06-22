const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { authHandler, requireOrg } = require('../middlewares/authHandler');
const { upload } = require('../config/upload');
const ctrl = require('../controllers/compliance/documentController');

const router = express.Router();
router.use(authHandler, requireOrg);

router.post('/', upload.single('file'), asyncHandler(ctrl.create));
router.get('/', asyncHandler(ctrl.list));
router.get('/:id/download', asyncHandler(ctrl.download));
router.delete('/:id', asyncHandler(ctrl.remove));

module.exports = router;
