import { inviteMemberSchema, updateOrgSchema } from './org';

describe('inviteMemberSchema', () => {
  it('accepts valid email and roleId', () => {
    const result = inviteMemberSchema.safeParse({
      email: 'user@example.com',
      roleId: 'role-1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = inviteMemberSchema.safeParse({
      email: 'not-an-email',
      roleId: 'role-1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty email', () => {
    const result = inviteMemberSchema.safeParse({
      email: '',
      roleId: 'role-1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty roleId', () => {
    const result = inviteMemberSchema.safeParse({
      email: 'user@example.com',
      roleId: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing roleId', () => {
    const result = inviteMemberSchema.safeParse({
      email: 'user@example.com',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateOrgSchema', () => {
  it('accepts valid name', () => {
    const result = updateOrgSchema.safeParse({ name: 'My Org' });
    expect(result.success).toBe(true);
  });

  it('rejects name shorter than 2 characters', () => {
    const result = updateOrgSchema.safeParse({ name: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = updateOrgSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects name exceeding 100 characters', () => {
    const result = updateOrgSchema.safeParse({ name: 'A'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('accepts name at boundary (2 characters)', () => {
    const result = updateOrgSchema.safeParse({ name: 'AB' });
    expect(result.success).toBe(true);
  });

  it('accepts name at boundary (100 characters)', () => {
    const result = updateOrgSchema.safeParse({ name: 'A'.repeat(100) });
    expect(result.success).toBe(true);
  });
});
