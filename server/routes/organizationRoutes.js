const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validationHandler');
const { authHandler, requireRole, requirePermission } = require('../middlewares/authHandler');
const ctrl = require('../controllers/identity/organizationController');
const { updateOrganizationSchema, updateFunctionsSchema } = require('../validators/organizationValidator');

const router = express.Router();
router.use(authHandler);

router.get('/current', asyncHandler(ctrl.getCurrent));
router.patch('/current', requireRole('owner', 'admin'), validate(updateOrganizationSchema), asyncHandler(ctrl.updateCurrent));
router.patch('/current/functions', requirePermission('compliance.edit'), validate(updateFunctionsSchema), asyncHandler(ctrl.updateFunctions));
router.get('/current/members', asyncHandler(ctrl.listMembers));

module.exports = router;
