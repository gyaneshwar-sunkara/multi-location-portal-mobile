// @ts-expect-error -- mock-only export from __mocks__/react-native-mmkv
import { clearAllMockMMKV } from 'react-native-mmkv';
// @ts-expect-error -- mock-only export from __mocks__/expo-secure-store
import { clearMockSecureStore } from 'expo-secure-store';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from './auth-store';
import type { User, Membership } from '@/lib/types';

const mockUser: User = {
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
};

const mockMembership: Membership = {
  organizationId: 'org-1',
  organizationName: 'Test Org',
  organizationSlug: 'test-org',
  roleName: 'Admin',
  roleHierarchy: 3,
  status: 'ACTIVE',
};

beforeEach(() => {
  clearAllMockMMKV();
  clearMockSecureStore();
  // Reset Zustand store to initial state
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

describe('auth-store', () => {
  describe('initial state', () => {
    it('starts unauthenticated with null values', () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBeNull();
      expect(state.user).toBeNull();
      expect(state.memberships).toEqual([]);
    });
  });

  describe('setAuth', () => {
    it('sets all auth fields and marks authenticated', async () => {
      await useAuthStore.getState().setAuth(
        'access-token',
        'refresh-token',
        mockUser,
        [mockMembership],
        'org-1',
      );

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.accessToken).toBe('access-token');
      expect(state.refreshToken).toBe('refresh-token');
      expect(state.user).toEqual(mockUser);
      expect(state.memberships).toEqual([mockMembership]);
      expect(state.activeOrganizationId).toBe('org-1');
    });

    it('persists tokens to SecureStore', async () => {
      await useAuthStore.getState().setAuth(
        'access-token',
        'refresh-token',
        mockUser,
        [],
        null,
      );

      expect(await SecureStore.getItemAsync('auth-access-token')).toBe('access-token');
      expect(await SecureStore.getItemAsync('auth-refresh-token')).toBe('refresh-token');
    });
  });

  describe('setTokens', () => {
    it('updates only tokens', async () => {
      await useAuthStore.getState().setTokens('new-access', 'new-refresh');

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('new-access');
      expect(state.refreshToken).toBe('new-refresh');
      expect(await SecureStore.getItemAsync('auth-access-token')).toBe('new-access');
    });
  });

  describe('setUser', () => {
    it('updates user object', () => {
      useAuthStore.getState().setUser(mockUser);
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });
  });

  describe('setMemberships', () => {
    it('updates memberships array', () => {
      useAuthStore.getState().setMemberships([mockMembership]);
      expect(useAuthStore.getState().memberships).toEqual([mockMembership]);
    });
  });

  describe('setActiveOrganization', () => {
    it('sets active org id', () => {
      useAuthStore.getState().setActiveOrganization('org-2');
      expect(useAuthStore.getState().activeOrganizationId).toBe('org-2');
    });
  });

  describe('hydrate', () => {
    it('sets isAuthenticated true when tokens and user exist', async () => {
      // Pre-populate SecureStore with tokens
      await SecureStore.setItemAsync('auth-access-token', 'at');
      await SecureStore.setItemAsync('auth-refresh-token', 'rt');

      // Simulate persist middleware having rehydrated user from MMKV
      useAuthStore.setState({ user: mockUser, memberships: [mockMembership] });

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.isHydrated).toBe(true);
      expect(state.accessToken).toBe('at');
      expect(state.refreshToken).toBe('rt');
    });

    it('clears stale data when tokens are missing from SecureStore', async () => {
      // Persist middleware rehydrated user but tokens were deleted (e.g. after device wipe)
      useAuthStore.setState({ user: mockUser, memberships: [mockMembership] });

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isHydrated).toBe(true);
      expect(state.user).toBeNull();
      expect(state.memberships).toEqual([]);
      expect(state.accessToken).toBeNull();
    });

    it('sets not authenticated when user is missing', async () => {
      // Tokens exist in SecureStore but no user data from MMKV
      await SecureStore.setItemAsync('auth-access-token', 'at');
      await SecureStore.setItemAsync('auth-refresh-token', 'rt');

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isHydrated).toBe(true);
    });

    it('sets not authenticated when only access token exists', async () => {
      await SecureStore.setItemAsync('auth-access-token', 'at');
      useAuthStore.setState({ user: mockUser });

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isHydrated).toBe(true);
    });
  });

  describe('logout', () => {
    it('clears all state and SecureStore', async () => {
      // First authenticate
      await useAuthStore.getState().setAuth(
        'access-token',
        'refresh-token',
        mockUser,
        [mockMembership],
        'org-1',
      );

      // Then logout
      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.user).toBeNull();
      expect(state.memberships).toEqual([]);
      expect(state.activeOrganizationId).toBeNull();

      expect(await SecureStore.getItemAsync('auth-access-token')).toBeNull();
      expect(await SecureStore.getItemAsync('auth-refresh-token')).toBeNull();
    });
  });
});
