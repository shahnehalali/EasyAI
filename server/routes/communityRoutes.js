const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validationHandler');
const { authHandler, requireOrg, requirePermission } = require('../middlewares/authHandler');
const threads = require('../controllers/community/threadController');
const posts = require('../controllers/community/postController');
const {
  createThreadSchema, createPostSchema, voteSchema, reportSchema, listThreadsSchema,
} = require('../validators/communityValidator');

const router = express.Router();
router.use(authHandler, requireOrg);

// Reads are open to any org member (incl. viewers); writes need compliance.edit.
const canWrite = requirePermission('compliance.edit');

// Threads
router.get('/threads', validate(listThreadsSchema, 'query'), asyncHandler(threads.list));
router.post('/threads', canWrite, validate(createThreadSchema), asyncHandler(threads.create));
router.get('/threads/:id', asyncHandler(threads.getById));
router.delete('/threads/:id', canWrite, asyncHandler(threads.remove));
router.post('/threads/:id/vote', canWrite, validate(voteSchema.pick({ value: true })), asyncHandler(threads.vote));
router.post('/threads/:id/lock', canWrite, asyncHandler(threads.lock));

// Posts (replies)
router.post('/threads/:id/posts', canWrite, validate(createPostSchema), asyncHandler(posts.create));
router.post('/posts/:id/vote', canWrite, validate(voteSchema.pick({ value: true })), asyncHandler(posts.vote));
router.delete('/posts/:id', canWrite, asyncHandler(posts.remove));

// Moderation reporting
router.post('/report', canWrite, validate(reportSchema), asyncHandler(posts.report));

module.exports = router;
