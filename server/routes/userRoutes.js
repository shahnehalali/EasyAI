const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validationHandler');
const { authHandler, requireOrg, requirePermission } = require('../middlewares/authHandler');
const ctrl = require('../controllers/identity/userController');
const { updateMeSchema, updateRoleSchema } = require('../validators/userValidator');

const router = express.Router();
router.use(authHandler);

router.patch('/me', validate(updateMeSchema), asyncHandler(ctrl.updateMe));
router.patch('/:id/role', requireOrg, requirePermission('members.manage'), validate(updateRoleSchema), asyncHandler(ctrl.updateRole));
router.delete('/:id', requireOrg, requirePermission('members.manage'), asyncHandler(ctrl.removeMember));

module.exports = router;
