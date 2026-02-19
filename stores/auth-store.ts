import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';
import type { User, Membership } from '@/lib/types';

// ── SecureStore Keys (encrypted) ────────────────────────────────────────────
const ACCESS_TOKEN_KEY = 'auth-access-token';
const REFRESH_TOKEN_KEY = 'auth-refresh-token';

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
  setMemberships: (memberships: Membership[]) => void;
  setActiveOrganization: (orgId: string | null) => void;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      memberships: [],
      activeOrganizationId: null,
      isHydrated: false,
      isAuthenticated: false,

      setAuth: async (accessToken, refreshToken, user, memberships, activeOrgId) => {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

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

      setUser: (user) => set({ user }),

      setMemberships: (memberships) => set({ memberships }),

      setActiveOrganization: (orgId) => set({ activeOrganizationId: orgId }),

      hydrate: async () => {
        // Wait for persist middleware to finish rehydrating user/memberships from MMKV
        if (!useAuthStore.persist.hasHydrated()) {
          await new Promise<void>((resolve) => {
            const unsub = useAuthStore.persist.onFinishHydration(() => {
              unsub();
              resolve();
            });
          });
        }

        // Tokens come from SecureStore (not persisted by middleware)
        const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

        // user/memberships/activeOrganizationId are already rehydrated by persist middleware
        const { user } = useAuthStore.getState();
        const isAuthenticated = !!(accessToken && refreshToken && user);

        if (!isAuthenticated) {
          // Clear stale MMKV data if tokens are missing from SecureStore
          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            memberships: [],
            activeOrganizationId: null,
            isAuthenticated: false,
            isHydrated: true,
          });
        } else {
          set({
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isHydrated: true,
          });
        }
      },

      logout: async () => {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

        // persist middleware auto-writes cleared state to MMKV
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          memberships: [],
          activeOrganizationId: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        user: state.user,
        memberships: state.memberships,
        activeOrganizationId: state.activeOrganizationId,
      }),
    },
  ),
);
