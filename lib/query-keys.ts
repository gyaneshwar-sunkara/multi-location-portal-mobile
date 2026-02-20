export const qk = {
  // Auth
  auth: ["auth"] as const,
  authMe: ["auth", "me"] as const,

  // Sessions
  sessions: ["sessions"] as const,
  sessionsList: (params?: Record<string, unknown>) =>
    ["sessions", params] as const,

  // Organizations
  organizations: ["organizations"] as const,
  organizationsList: (params?: Record<string, unknown>) =>
    ["organizations", params] as const,
  organizationDetail: (id: string) => ["organizations", id] as const,

  // Members (with orgId for cache separation on org switch)
  members: (orgId: string) => ["organizations", orgId, "members"] as const,
  membersList: (orgId: string, params?: Record<string, unknown>) =>
    ["organizations", orgId, "members", params] as const,
  orgMembers: (orgId: string) => ["org-members", orgId] as const,
  orgMembersList: (orgId: string, params?: Record<string, unknown>) =>
    ["org-members", orgId, params] as const,
  orgRoles: (orgId: string) => ["org-roles", orgId] as const,
  orgInvitations: (orgId: string) => ["org-invitations", orgId] as const,

  // Roles (org-scoped)
  roles: (orgId: string) => ["roles", orgId] as const,
  rolesList: (orgId: string, params?: Record<string, unknown>) =>
    ["roles", orgId, params] as const,
  roleDetail: (id: string) => ["roles", id] as const,

  // Permissions (org-scoped)
  permissions: (orgId: string) => ["permissions", orgId] as const,

  // API Keys (org-scoped)
  apiKeys: (orgId: string) => ["api-keys", orgId] as const,
  apiKeysList: (orgId: string, params?: Record<string, unknown>) =>
    ["api-keys", orgId, params] as const,

  // Service Accounts (org-scoped)
  serviceAccounts: (orgId: string) => ["service-accounts", orgId] as const,
  serviceAccountsList: (orgId: string, params?: Record<string, unknown>) =>
    ["service-accounts", orgId, params] as const,
  serviceAccountDetail: (id: string) => ["service-accounts", id] as const,
  serviceAccountKeys: (id: string) => ["service-accounts", id, "keys"] as const,

  // Webhooks (org-scoped)
  webhooks: (orgId: string) => ["webhooks", orgId] as const,
  webhooksList: (orgId: string, params?: Record<string, unknown>) =>
    ["webhooks", orgId, params] as const,
  webhookDetail: (id: string) => ["webhooks", id] as const,
  webhookDeliveries: (id: string) => ["webhooks", id, "deliveries"] as const,
  webhookDeliveriesList: (id: string, params?: Record<string, unknown>) =>
    ["webhooks", id, "deliveries", params] as const,
  webhookEvents: ["webhooks", "events"] as const,

  // Billing (org-scoped)
  subscription: (orgId: string) => ["billing", "subscription", orgId] as const,
  plans: ["billing", "plans"] as const,
  invoices: (orgId: string) => ["billing", "invoices", orgId] as const,

  // Notifications
  notifications: ["notifications"] as const,
  notificationsList: (params?: Record<string, unknown>) =>
    ["notifications", params] as const,
  notificationsUnread: ["notifications", "unread"] as const,
  notificationsPreferences: ["notifications", "preferences"] as const,

  // Two-factor
  twoFactorStatus: ["two-factor", "status"] as const,
  trustedDevices: ["two-factor", "trusted-devices"] as const,

  // Login history & alerts
  loginHistory: ["login-history"] as const,
  loginHistoryList: (params?: Record<string, unknown>) =>
    ["login-history", params] as const,
  loginAlertPreference: ["login-alerts", "preference"] as const,

  // Data exports (GDPR)
  dataExports: ["data-exports"] as const,
  dataExportDetail: (id: string) => ["data-exports", id] as const,

  // Admin - Users
  adminUsers: ["admin-users"] as const,
  adminUsersList: (params?: Record<string, unknown>) =>
    ["admin-users", params] as const,

  // Admin - Organizations
  adminOrgs: ["admin-orgs"] as const,
  adminOrgsList: (params?: Record<string, unknown>) =>
    ["admin-orgs", params] as const,

  // Admin - Audit Logs
  auditLogs: ["audit-logs"] as const,
  auditLogsList: (params?: Record<string, unknown>) =>
    ["audit-logs", params] as const,
  auditFilters: ["audit-filters"] as const,

  // Admin - Impersonation Sessions
  impersonationSessions: ["impersonation-sessions"] as const,
  impersonationSessionsList: (params?: Record<string, unknown>) =>
    ["impersonation-sessions", params] as const,

  // Admin - Stats
  adminStats: ["admin-stats"] as const,

  // SSO Config (org-scoped)
  ssoConfig: (orgId: string) => ["sso-config", orgId] as const,
} as const
