import { API_URL } from '@/lib/config';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';

const TOKEN_EXPIRY_BUFFER_MS = 60_000; // Refresh 60s before actual expiry

// ── Token Expiry Check ──────────────────────────────────────────────────────

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now() + TOKEN_EXPIRY_BUFFER_MS;
  } catch {
    return true;
  }
}

// ── Refresh Mutex ───────────────────────────────────────────────────────────
// Prevents concurrent 401s from triggering multiple refresh calls.
// All callers await the same in-flight promise.

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const { refreshToken } = useAuthStore.getState();
      if (!refreshToken) return false;

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const tokens = await response.json();
      await useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken);
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

// ── Authenticated Fetch ─────────────────────────────────────────────────────

/**
 * Fetch from the api-nest backend with authentication.
 * Automatically attaches Bearer token, Accept-Language, and x-organization-id headers.
 * Proactively refreshes tokens within 60s of expiry and handles 401 responses.
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const authState = useAuthStore.getState();
  let { accessToken } = authState;

  if (!accessToken) {
    await authState.logout();
    throw new Error('No access token');
  }

  // Proactive refresh if token is about to expire
  if (isTokenExpired(accessToken)) {
    const refreshed = await refreshTokens();
    if (!refreshed) {
      await useAuthStore.getState().logout();
      throw new Error('Token refresh failed');
    }
    accessToken = useAuthStore.getState().accessToken!;
  }

  const response = await makeAuthenticatedRequest(path, accessToken, options);

  // Reactive 401 handling — covers server-side token invalidation
  if (response.status === 401) {
    const refreshed = await refreshTokens();
    if (!refreshed) {
      await useAuthStore.getState().logout();
      throw new Error('Authentication failed');
    }
    // Retry once with new token
    return makeAuthenticatedRequest(path, useAuthStore.getState().accessToken!, options);
  }

  return response;
}

function toHeadersRecord(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    const record: Record<string, string> = {};
    headers.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers as Record<string, string>;
}

function makeAuthenticatedRequest(
  path: string,
  accessToken: string,
  options: RequestInit,
): Promise<Response> {
  const { activeOrganizationId } = useAuthStore.getState();
  const { language } = useUIStore.getState();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
    'Accept-Language': language,
  };

  if (activeOrganizationId) {
    headers['x-organization-id'] = activeOrganizationId;
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...toHeadersRecord(options.headers),
    },
  });
}

// ── Public Fetch ────────────────────────────────────────────────────────────

/**
 * Fetch from the api-nest backend without authentication (for public endpoints).
 * Only attaches Accept-Language header. Used for login, register, forgot-password, etc.
 */
export async function apiPublicFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const { language } = useUIStore.getState();

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': language,
      ...toHeadersRecord(options.headers),
    },
  });
}
