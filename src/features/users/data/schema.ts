import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('owner'),
  z.literal('admin'),
  z.literal('member'),
  z.literal('viewer'),
])

const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  status: userStatusSchema,
  role: userRoleSchema,
  organizationId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
