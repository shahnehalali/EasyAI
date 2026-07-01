const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validationHandler');
const { authHandler, requireOrg, requirePermission } = require('../middlewares/authHandler');
const ctrl = require('../controllers/compliance/commentController');
const { createCommentSchema } = require('../validators/commentValidator');

const router = express.Router();
router.use(authHandler, requireOrg);

router.post('/', requirePermission('compliance.edit'), validate(createCommentSchema), asyncHandler(ctrl.create));
router.get('/', asyncHandler(ctrl.listByAssessment));
router.delete('/:id', requirePermission('compliance.edit'), asyncHandler(ctrl.remove));

module.exports = router;
