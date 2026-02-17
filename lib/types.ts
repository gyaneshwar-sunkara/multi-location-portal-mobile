// ── Auth Response Types (mirrors saas/api auth.dto.ts) ──────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  timezone: string | null;
  defaultOrgId: string | null;
  platformRole: string | null;
  platformPermissions: string[];
  createdAt: string;
}

export interface Membership {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  roleName: string;
  roleHierarchy: number;
  status: string;
}

export interface TokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse extends TokensResponse {
  user: User;
}

export interface MeResponse extends User {
  memberships: Membership[];
}

export interface TwoFactorChallengeResponse {
  requiresTwoFactor: true;
  challengeToken: string;
  methods: ('totp' | 'email' | 'sms')[];
  expiresAt: string;
}

export type LoginResponse = AuthResponse | TwoFactorChallengeResponse;

export function isTwoFactorChallenge(
  response: LoginResponse,
): response is TwoFactorChallengeResponse {
  return 'requiresTwoFactor' in response && response.requiresTwoFactor === true;
}

// ── Organization Types ──────────────────────────────────────────────────────

export interface OrgMember {
  id: string;
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  roleId: string;
  roleName: string;
  roleSlug: string;
  status: string;
  joinedAt: string | null;
}

export interface OrgRole {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
}

export interface OrgInvitation {
  id: string;
  email: string;
  roleName: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

// ── Admin Types ─────────────────────────────────────────────────────────────

export interface AdminStats {
  users: { total: number; active: number; verified: number; with2FA: number; deleted: number };
  organizations: { total: number; active: number; suspended: number; pending: number };
  sessions: { active: number };
}

// ── Notification Types ──────────────────────────────────────────────────────

export type NotificationType = 'SECURITY' | 'SYSTEM' | 'ORGANIZATION' | 'INVITATION';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string | null;
  actionUrl: string | null;
  readAt: string | null;
  dismissedAt: string | null;
  createdAt: string;
}

export interface NotificationPreferences {
  email: { security: boolean; organization: boolean; marketing: boolean };
  push: { security: boolean; organization: boolean };
}

// ── Generic Utility Types ───────────────────────────────────────────────────

export interface ActionResult {
  success?: boolean;
  error?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  skip: number;
  take: number;
}
