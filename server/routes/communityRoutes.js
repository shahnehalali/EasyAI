const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validationHandler');
const { authHandler, requireOrg } = require('../middlewares/authHandler');
const threads = require('../controllers/community/threadController');
const posts = require('../controllers/community/postController');
const {
  createThreadSchema, createPostSchema, voteSchema, reportSchema, listThreadsSchema,
} = require('../validators/communityValidator');

const router = express.Router();
router.use(authHandler, requireOrg);

// Threads
router.get('/threads', validate(listThreadsSchema, 'query'), asyncHandler(threads.list));
router.post('/threads', validate(createThreadSchema), asyncHandler(threads.create));
router.get('/threads/:id', asyncHandler(threads.getById));
router.delete('/threads/:id', asyncHandler(threads.remove));
router.post('/threads/:id/vote', validate(voteSchema.pick({ value: true })), asyncHandler(threads.vote));
router.post('/threads/:id/lock', asyncHandler(threads.lock));

// Posts (replies)
router.post('/threads/:id/posts', validate(createPostSchema), asyncHandler(posts.create));
router.post('/posts/:id/vote', validate(voteSchema.pick({ value: true })), asyncHandler(posts.vote));
router.delete('/posts/:id', asyncHandler(posts.remove));

// Moderation reporting
router.post('/report', validate(reportSchema), asyncHandler(posts.report));

module.exports = router;
