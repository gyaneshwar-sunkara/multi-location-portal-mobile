export const P = {
  DASHBOARD_READ: "platform.dashboard.read",
  USERS_READ: "platform.users.read",
  USERS_WRITE: "platform.users.write",
  USERS_DELETE: "platform.users.delete",
  AUDIT_READ: "platform.audit.read",
  AUDIT_EXPORT: "platform.audit.export",
  FEATURE_FLAGS_READ: "platform.feature-flags.read",
  FEATURE_FLAGS_WRITE: "platform.feature-flags.write",
  ORGS_READ: "platform.organizations.read",
  ORGS_WRITE: "platform.organizations.write",
  ORGS_DELETE: "platform.organizations.delete",
  SYSTEM_READ: "platform.system.read",
  IMPERSONATION: "platform.impersonation",
} as const

export type Permission = (typeof P)[keyof typeof P]

export const PLATFORM_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
  PLATFORM_VIEWER: "PLATFORM_VIEWER",
} as const

export type PlatformRole = (typeof PLATFORM_ROLES)[keyof typeof PLATFORM_ROLES]

/**
 * Check whether the user has any platform role (SUPER_ADMIN, PLATFORM_ADMIN, PLATFORM_VIEWER).
 */
export function isPlatformUser(platformRole: string | null | undefined): boolean {
  if (!platformRole) return false
  return Object.values(PLATFORM_ROLES).includes(platformRole as PlatformRole)
}

export function hasPermission(
  userPermissions: string[] | undefined | null,
  permission: Permission,
): boolean {
  return userPermissions?.includes(permission) ?? false
}

export function hasAnyPermission(
  userPermissions: string[] | undefined | null,
  permissions: Permission[],
): boolean {
  return permissions.some((p) => userPermissions?.includes(p))
}

// ── Organization Roles ──────────────────────────────────────────────────────

// Default hierarchy levels — org roles are dynamic, so we use numeric thresholds
export const ORG_HIERARCHY = {
  ADMIN_LEVEL: 3, // admin and above can manage settings
  MEMBER_LEVEL: 2, // members and above can view content
} as const

/**
 * Check if the user's role hierarchy meets the required level.
 * Org roles are dynamic — use the numeric `roleHierarchy` from OrgMembership.
 */
export function meetsOrgHierarchy(
  userHierarchy: number | undefined | null,
  requiredLevel: number,
): boolean {
  if (userHierarchy == null) return false
  return userHierarchy >= requiredLevel
}
