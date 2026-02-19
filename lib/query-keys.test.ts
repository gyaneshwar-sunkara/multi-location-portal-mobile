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
  });

  describe('parameterized keys', () => {
    it('organizationsList includes params', () => {
      const key = qk.organizationsList({ page: 1 });
      expect(key).toEqual(['organizations', { page: 1 }]);
    });

    it('organizationsList without params', () => {
      const key = qk.organizationsList();
      expect(key).toEqual(['organizations', undefined]);
    });

    it('organizationDetail includes id', () => {
      expect(qk.organizationDetail('org-1')).toEqual(['organizations', 'org-1']);
    });

    it('members includes orgId', () => {
      expect(qk.members('org-1')).toEqual(['organizations', 'org-1', 'members']);
    });

    it('membersList includes orgId and params', () => {
      expect(qk.membersList('org-1', { role: 'admin' })).toEqual([
        'organizations',
        'org-1',
        'members',
        { role: 'admin' },
      ]);
    });

    it('roleDetail includes id', () => {
      expect(qk.roleDetail('role-1')).toEqual(['roles', 'role-1']);
    });

    it('webhookDeliveriesList includes id and params', () => {
      expect(qk.webhookDeliveriesList('wh-1', { page: 2 })).toEqual([
        'webhooks',
        'wh-1',
        'deliveries',
        { page: 2 },
      ]);
    });

    it('sessionsList includes params', () => {
      expect(qk.sessionsList({ active: true })).toEqual(['sessions', { active: true }]);
    });

    it('dataExportDetail includes id', () => {
      expect(qk.dataExportDetail('export-1')).toEqual(['data-exports', 'export-1']);
    });

    it('serviceAccountKeys includes id', () => {
      expect(qk.serviceAccountKeys('sa-1')).toEqual(['service-accounts', 'sa-1', 'keys']);
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
