import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

// Shared MMKV instance for all Zustand stores.
// Each store uses a different `name` in its persist config, so data is namespaced by key.
export const mmkv = createMMKV({ id: 'app-storage' });

export const mmkvStorage: StateStorage = {
  getItem: (name) => mmkv.getString(name) ?? null,
  setItem: (name, value) => mmkv.set(name, value),
  removeItem: (name) => mmkv.remove(name),
};

// ── Trusted Device ID ───────────────────────────────────────────────────────
// Persisted in SecureStore so it survives app reinstalls on iOS (Keychain).
// Used when the user opts to trust a device during 2FA verification.

const DEVICE_ID_KEY = 'trusted-device-id';

export async function getOrCreateDeviceId(): Promise<string> {
  let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = Crypto.randomUUID();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

// ── Pending Invitation Token ────────────────────────────────────────────────
// Stored when an unauthenticated user taps an invitation deep link.
// After sign-in/register succeeds, the app checks for this and redirects
// to the accept-invitation screen instead of the dashboard.

const PENDING_INVITATION_KEY = 'pending-invitation-token';

export function setPendingInvitationToken(token: string): void {
  mmkv.set(PENDING_INVITATION_KEY, token);
}

export function getPendingInvitationToken(): string | null {
  return mmkv.getString(PENDING_INVITATION_KEY) ?? null;
}

export function clearPendingInvitationToken(): void {
  mmkv.remove(PENDING_INVITATION_KEY);
}
