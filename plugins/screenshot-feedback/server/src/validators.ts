import { z } from 'zod';

const DATA_URL = /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/;

export const feedbackSchema = z.object({
  title: z.string().trim().min(3, 'Title is too short').max(200),
  description: z.string().trim().min(5, 'Description is too short').max(5000),
  screenshot: z
    .string()
    .regex(DATA_URL, 'screenshot must be a base64 PNG/JPEG/WebP data URL')
    .max(15_000_000, 'screenshot exceeds 15MB cap'),
  pageUrl: z.string().url().max(2048).optional(),
  userAgent: z.string().max(512).optional(),
  viewport: z
    .object({
      width: z.number().int().positive().max(20000),
      height: z.number().int().positive().max(20000),
    })
    .optional(),
  meta: z
    .record(z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
