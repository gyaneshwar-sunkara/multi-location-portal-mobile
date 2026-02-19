import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  acceptInvitationSchema,
  verify2faSchema,
  verifyRecoverySchema,
} from './auth';

describe('loginSchema', () => {
  it('accepts valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'password123' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const validData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'StrongPass1',
    terms: true,
  };

  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects password without uppercase', () => {
    const result = registerSchema.safeParse({ ...validData, password: 'weakpass1' });
    expect(result.success).toBe(false);
  });

  it('rejects password without lowercase', () => {
    const result = registerSchema.safeParse({ ...validData, password: 'WEAKPASS1' });
    expect(result.success).toBe(false);
  });

  it('rejects password without number', () => {
    const result = registerSchema.safeParse({ ...validData, password: 'WeakPasss' });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({ ...validData, password: 'Pass1' });
    expect(result.success).toBe(false);
  });

  it('rejects when terms is false', () => {
    const result = registerSchema.safeParse({ ...validData, terms: false });
    expect(result.success).toBe(false);
  });

  it('rejects empty first name', () => {
    const result = registerSchema.safeParse({ ...validData, firstName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects firstName exceeding 50 characters', () => {
    const result = registerSchema.safeParse({ ...validData, firstName: 'A'.repeat(51) });
    expect(result.success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('accepts valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'bad' });
    expect(result.success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('accepts valid token and strong password', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc123', password: 'NewPass1x' });
    expect(result.success).toBe(true);
  });

  it('rejects empty token', () => {
    const result = resetPasswordSchema.safeParse({ token: '', password: 'NewPass1x' });
    expect(result.success).toBe(false);
  });

  it('rejects weak password', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc123', password: 'weak' });
    expect(result.success).toBe(false);
  });
});

describe('verifyEmailSchema', () => {
  it('accepts non-empty token', () => {
    const result = verifyEmailSchema.safeParse({ token: 'verification-token' });
    expect(result.success).toBe(true);
  });

  it('rejects empty token', () => {
    const result = verifyEmailSchema.safeParse({ token: '' });
    expect(result.success).toBe(false);
  });
});

describe('resendVerificationSchema', () => {
  it('accepts valid email', () => {
    const result = resendVerificationSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(true);
  });
});

describe('acceptInvitationSchema', () => {
  it('accepts non-empty token', () => {
    const result = acceptInvitationSchema.safeParse({ token: 'invite-token' });
    expect(result.success).toBe(true);
  });

  it('rejects empty token', () => {
    const result = acceptInvitationSchema.safeParse({ token: '' });
    expect(result.success).toBe(false);
  });
});

describe('verify2faSchema', () => {
  it('accepts valid 6-digit code', () => {
    const result = verify2faSchema.safeParse({
      challengeToken: 'challenge-123',
      code: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('rejects 5-digit code', () => {
    const result = verify2faSchema.safeParse({
      challengeToken: 'challenge-123',
      code: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric code', () => {
    const result = verify2faSchema.safeParse({
      challengeToken: 'challenge-123',
      code: 'abcdef',
    });
    expect(result.success).toBe(false);
  });

  it('defaults trustDevice to false', () => {
    const result = verify2faSchema.safeParse({
      challengeToken: 'challenge-123',
      code: '123456',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.trustDevice).toBe(false);
    }
  });
});

describe('verifyRecoverySchema', () => {
  it('accepts valid challenge token and recovery code', () => {
    const result = verifyRecoverySchema.safeParse({
      challengeToken: 'challenge-123',
      code: 'ABCD-1234-EFGH',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty recovery code', () => {
    const result = verifyRecoverySchema.safeParse({
      challengeToken: 'challenge-123',
      code: '',
    });
    expect(result.success).toBe(false);
  });
});
