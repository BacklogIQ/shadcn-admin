import { z } from 'zod'

export const taskSchema = z.object({
  id: z.string(),
  organizationId: z.string().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.enum(['todo', 'in progress', 'done', 'canceled', 'backlog']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  label: z.enum(['bug', 'feature', 'documentation']).optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  createdBy: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Task = z.infer<typeof taskSchema>
