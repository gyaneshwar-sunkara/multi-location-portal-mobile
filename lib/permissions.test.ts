import {
  P,
  PLATFORM_ROLES,
  isPlatformUser,
  hasPermission,
  hasAnyPermission,
  meetsOrgHierarchy,
  ORG_HIERARCHY,
} from './permissions';

describe('isPlatformUser', () => {
  it('returns true for SUPER_ADMIN', () => {
    expect(isPlatformUser(PLATFORM_ROLES.SUPER_ADMIN)).toBe(true);
  });

  it('returns true for PLATFORM_ADMIN', () => {
    expect(isPlatformUser(PLATFORM_ROLES.PLATFORM_ADMIN)).toBe(true);
  });

  it('returns true for PLATFORM_VIEWER', () => {
    expect(isPlatformUser(PLATFORM_ROLES.PLATFORM_VIEWER)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isPlatformUser(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isPlatformUser(undefined)).toBe(false);
  });

  it('returns false for arbitrary string', () => {
    expect(isPlatformUser('USER')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isPlatformUser('')).toBe(false);
  });
});

describe('hasPermission', () => {
  const permissions = [P.DASHBOARD_READ, P.USERS_READ, P.AUDIT_READ];

  it('returns true when permission exists in list', () => {
    expect(hasPermission(permissions, P.DASHBOARD_READ)).toBe(true);
  });

  it('returns false when permission is not in list', () => {
    expect(hasPermission(permissions, P.USERS_WRITE)).toBe(false);
  });

  it('returns false for null permissions', () => {
    expect(hasPermission(null, P.DASHBOARD_READ)).toBe(false);
  });

  it('returns false for undefined permissions', () => {
    expect(hasPermission(undefined, P.DASHBOARD_READ)).toBe(false);
  });

  it('returns false for empty array', () => {
    expect(hasPermission([], P.DASHBOARD_READ)).toBe(false);
  });
});

describe('hasAnyPermission', () => {
  const permissions = [P.DASHBOARD_READ, P.USERS_READ];

  it('returns true when at least one permission matches', () => {
    expect(hasAnyPermission(permissions, [P.USERS_READ, P.USERS_WRITE])).toBe(true);
  });

  it('returns false when no permissions match', () => {
    expect(hasAnyPermission(permissions, [P.USERS_WRITE, P.AUDIT_READ])).toBe(false);
  });

  it('returns false for null permissions', () => {
    expect(hasAnyPermission(null, [P.DASHBOARD_READ])).toBe(false);
  });

  it('returns false for empty required array', () => {
    expect(hasAnyPermission(permissions, [])).toBe(false);
  });
});

describe('meetsOrgHierarchy', () => {
  it('returns true when hierarchy meets required level', () => {
    expect(meetsOrgHierarchy(3, ORG_HIERARCHY.ADMIN_LEVEL)).toBe(true);
  });

  it('returns true when hierarchy exceeds required level', () => {
    expect(meetsOrgHierarchy(5, ORG_HIERARCHY.ADMIN_LEVEL)).toBe(true);
  });

  it('returns false when hierarchy is below required level', () => {
    expect(meetsOrgHierarchy(1, ORG_HIERARCHY.MEMBER_LEVEL)).toBe(false);
  });

  it('returns false for null hierarchy', () => {
    expect(meetsOrgHierarchy(null, ORG_HIERARCHY.ADMIN_LEVEL)).toBe(false);
  });

  it('returns false for undefined hierarchy', () => {
    expect(meetsOrgHierarchy(undefined, ORG_HIERARCHY.ADMIN_LEVEL)).toBe(false);
  });

  it('returns true for exact member level', () => {
    expect(meetsOrgHierarchy(2, ORG_HIERARCHY.MEMBER_LEVEL)).toBe(true);
  });
});
