const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validationHandler');
const { authHandler, requireOrg, requirePermission } = require('../middlewares/authHandler');
const ctrl = require('../controllers/compliance/assessmentController');
const { startChecklistSchema, startFrameworksSchema } = require('../validators/assessmentValidator');

const router = express.Router();
router.use(authHandler, requireOrg);

router.get('/', asyncHandler(ctrl.list));
router.post('/start', requirePermission('compliance.edit'), validate(startChecklistSchema), asyncHandler(ctrl.start));
router.post('/start-frameworks', requirePermission('compliance.edit'), validate(startFrameworksSchema), asyncHandler(ctrl.startFrameworks));
router.get('/:id', asyncHandler(ctrl.getById));
router.get('/:id/activity', asyncHandler(ctrl.getActivity));
router.post('/:id/mark-reviewed', requirePermission('compliance.edit'), asyncHandler(ctrl.markReviewed));

module.exports = router;
