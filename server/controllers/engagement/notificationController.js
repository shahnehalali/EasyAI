const { prisma } = require('../../db/db');
const ErrorResponse = require('../../utils/errorResponse');

// GET /api/notifications
async function list(req, res) {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json({ notifications });
}

// GET /api/notifications/unread-count
async function unreadCount(req, res) {
  const count = await prisma.notification.count({ where: { userId: req.user.id, readAt: null } });
  res.json({ count });
}

// PATCH /api/notifications/:id/read
async function markRead(req, res) {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification || notification.userId !== req.user.id) throw new ErrorResponse('Notification not found', 404);
  const updated = await prisma.notification.update({ where: { id: notification.id }, data: { readAt: new Date() } });
  res.json({ notification: updated });
}

// PATCH /api/notifications/read-all
async function markAllRead(req, res) {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, readAt: null },
    data: { readAt: new Date() },
  });
  res.json({ message: 'All notifications marked as read' });
}

module.exports = { list, unreadCount, markRead, markAllRead };
