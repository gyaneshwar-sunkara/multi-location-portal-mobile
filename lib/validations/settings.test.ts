import {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
  changeEmailSchema,
  updateTimezoneSchema,
} from './settings';

describe('updateProfileSchema', () => {
  it('accepts valid first and last name', () => {
    const result = updateProfileSchema.safeParse({ firstName: 'John', lastName: 'Doe' });
    expect(result.success).toBe(true);
  });

  it('requires firstName', () => {
    const result = updateProfileSchema.safeParse({ firstName: '', lastName: 'Doe' });
    expect(result.success).toBe(false);
  });

  it('allows empty lastName', () => {
    const result = updateProfileSchema.safeParse({ firstName: 'John', lastName: '' });
    expect(result.success).toBe(true);
  });

  it('rejects firstName exceeding 50 characters', () => {
    const result = updateProfileSchema.safeParse({ firstName: 'A'.repeat(51), lastName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects lastName exceeding 50 characters', () => {
    const result = updateProfileSchema.safeParse({ firstName: 'John', lastName: 'A'.repeat(51) });
    expect(result.success).toBe(false);
  });
});

describe('changePasswordSchema', () => {
  it('accepts valid current and new password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldPass123',
      newPassword: 'NewStrong1',
    });
    expect(result.success).toBe(true);
  });

  it('requires currentPassword', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: '',
      newPassword: 'NewStrong1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects weak newPassword (no uppercase)', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'old',
      newPassword: 'weakpass1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects newPassword shorter than 8 characters', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'old',
      newPassword: 'Pass1',
    });
    expect(result.success).toBe(false);
  });
});

describe('deleteAccountSchema', () => {
  it('accepts non-empty password', () => {
    const result = deleteAccountSchema.safeParse({ password: 'mypassword' });
    expect(result.success).toBe(true);
  });

  it('rejects empty password', () => {
    const result = deleteAccountSchema.safeParse({ password: '' });
    expect(result.success).toBe(false);
  });
});

describe('changeEmailSchema', () => {
  it('accepts valid email and password', () => {
    const result = changeEmailSchema.safeParse({
      newEmail: 'new@example.com',
      password: 'mypassword',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = changeEmailSchema.safeParse({
      newEmail: 'not-email',
      password: 'mypassword',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = changeEmailSchema.safeParse({
      newEmail: 'new@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateTimezoneSchema', () => {
  it('accepts a timezone string', () => {
    const result = updateTimezoneSchema.safeParse({ timezone: 'America/New_York' });
    expect(result.success).toBe(true);
  });

  it('accepts null timezone', () => {
    const result = updateTimezoneSchema.safeParse({ timezone: null });
    expect(result.success).toBe(true);
  });

  it('rejects timezone exceeding 100 characters', () => {
    const result = updateTimezoneSchema.safeParse({ timezone: 'A'.repeat(101) });
    expect(result.success).toBe(false);
  });
});
