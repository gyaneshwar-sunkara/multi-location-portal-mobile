import { z } from "zod"

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  roleId: z.string().min(1, "Role is required"),
})

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>

export const updateOrgSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
})

export type UpdateOrgInput = z.infer<typeof updateOrgSchema>

export const createOrgSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(63)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
})

export type CreateOrgInput = z.infer<typeof createOrgSchema>
