const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { authHandler } = require('../middlewares/authHandler');
const ctrl = require('../controllers/catalog/frameworkController');

const router = express.Router();
router.use(authHandler);

router.get('/', asyncHandler(ctrl.list));
router.get('/:key', asyncHandler(ctrl.getByKey));
router.get('/:key/requirements', asyncHandler(ctrl.getRequirements));
router.get('/:key/templates', asyncHandler(ctrl.getTemplates));

module.exports = router;
