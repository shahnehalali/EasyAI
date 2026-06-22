const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { authHandler, requireOrg } = require('../middlewares/authHandler');
const ctrl = require('../controllers/compliance/auditController');

const router = express.Router();
router.use(authHandler, requireOrg);

router.get('/', asyncHandler(ctrl.list));

module.exports = router;
