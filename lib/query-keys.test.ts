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

    it('billing plans key is stable', () => {
      expect(qk.plans).toEqual(['billing', 'plans']);
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

    it('sessions key is stable', () => {
      expect(qk.sessions).toEqual(['sessions']);
    });
  });

  describe('org-scoped keys include orgId', () => {
    const orgId = 'org-1';

    it('orgMembers includes orgId', () => {
      expect(qk.orgMembers(orgId)).toEqual(['org-members', 'org-1']);
    });

    it('orgRoles includes orgId', () => {
      expect(qk.orgRoles(orgId)).toEqual(['org-roles', 'org-1']);
    });

    it('orgInvitations includes orgId', () => {
      expect(qk.orgInvitations(orgId)).toEqual(['org-invitations', 'org-1']);
    });

    it('roles includes orgId', () => {
      expect(qk.roles(orgId)).toEqual(['roles', 'org-1']);
    });

    it('permissions includes orgId', () => {
      expect(qk.permissions(orgId)).toEqual(['permissions', 'org-1']);
    });

    it('apiKeys includes orgId', () => {
      expect(qk.apiKeys(orgId)).toEqual(['api-keys', 'org-1']);
    });

    it('serviceAccounts includes orgId', () => {
      expect(qk.serviceAccounts(orgId)).toEqual(['service-accounts', 'org-1']);
    });

    it('webhooks includes orgId', () => {
      expect(qk.webhooks(orgId)).toEqual(['webhooks', 'org-1']);
    });

    it('subscription includes orgId', () => {
      expect(qk.subscription(orgId)).toEqual(['billing', 'subscription', 'org-1']);
    });

    it('invoices includes orgId', () => {
      expect(qk.invoices(orgId)).toEqual(['billing', 'invoices', 'org-1']);
    });

    it('ssoConfig includes orgId', () => {
      expect(qk.ssoConfig(orgId)).toEqual(['sso-config', 'org-1']);
    });

    it('different orgIds produce different keys', () => {
      expect(qk.orgMembers('org-1')).not.toEqual(qk.orgMembers('org-2'));
      expect(qk.roles('org-1')).not.toEqual(qk.roles('org-2'));
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

    it('orgMembersList includes orgId and params', () => {
      expect(qk.orgMembersList('org-1', { search: 'john' })).toEqual(['org-members', 'org-1', { search: 'john' }]);
    });

    it('rolesList includes orgId and params', () => {
      expect(qk.rolesList('org-1', { page: 1 })).toEqual(['roles', 'org-1', { page: 1 }]);
    });

    it('roleDetail includes id', () => {
      expect(qk.roleDetail('role-1')).toEqual(['roles', 'role-1']);
    });

    it('apiKeysList includes orgId and params', () => {
      expect(qk.apiKeysList('org-1', { active: true })).toEqual(['api-keys', 'org-1', { active: true }]);
    });

    it('serviceAccountsList includes orgId', () => {
      expect(qk.serviceAccountsList('org-1')).toEqual(['service-accounts', 'org-1', undefined]);
    });

    it('serviceAccountDetail includes id', () => {
      expect(qk.serviceAccountDetail('sa-1')).toEqual(['service-accounts', 'sa-1']);
    });

    it('serviceAccountKeys includes id', () => {
      expect(qk.serviceAccountKeys('sa-1')).toEqual(['service-accounts', 'sa-1', 'keys']);
    });

    it('webhooksList includes orgId and params', () => {
      expect(qk.webhooksList('org-1', { status: 'active' })).toEqual(['webhooks', 'org-1', { status: 'active' }]);
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
