const express = require('express');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const invitationRoutes = require('./invitationRoutes');
const organizationRoutes = require('./organizationRoutes');
const frameworkRoutes = require('./frameworkRoutes');
const lawRoutes = require('./lawRoutes');
const aiSystemRoutes = require('./aiSystemRoutes');
const assessmentRoutes = require('./assessmentRoutes');
const checklistResponseRoutes = require('./checklistResponseRoutes');
const commentRoutes = require('./commentRoutes');
const documentRoutes = require('./documentRoutes');
const notificationRoutes = require('./notificationRoutes');
const reminderRoutes = require('./reminderRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const reportRoutes = require('./reportRoutes');
const auditRoutes = require('./auditRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/invitations', invitationRoutes);
router.use('/organizations', organizationRoutes);
router.use('/frameworks', frameworkRoutes);
router.use('/laws', lawRoutes);
router.use('/ai-systems', aiSystemRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/checklist-responses', checklistResponseRoutes);
router.use('/comments', commentRoutes);
router.use('/documents', documentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reminders', reminderRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/audit', auditRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
