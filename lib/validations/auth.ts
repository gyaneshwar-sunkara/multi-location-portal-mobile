import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  terms: z.literal(true, {
    error: "You must accept the terms and conditions",
  }),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
})

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>

export const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
})

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>

export const verify2faSchema = z.object({
  challengeToken: z.string().min(1, "Challenge token is required"),
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d{6}$/, "Code must be 6 digits"),
  trustDevice: z.boolean().optional().default(false),
})

export type Verify2faInput = z.infer<typeof verify2faSchema>

export const verifyRecoverySchema = z.object({
  challengeToken: z.string().min(1, "Challenge token is required"),
  code: z.string().min(1, "Recovery code is required"),
})

export type VerifyRecoveryInput = z.infer<typeof verifyRecoverySchema>
