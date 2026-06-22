const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validationHandler');
const { authHandler, requireOrg } = require('../middlewares/authHandler');
const ctrl = require('../controllers/engagement/reminderController');
const { updateReminderSchema, runDueSchema } = require('../validators/reminderValidator');

const router = express.Router();
router.use(authHandler, requireOrg);

router.get('/', asyncHandler(ctrl.list));
router.post('/run-due', validate(runDueSchema), asyncHandler(ctrl.runDue));
router.patch('/:id', validate(updateReminderSchema), asyncHandler(ctrl.update));

module.exports = router;
