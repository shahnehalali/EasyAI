const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validationHandler');
const { authHandler, requireOrg, requirePermission } = require('../middlewares/authHandler');
const { authLimiter } = require('../middlewares/rateLimiter');
const ctrl = require('../controllers/identity/invitationController');
const { createInvitationSchema, acceptInvitationSchema } = require('../validators/invitationValidator');

const router = express.Router();

// Public accept flow (throttled like the rest of the auth surface).
router.get('/lookup/:token', authLimiter, asyncHandler(ctrl.lookup));
router.post('/accept', authLimiter, validate(acceptInvitationSchema), asyncHandler(ctrl.accept));

// Authenticated management (owner/admin).
router.post('/', authHandler, requireOrg, requirePermission('members.manage'), validate(createInvitationSchema), asyncHandler(ctrl.create));
router.get('/', authHandler, requireOrg, requirePermission('members.manage'), asyncHandler(ctrl.list));
router.delete('/:id', authHandler, requireOrg, requirePermission('members.manage'), asyncHandler(ctrl.revoke));

module.exports = router;
