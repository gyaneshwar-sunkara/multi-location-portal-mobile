// @ts-expect-error -- mock-only export from __mocks__/react-native-mmkv
import { clearAllMockMMKV } from 'react-native-mmkv';
// @ts-expect-error -- mock-only export from __mocks__/expo-secure-store
import { clearMockSecureStore } from 'expo-secure-store';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthResponse, User, MeResponse } from '@/lib/types';

// Mock api-client to control fetch responses
jest.mock('@/lib/api-client', () => ({
  apiPublicFetch: jest.fn(),
  apiFetch: jest.fn(),
}));

import { apiPublicFetch, apiFetch } from '@/lib/api-client';
import {
  completeAuth,
  refreshMemberships,
  send2faOtp,
  verify2faCode,
  verifyRecoveryCode,
} from './auth-helpers';

const mockedApiPublicFetch = apiPublicFetch as jest.MockedFunction<typeof apiPublicFetch>;
const mockedApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  avatarUrl: null,
  isEmailVerified: true,
  twoFactorEnabled: false,
  timezone: null,
  defaultOrgId: 'org-1',
  platformRole: null,
  platformPermissions: [],
  createdAt: '2025-01-01T00:00:00Z',
};

const mockAuthResponse: AuthResponse = {
  accessToken: 'access-tok',
  refreshToken: 'refresh-tok',
  expiresIn: 3600,
  user: mockUser,
};

const mockMeResponse: MeResponse = {
  ...mockUser,
  memberships: [
    {
      organizationId: 'org-1',
      organizationName: 'Org One',
      organizationSlug: 'org-one',
      roleName: 'Admin',
      roleHierarchy: 3,
      status: 'ACTIVE',
    },
    {
      organizationId: 'org-2',
      organizationName: 'Org Two',
      organizationSlug: 'org-two',
      roleName: 'Member',
      roleHierarchy: 1,
      status: 'ACTIVE',
    },
  ],
};

beforeEach(() => {
  clearAllMockMMKV();
  clearMockSecureStore();
  jest.clearAllMocks();
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    memberships: [],
    activeOrganizationId: null,
    isHydrated: false,
    isAuthenticated: false,
  });
});

describe('completeAuth', () => {
  it('fetches /auth/me and sets auth with memberships', async () => {
    mockedApiPublicFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMeResponse,
    } as Response);

    await completeAuth(mockAuthResponse);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('access-tok');
    expect(state.memberships).toHaveLength(2);
  });

  it('uses defaultOrgId when valid', async () => {
    mockedApiPublicFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMeResponse,
    } as Response);

    await completeAuth(mockAuthResponse);

    expect(useAuthStore.getState().activeOrganizationId).toBe('org-1');
  });

  it('falls back to first membership when defaultOrgId is invalid', async () => {
    const authWithBadDefault: AuthResponse = {
      ...mockAuthResponse,
      user: { ...mockUser, defaultOrgId: 'nonexistent' },
    };

    mockedApiPublicFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMeResponse,
    } as Response);

    await completeAuth(authWithBadDefault);

    expect(useAuthStore.getState().activeOrganizationId).toBe('org-1');
  });

  it('falls back to first membership when defaultOrgId is null', async () => {
    const authNoDefault: AuthResponse = {
      ...mockAuthResponse,
      user: { ...mockUser, defaultOrgId: null },
    };

    mockedApiPublicFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMeResponse,
    } as Response);

    await completeAuth(authNoDefault);

    expect(useAuthStore.getState().activeOrganizationId).toBe('org-1');
  });

  it('proceeds with empty memberships when /auth/me fails', async () => {
    mockedApiPublicFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'error' }),
    } as Response);

    await completeAuth(mockAuthResponse);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.memberships).toEqual([]);
    expect(state.activeOrganizationId).toBeNull();
  });

  it('proceeds with empty memberships when /auth/me throws', async () => {
    mockedApiPublicFetch.mockRejectedValueOnce(new Error('Network error'));

    await completeAuth(mockAuthResponse);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.memberships).toEqual([]);
  });
});

