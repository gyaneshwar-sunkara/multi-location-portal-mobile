import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { mmkv } from '@/lib/storage';
import type { User, Membership } from '@/lib/types';

// ── SecureStore Keys (encrypted) ────────────────────────────────────────────
const ACCESS_TOKEN_KEY = 'auth-access-token';
const REFRESH_TOKEN_KEY = 'auth-refresh-token';

// ── MMKV Keys (fast, non-sensitive) ─────────────────────────────────────────
const USER_KEY = 'auth-user';
const MEMBERSHIPS_KEY = 'auth-memberships';
const ACTIVE_ORG_KEY = 'auth-active-org';

// ── Helpers ─────────────────────────────────────────────────────────────────

function mmkvSetJson(key: string, value: unknown): void {
  mmkv.set(key, JSON.stringify(value));
}

function mmkvGetJson<T>(key: string): T | null {
  const raw = mmkv.getString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ── Store ───────────────────────────────────────────────────────────────────

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  memberships: Membership[];
  activeOrganizationId: string | null;
  isHydrated: boolean;
  isAuthenticated: boolean;

  setAuth: (
    accessToken: string,
    refreshToken: string,
    user: User,
    memberships: Membership[],
    activeOrgId: string | null,
  ) => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setUser: (user: User) => void;
  setActiveOrganization: (orgId: string | null) => void;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  memberships: [],
  activeOrganizationId: null,
  isHydrated: false,
  isAuthenticated: false,

  setAuth: async (accessToken, refreshToken, user, memberships, activeOrgId) => {
    // Persist tokens to SecureStore (encrypted)
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

    // Persist non-sensitive data to MMKV (fast)
    mmkvSetJson(USER_KEY, user);
    mmkvSetJson(MEMBERSHIPS_KEY, memberships);
    if (activeOrgId) {
      mmkv.set(ACTIVE_ORG_KEY, activeOrgId);
    } else {
      mmkv.remove(ACTIVE_ORG_KEY);
    }

    set({
      accessToken,
      refreshToken,
      user,
      memberships,
      activeOrganizationId: activeOrgId,
      isAuthenticated: true,
    });
  },

  setTokens: async (accessToken, refreshToken) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    set({ accessToken, refreshToken });
  },

  setUser: (user) => {
    mmkvSetJson(USER_KEY, user);
    set({ user });
  },

  setActiveOrganization: (orgId) => {
    if (orgId) {
      mmkv.set(ACTIVE_ORG_KEY, orgId);
    } else {
      mmkv.remove(ACTIVE_ORG_KEY);
    }
    set({ activeOrganizationId: orgId });
  },

  hydrate: async () => {
    // Load tokens from SecureStore
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

    // Load non-sensitive data from MMKV
    const user = mmkvGetJson<User>(USER_KEY);
    const memberships = mmkvGetJson<Membership[]>(MEMBERSHIPS_KEY) ?? [];
    const activeOrganizationId = mmkv.getString(ACTIVE_ORG_KEY) ?? null;

    const isAuthenticated = !!(accessToken && refreshToken && user);

    set({
      accessToken,
      refreshToken,
      user,
      memberships,
      activeOrganizationId,
      isAuthenticated,
      isHydrated: true,
    });
  },

  logout: async () => {
    // Clear SecureStore
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

    // Clear MMKV auth keys
    mmkv.remove(USER_KEY);
    mmkv.remove(MEMBERSHIPS_KEY);
    mmkv.remove(ACTIVE_ORG_KEY);

    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      memberships: [],
      activeOrganizationId: null,
      isAuthenticated: false,
    });
  },
}));
