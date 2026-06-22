const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { authHandler } = require('../middlewares/authHandler');
const ctrl = require('../controllers/engagement/notificationController');

const router = express.Router();
router.use(authHandler);

router.get('/', asyncHandler(ctrl.list));
router.get('/unread-count', asyncHandler(ctrl.unreadCount));
router.patch('/read-all', asyncHandler(ctrl.markAllRead));
router.patch('/:id/read', asyncHandler(ctrl.markRead));

module.exports = router;
