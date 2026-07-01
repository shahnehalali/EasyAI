const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validationHandler');
const { authHandler, requireOrg, requirePermission } = require('../middlewares/authHandler');
const ctrl = require('../controllers/compliance/checklistResponseController');
const { updateResponseSchema } = require('../validators/checklistResponseValidator');

const router = express.Router();
router.use(authHandler, requireOrg);

router.patch('/:id', requirePermission('compliance.edit'), validate(updateResponseSchema), asyncHandler(ctrl.update));

module.exports = router;
