import { apiFetch, apiPublicFetch } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-error';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthResponse, MeResponse } from '@/lib/types';

/**
 * Complete the authentication flow after login/register/2FA verify.
 * Fetches /auth/me for memberships, then persists everything to auth store.
 */
export async function completeAuth(authResponse: AuthResponse): Promise<void> {
  let memberships: MeResponse['memberships'] = [];
  let activeOrgId: string | null = null;

  try {
    const meResponse = await apiPublicFetch('/auth/me', {
      headers: { Authorization: `Bearer ${authResponse.accessToken}` },
    });

    if (meResponse.ok) {
      const me: MeResponse = await meResponse.json();
      memberships = me.memberships ?? [];
      const defaultOrgId = authResponse.user.defaultOrgId;
      const isDefaultValid =
        defaultOrgId && memberships.some((m) => m.organizationId === defaultOrgId);
      activeOrgId = isDefaultValid
        ? defaultOrgId
        : (memberships[0]?.organizationId ?? null);
    } else if (meResponse.status === 401) {
      throw new Error('Authentication tokens are invalid');
    }
  } catch (error) {
    // Re-throw auth errors — tokens are invalid
    if (error instanceof Error && error.message === 'Authentication tokens are invalid') {
      throw error;
    }
    // Network/timeout errors — proceed with login, memberships can be fetched later
  }

  await useAuthStore.getState().setAuth(
    authResponse.accessToken,
    authResponse.refreshToken,
    authResponse.user,
    memberships,
    activeOrgId,
  );
}

/**
 * Re-fetch /auth/me and update memberships in the auth store.
 * Used after accepting an invitation to reflect the new org membership.
 */
export async function refreshMemberships(): Promise<void> {
  try {
    const response = await apiFetch('/auth/me');
    if (!response.ok) return;

    const me: MeResponse = await response.json();
    const store = useAuthStore.getState();
    const memberships = me.memberships ?? [];
    store.setMemberships(memberships);

    // If no active org is set but memberships exist, default to the first one
    if (!store.activeOrganizationId && memberships.length > 0) {
      store.setActiveOrganization(memberships[0].organizationId);
    }
  } catch {
    // Non-critical — memberships will refresh on next app foreground
  }
}

// ── 2FA API Helpers ─────────────────────────────────────────────────────────

export async function send2faOtp(
  method: 'email' | 'sms',
  challengeToken: string,
): Promise<{ success?: boolean; error?: string }> {
  const endpoint =
    method === 'email'
      ? '/auth/2fa/email-otp/send'
      : '/auth/2fa/sms-otp/send';

  const response = await apiPublicFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({ challengeToken }),
  });

  if (!response.ok) {
    const error = await parseApiError(response, 'Failed to send code');
    return { error };
  }

  return { success: true };
}

export async function verify2faCode(
  method: 'totp' | 'email' | 'sms',
  data: { challengeToken: string; code: string; trustDevice?: boolean; deviceId?: string },
): Promise<{ auth?: AuthResponse; error?: string }> {
  const endpointMap = {
    totp: '/auth/2fa/totp/verify',
    email: '/auth/2fa/email-otp/verify',
    sms: '/auth/2fa/sms-otp/verify',
  } as const;

  const response = await apiPublicFetch(endpointMap[method], {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await parseApiError(response, 'Verification failed');
    return { error };
  }

  const auth: AuthResponse = await response.json();
  return { auth };
}

export async function verifyRecoveryCode(
  data: { challengeToken: string; code: string },
): Promise<{ auth?: AuthResponse; error?: string }> {
  const response = await apiPublicFetch('/auth/2fa/recovery/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await parseApiError(response, 'Verification failed');
    return { error };
  }

  const auth: AuthResponse = await response.json();
  return { auth };
}
