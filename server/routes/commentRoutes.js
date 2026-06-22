const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validationHandler');
const { authHandler, requireOrg } = require('../middlewares/authHandler');
const ctrl = require('../controllers/compliance/commentController');
const { createCommentSchema } = require('../validators/commentValidator');

const router = express.Router();
router.use(authHandler, requireOrg);

router.post('/', validate(createCommentSchema), asyncHandler(ctrl.create));
router.get('/', asyncHandler(ctrl.listByAssessment));
router.delete('/:id', asyncHandler(ctrl.remove));

module.exports = router;
