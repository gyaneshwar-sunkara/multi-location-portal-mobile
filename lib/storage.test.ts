// @ts-expect-error -- mock-only export from __mocks__/react-native-mmkv
import { clearAllMockMMKV } from 'react-native-mmkv';
import {
  mmkvStorage,
  setPendingInvitationToken,
  getPendingInvitationToken,
  clearPendingInvitationToken,
} from './storage';

beforeEach(() => {
  clearAllMockMMKV();
});

describe('mmkvStorage adapter', () => {
  it('stores and retrieves values', () => {
    mmkvStorage.setItem('key', 'value');
    expect(mmkvStorage.getItem('key')).toBe('value');
  });

  it('returns null for missing keys', () => {
    expect(mmkvStorage.getItem('nonexistent')).toBeNull();
  });

  it('removes values', () => {
    mmkvStorage.setItem('key', 'value');
    mmkvStorage.removeItem('key');
    expect(mmkvStorage.getItem('key')).toBeNull();
  });
});

describe('pending invitation token', () => {
  it('stores and retrieves an invitation token', () => {
    setPendingInvitationToken('invite-abc');
    expect(getPendingInvitationToken()).toBe('invite-abc');
  });

  it('returns null when no token is stored', () => {
    expect(getPendingInvitationToken()).toBeNull();
  });

  it('clears the stored token', () => {
    setPendingInvitationToken('invite-abc');
    clearPendingInvitationToken();
    expect(getPendingInvitationToken()).toBeNull();
  });
});
