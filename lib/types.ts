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
