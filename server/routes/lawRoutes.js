const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validationHandler');
const { authHandler } = require('../middlewares/authHandler');
const ctrl = require('../controllers/catalog/lawController');
const { analyzeSchema } = require('../validators/lawValidator');

const router = express.Router();
router.use(authHandler);

router.get('/', asyncHandler(ctrl.explorer));
router.post('/analyze', validate(analyzeSchema), asyncHandler(ctrl.analyze));

module.exports = router;
