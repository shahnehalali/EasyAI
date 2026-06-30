const { z } = require('zod');

// Create a discussion thread (optionally anchored to a framework/requirement).
const createThreadSchema = z.object({
  title: z.string().trim().min(4, 'Give your discussion a clear title').max(160),
  body: z.string().trim().min(1, 'Write something to start the discussion').max(20000),
  visibility: z.enum(['global', 'org']).default('global'),
  frameworkKey: z.string().trim().max(80).nullish(),
  requirementCode: z.string().trim().max(80).nullish(),
});

// A reply (post) in a thread. parentPostId allows one level of nesting.
const createPostSchema = z.object({
  body: z.string().trim().min(1, 'Reply cannot be empty').max(20000),
  parentPostId: z.string().uuid().nullish(),
});

// Vote on a thread or a post. value 0 clears the vote.
const voteSchema = z.object({
  targetType: z.enum(['thread', 'post']),
  targetId: z.string().uuid(),
  value: z.union([z.literal(1), z.literal(0), z.literal(-1)]),
});

const reportSchema = z.object({
  targetType: z.enum(['thread', 'post']),
  targetId: z.string().uuid(),
  reason: z.string().trim().min(1, 'Tell us what is wrong').max(1000),
});

// Query for listing threads.
const listThreadsSchema = z.object({
  frameworkKey: z.string().trim().max(80).optional(),
  scope: z.enum(['all', 'global', 'org']).default('all'),
  sort: z.enum(['hot', 'new', 'top']).default('hot'),
  q: z.string().trim().max(200).optional(),
  lang: z.enum(['en', 'de']).optional(),
});

module.exports = { createThreadSchema, createPostSchema, voteSchema, reportSchema, listThreadsSchema };
