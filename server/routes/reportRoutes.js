const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { authHandler, requireOrg, requirePermission } = require('../middlewares/authHandler');
const ctrl = require('../controllers/reports/reportController');

const router = express.Router();
router.use(authHandler, requireOrg, requirePermission('export'));

router.get('/assessments/:id/pdf', asyncHandler(ctrl.assessmentPdf));
router.get('/organization/pdf', asyncHandler(ctrl.organizationPdf));
router.get('/organization/csv', asyncHandler(ctrl.organizationCsv));
router.get('/audit/csv', asyncHandler(ctrl.auditCsv));
router.post('/monthly/run', asyncHandler(ctrl.runMonthly));

module.exports = router;
