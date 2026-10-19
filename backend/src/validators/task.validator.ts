import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(5000).optional().default(''),
  status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done']).optional().default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  assignees: z.array(z.string()).optional().default([]),
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
  labels: z.array(z.string()).optional().default([]),
  checklist: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        completed: z.boolean(),
      })
    )
    .optional()
    .default([]),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignees: z.array(z.string()).optional(),
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
  labels: z.array(z.string()).optional(),
  checklist: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        completed: z.boolean(),
      })
    )
    .optional(),
  position: z.number().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done']),
  position: z.number().optional(),
});