describe('refreshMemberships', () => {
  it('updates memberships in store', async () => {
    useAuthStore.setState({ isAuthenticated: true, user: mockUser });

    mockedApiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMeResponse,
    } as Response);

    await refreshMemberships();

    expect(useAuthStore.getState().memberships).toHaveLength(2);
  });

  it('does nothing when response is not ok', async () => {
    useAuthStore.setState({ isAuthenticated: true, memberships: [] });

    mockedApiFetch.mockResolvedValueOnce({
      ok: false,
    } as Response);

    await refreshMemberships();

    expect(useAuthStore.getState().memberships).toEqual([]);
  });

  it('silently catches errors', async () => {
    mockedApiFetch.mockRejectedValueOnce(new Error('Network error'));

    // Should not throw
    await refreshMemberships();
  });
});

describe('send2faOtp', () => {
  it('sends email OTP to correct endpoint', async () => {
    mockedApiPublicFetch.mockResolvedValueOnce({
      ok: true,
    } as Response);

    const result = await send2faOtp('email', 'challenge-tok');

    expect(result).toEqual({ success: true });
    expect(mockedApiPublicFetch).toHaveBeenCalledWith(
      '/auth/2fa/email-otp/send',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ challengeToken: 'challenge-tok' }),
      }),
    );
  });

  it('sends SMS OTP to correct endpoint', async () => {
    mockedApiPublicFetch.mockResolvedValueOnce({
      ok: true,
    } as Response);

    await send2faOtp('sms', 'challenge-tok');

    expect(mockedApiPublicFetch).toHaveBeenCalledWith(
      '/auth/2fa/sms-otp/send',
      expect.any(Object),
    );
  });

  it('returns error on failure', async () => {
    mockedApiPublicFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Rate limited' }),
    } as Response);

    const result = await send2faOtp('email', 'challenge-tok');

    expect(result.error).toBeDefined();
    expect(result.success).toBeUndefined();
  });
});

describe('verify2faCode', () => {
  it('verifies TOTP code', async () => {
    mockedApiPublicFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAuthResponse,
    } as Response);

    const result = await verify2faCode('totp', {
      challengeToken: 'ct',
      code: '123456',
      trustDevice: true,
    });

    expect(result.auth).toBeDefined();
    expect(mockedApiPublicFetch).toHaveBeenCalledWith(
      '/auth/2fa/totp/verify',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('verifies email OTP', async () => {
    mockedApiPublicFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAuthResponse,
    } as Response);

    await verify2faCode('email', { challengeToken: 'ct', code: '123456' });

    expect(mockedApiPublicFetch).toHaveBeenCalledWith(
      '/auth/2fa/email-otp/verify',
      expect.any(Object),
    );
  });

  it('verifies SMS OTP', async () => {
    mockedApiPublicFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAuthResponse,
    } as Response);

    await verify2faCode('sms', { challengeToken: 'ct', code: '123456' });

    expect(mockedApiPublicFetch).toHaveBeenCalledWith(
      '/auth/2fa/sms-otp/verify',
      expect.any(Object),
    );
  });

  it('returns error on failure', async () => {
    mockedApiPublicFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid code' }),
    } as Response);

    const result = await verify2faCode('totp', { challengeToken: 'ct', code: '000000' });

    expect(result.error).toBeDefined();
    expect(result.auth).toBeUndefined();
  });
});

describe('verifyRecoveryCode', () => {
  it('returns auth on success', async () => {
    mockedApiPublicFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAuthResponse,
    } as Response);

    const result = await verifyRecoveryCode({
      challengeToken: 'ct',
      code: 'RECOVERY-CODE-1',
    });

    expect(result.auth).toBeDefined();
    expect(mockedApiPublicFetch).toHaveBeenCalledWith(
      '/auth/2fa/recovery/verify',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('returns error on failure', async () => {
    mockedApiPublicFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid recovery code' }),
    } as Response);

    const result = await verifyRecoveryCode({
      challengeToken: 'ct',
      code: 'BAD-CODE',
    });

    expect(result.error).toBeDefined();
    expect(result.auth).toBeUndefined();
  });
});
