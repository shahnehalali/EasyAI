const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validationHandler');
const { authHandler, requireOrg, requirePermission } = require('../middlewares/authHandler');
const ctrl = require('../controllers/compliance/aiSystemController');
const { createAiSystemSchema, updateAiSystemSchema, classifySchema } = require('../validators/aiSystemValidator');

const router = express.Router();
router.use(authHandler, requireOrg);

router.post('/', validate(createAiSystemSchema), asyncHandler(ctrl.create));
router.get('/', asyncHandler(ctrl.list));
router.get('/:id', asyncHandler(ctrl.getById));
router.patch('/:id', validate(updateAiSystemSchema), asyncHandler(ctrl.update));
router.delete('/:id', requirePermission('compliance.edit'), asyncHandler(ctrl.remove));
router.get('/:id/questionnaire', asyncHandler(ctrl.getQuestionnaire));
router.post('/:id/classify', validate(classifySchema), asyncHandler(ctrl.classify));
router.get('/:id/data-profile', asyncHandler(ctrl.getDataProfile));
router.get('/:id/data-profile/pdf', asyncHandler(ctrl.dataProfilePdf));
router.post('/:id/data-profile', requirePermission('compliance.edit'), asyncHandler(ctrl.saveDataProfile));
router.post('/:id/data-profile/assessment', requirePermission('compliance.edit'), asyncHandler(ctrl.createProfileAssessment));

module.exports = router;
