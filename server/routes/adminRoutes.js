const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validationHandler');
const { authHandler, requireRole } = require('../middlewares/authHandler');
const ctrl = require('../controllers/admin/adminController');
const { createFrameworkSchema, createRequirementSchema, createTemplateSchema } = require('../validators/adminValidator');

const router = express.Router();
router.use(authHandler, requireRole('platform_admin'));

router.get('/overview', asyncHandler(ctrl.overview));
router.post('/frameworks', validate(createFrameworkSchema), asyncHandler(ctrl.createFramework));
router.post('/frameworks/:key/requirements', validate(createRequirementSchema), asyncHandler(ctrl.createRequirement));
router.post('/frameworks/:key/templates', validate(createTemplateSchema), asyncHandler(ctrl.createTemplate));

module.exports = router;
