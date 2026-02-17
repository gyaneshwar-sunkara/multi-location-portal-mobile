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

  // Members (with orgId for cache separation, without for implicit org context)
  members: (orgId: string) => ["organizations", orgId, "members"] as const,
  membersList: (orgId: string, params?: Record<string, unknown>) =>
    ["organizations", orgId, "members", params] as const,
  orgMembers: ["org-members"] as const,
  orgMembersList: (params?: Record<string, unknown>) =>
    ["org-members", params] as const,
  orgRoles: ["org-roles"] as const,
  orgInvitations: ["org-invitations"] as const,

  // Roles
  roles: ["roles"] as const,
  rolesList: (params?: Record<string, unknown>) =>
    ["roles", params] as const,
  roleDetail: (id: string) => ["roles", id] as const,

  // Permissions
  permissions: ["permissions"] as const,

  // API Keys
  apiKeys: ["api-keys"] as const,
  apiKeysList: (params?: Record<string, unknown>) =>
    ["api-keys", params] as const,

  // Service Accounts
  serviceAccounts: ["service-accounts"] as const,
  serviceAccountsList: (params?: Record<string, unknown>) =>
    ["service-accounts", params] as const,
  serviceAccountDetail: (id: string) => ["service-accounts", id] as const,
  serviceAccountKeys: (id: string) => ["service-accounts", id, "keys"] as const,

  // Webhooks
  webhooks: ["webhooks"] as const,
  webhooksList: (params?: Record<string, unknown>) =>
    ["webhooks", params] as const,
  webhookDetail: (id: string) => ["webhooks", id] as const,
  webhookDeliveries: (id: string) => ["webhooks", id, "deliveries"] as const,
  webhookDeliveriesList: (id: string, params?: Record<string, unknown>) =>
    ["webhooks", id, "deliveries", params] as const,
  webhookEvents: ["webhooks", "events"] as const,

  // Billing
  subscription: ["billing", "subscription"] as const,
  plans: ["billing", "plans"] as const,
  invoices: ["billing", "invoices"] as const,

  // Notifications
  notifications: ["notifications"] as const,
  notificationsList: (params?: Record<string, unknown>) =>
    ["notifications", params] as const,
  notificationsUnread: ["notifications", "unread"] as const,

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

  // SSO Config
  ssoConfig: ["sso-config"] as const,
} as const
