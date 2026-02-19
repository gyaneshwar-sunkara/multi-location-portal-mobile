import { isTwoFactorChallenge } from './types';
import type { LoginResponse } from './types';

describe('isTwoFactorChallenge', () => {
  it('returns true for a TwoFactorChallengeResponse', () => {
    const response: LoginResponse = {
      requiresTwoFactor: true,
      challengeToken: 'challenge-tok',
      methods: ['totp', 'email'],
      expiresAt: '2025-01-01T01:00:00Z',
    };
    expect(isTwoFactorChallenge(response)).toBe(true);
  });

  it('returns false for an AuthResponse', () => {
    const response: LoginResponse = {
      accessToken: 'at',
      refreshToken: 'rt',
      expiresIn: 3600,
      user: {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        avatarUrl: null,
        isEmailVerified: true,
        twoFactorEnabled: false,
        timezone: null,
        defaultOrgId: null,
        platformRole: null,
        platformPermissions: [],
        createdAt: '2025-01-01T00:00:00Z',
      },
    };
    expect(isTwoFactorChallenge(response)).toBe(false);
  });
});
