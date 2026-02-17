import { z } from "zod"

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().max(50).optional().default(""),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
})

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>

export const changeEmailSchema = z.object({
  newEmail: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export type ChangeEmailInput = z.infer<typeof changeEmailSchema>

export const updateTimezoneSchema = z.object({
  timezone: z.string().max(100).nullable(),
})

export type UpdateTimezoneInput = z.infer<typeof updateTimezoneSchema>
