const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { authHandler, requireOrg } = require('../middlewares/authHandler');
const ctrl = require('../controllers/compliance/dashboardController');

const router = express.Router();
router.use(authHandler, requireOrg);

router.get('/summary', asyncHandler(ctrl.summary));
router.get('/trends', asyncHandler(ctrl.trends));

module.exports = router;
