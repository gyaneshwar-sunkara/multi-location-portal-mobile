import {
  loginSchema,
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
