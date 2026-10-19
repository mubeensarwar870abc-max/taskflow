import { z } from 'zod';

export const createCommentSchema = z.object({
  text: z.string().min(1, 'Comment text cannot be empty').max(3000, 'Comment is too long'),
});

export const updateCommentSchema = z.object({
  text: z.string().min(1, 'Comment text cannot be empty').max(3000, 'Comment is too long'),
});
