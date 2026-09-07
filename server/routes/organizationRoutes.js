const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validationHandler');
const { authHandler, requireRole, requirePermission } = require('../middlewares/authHandler');
const ctrl = require('../controllers/identity/organizationController');
const supportAccessCtrl = require('../controllers/identity/supportAccessController');
const { updateOrganizationSchema, updateFunctionsSchema } = require('../validators/organizationValidator');
const { createSupportAccessGrantSchema } = require('../validators/supportAccessValidator');

const router = express.Router();
router.use(authHandler);

router.get('/current', asyncHandler(ctrl.getCurrent));
router.patch('/current', requireRole('owner', 'admin'), validate(updateOrganizationSchema), asyncHandler(ctrl.updateCurrent));
router.patch('/current/functions', requirePermission('compliance.edit'), validate(updateFunctionsSchema), asyncHandler(ctrl.updateFunctions));
router.get('/current/members', asyncHandler(ctrl.listMembers));
router.get('/current/avv', asyncHandler(ctrl.getAvv));
router.get('/current/avv/pdf', asyncHandler(ctrl.avvPdf));

router.get('/current/support-access', requireRole('owner', 'admin'), asyncHandler(supportAccessCtrl.list));
router.post('/current/support-access', requireRole('owner', 'admin'), validate(createSupportAccessGrantSchema), asyncHandler(supportAccessCtrl.create));
router.post('/current/support-access/:id/revoke', requireRole('owner', 'admin'), asyncHandler(supportAccessCtrl.revoke));

module.exports = router;
