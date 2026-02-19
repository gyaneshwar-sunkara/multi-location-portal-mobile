import { qk } from './query-keys';

describe('query-keys', () => {
  describe('static keys', () => {
    it('auth keys are stable', () => {
      expect(qk.auth).toEqual(['auth']);
      expect(qk.authMe).toEqual(['auth', 'me']);
    });

    it('organizations key is stable', () => {
      expect(qk.organizations).toEqual(['organizations']);
    });

    it('billing keys are stable', () => {
      expect(qk.subscription).toEqual(['billing', 'subscription']);
      expect(qk.plans).toEqual(['billing', 'plans']);
      expect(qk.invoices).toEqual(['billing', 'invoices']);
    });

    it('notifications keys are stable', () => {
      expect(qk.notifications).toEqual(['notifications']);
      expect(qk.notificationsUnread).toEqual(['notifications', 'unread']);
      expect(qk.notificationsPreferences).toEqual(['notifications', 'preferences']);
    });

    it('two-factor keys are stable', () => {
      expect(qk.twoFactorStatus).toEqual(['two-factor', 'status']);
      expect(qk.trustedDevices).toEqual(['two-factor', 'trusted-devices']);
    });

    it('orgMembers key is stable', () => {
      expect(qk.orgMembers).toEqual(['org-members']);
    });

    it('orgRoles key is stable', () => {
      expect(qk.orgRoles).toEqual(['org-roles']);
    });

    it('orgInvitations key is stable', () => {
      expect(qk.orgInvitations).toEqual(['org-invitations']);
    });

    it('roles key is stable', () => {
      expect(qk.roles).toEqual(['roles']);
    });

    it('permissions key is stable', () => {
      expect(qk.permissions).toEqual(['permissions']);
    });

    it('apiKeys key is stable', () => {
      expect(qk.apiKeys).toEqual(['api-keys']);
    });

    it('serviceAccounts key is stable', () => {
      expect(qk.serviceAccounts).toEqual(['service-accounts']);
    });

    it('webhooks key is stable', () => {
      expect(qk.webhooks).toEqual(['webhooks']);
    });

    it('webhookEvents key is stable', () => {
      expect(qk.webhookEvents).toEqual(['webhooks', 'events']);
    });

    it('loginHistory key is stable', () => {
      expect(qk.loginHistory).toEqual(['login-history']);
    });

    it('loginAlertPreference key is stable', () => {
      expect(qk.loginAlertPreference).toEqual(['login-alerts', 'preference']);
    });

    it('dataExports key is stable', () => {
      expect(qk.dataExports).toEqual(['data-exports']);
    });

    it('adminUsers key is stable', () => {
      expect(qk.adminUsers).toEqual(['admin-users']);
    });

    it('adminOrgs key is stable', () => {
      expect(qk.adminOrgs).toEqual(['admin-orgs']);
    });

    it('auditLogs key is stable', () => {
      expect(qk.auditLogs).toEqual(['audit-logs']);
    });

    it('auditFilters key is stable', () => {
      expect(qk.auditFilters).toEqual(['audit-filters']);
    });

    it('impersonationSessions key is stable', () => {
      expect(qk.impersonationSessions).toEqual(['impersonation-sessions']);
    });

    it('adminStats key is stable', () => {
      expect(qk.adminStats).toEqual(['admin-stats']);
    });

    it('ssoConfig key is stable', () => {
      expect(qk.ssoConfig).toEqual(['sso-config']);
    });

    it('sessions key is stable', () => {
      expect(qk.sessions).toEqual(['sessions']);
    });
  });

  describe('parameterized keys', () => {
    it('organizationsList includes params', () => {
      expect(qk.organizationsList({ page: 1 })).toEqual(['organizations', { page: 1 }]);
    });

    it('organizationsList without params', () => {
      expect(qk.organizationsList()).toEqual(['organizations', undefined]);
    });

    it('organizationDetail includes id', () => {
      expect(qk.organizationDetail('org-1')).toEqual(['organizations', 'org-1']);
    });

    it('members includes orgId', () => {
      expect(qk.members('org-1')).toEqual(['organizations', 'org-1', 'members']);
    });

    it('membersList includes orgId and params', () => {
      expect(qk.membersList('org-1', { role: 'admin' })).toEqual([
        'organizations', 'org-1', 'members', { role: 'admin' },
      ]);
    });

    it('orgMembersList includes params', () => {
      expect(qk.orgMembersList({ search: 'john' })).toEqual(['org-members', { search: 'john' }]);
    });

    it('rolesList includes params', () => {
      expect(qk.rolesList({ page: 1 })).toEqual(['roles', { page: 1 }]);
    });

    it('roleDetail includes id', () => {
      expect(qk.roleDetail('role-1')).toEqual(['roles', 'role-1']);
    });

    it('apiKeysList includes params', () => {
      expect(qk.apiKeysList({ active: true })).toEqual(['api-keys', { active: true }]);
    });

    it('serviceAccountsList includes params', () => {
      expect(qk.serviceAccountsList()).toEqual(['service-accounts', undefined]);
    });

    it('serviceAccountDetail includes id', () => {
      expect(qk.serviceAccountDetail('sa-1')).toEqual(['service-accounts', 'sa-1']);
    });

    it('serviceAccountKeys includes id', () => {
      expect(qk.serviceAccountKeys('sa-1')).toEqual(['service-accounts', 'sa-1', 'keys']);
    });

    it('webhooksList includes params', () => {
      expect(qk.webhooksList({ status: 'active' })).toEqual(['webhooks', { status: 'active' }]);
    });

    it('webhookDetail includes id', () => {
      expect(qk.webhookDetail('wh-1')).toEqual(['webhooks', 'wh-1']);
    });

    it('webhookDeliveries includes id', () => {
      expect(qk.webhookDeliveries('wh-1')).toEqual(['webhooks', 'wh-1', 'deliveries']);
    });

    it('webhookDeliveriesList includes id and params', () => {
      expect(qk.webhookDeliveriesList('wh-1', { page: 2 })).toEqual([
        'webhooks', 'wh-1', 'deliveries', { page: 2 },
      ]);
    });

    it('sessionsList includes params', () => {
      expect(qk.sessionsList({ active: true })).toEqual(['sessions', { active: true }]);
    });

    it('notificationsList includes params', () => {
      expect(qk.notificationsList({ unread: true })).toEqual(['notifications', { unread: true }]);
    });

    it('loginHistoryList includes params', () => {
      expect(qk.loginHistoryList({ page: 1 })).toEqual(['login-history', { page: 1 }]);
    });

    it('dataExportDetail includes id', () => {
      expect(qk.dataExportDetail('export-1')).toEqual(['data-exports', 'export-1']);
    });

    it('adminUsersList includes params', () => {
      expect(qk.adminUsersList({ search: 'test' })).toEqual(['admin-users', { search: 'test' }]);
    });

    it('adminOrgsList includes params', () => {
      expect(qk.adminOrgsList()).toEqual(['admin-orgs', undefined]);
    });

    it('auditLogsList includes params', () => {
      expect(qk.auditLogsList({ action: 'login' })).toEqual(['audit-logs', { action: 'login' }]);
    });

    it('impersonationSessionsList includes params', () => {
      expect(qk.impersonationSessionsList()).toEqual(['impersonation-sessions', undefined]);
    });
  });

  describe('key uniqueness', () => {
    it('different param values produce different keys', () => {
      const key1 = qk.organizationDetail('org-1');
      const key2 = qk.organizationDetail('org-2');
      expect(key1).not.toEqual(key2);
    });

    it('list keys with different params are distinct', () => {
      const key1 = qk.membersList('org-1', { page: 1 });
      const key2 = qk.membersList('org-1', { page: 2 });
      expect(key1).not.toEqual(key2);
    });
  });
});
