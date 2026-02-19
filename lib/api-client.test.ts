// @ts-expect-error -- mock-only export from __mocks__/react-native-mmkv
import { clearAllMockMMKV } from 'react-native-mmkv';
// @ts-expect-error -- mock-only export from __mocks__/expo-secure-store
import { clearMockSecureStore } from 'expo-secure-store';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';

// Mock config to avoid Platform-dependent import-time execution
jest.mock('@/lib/config', () => ({ API_URL: 'http://localhost:3000/api/v1' }));

// We need to import AFTER mocks are set up
const { apiFetch, apiPublicFetch } = require('./api-client');

// Helper: create a minimal valid JWT with a given exp claim
function makeJwt(exp: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256' }));
  const payload = btoa(JSON.stringify({ exp }));
  return `${header}.${payload}.sig`;
}

const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

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
  useUIStore.setState({ language: 'en' });
});

describe('apiPublicFetch', () => {
  it('makes request with Content-Type and Accept-Language', async () => {
    mockFetch.mockResolvedValueOnce(new Response('{}', { status: 200 }));

    await apiPublicFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'a@b.com' }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Accept-Language': 'en',
        }),
      }),
    );
  });

  it('respects current language setting', async () => {
    useUIStore.setState({ language: 'es' });
    mockFetch.mockResolvedValueOnce(new Response('{}', { status: 200 }));

    await apiPublicFetch('/auth/login');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Accept-Language': 'es',
        }),
      }),
    );
  });

  it('allows custom headers to override defaults', async () => {
    mockFetch.mockResolvedValueOnce(new Response('{}', { status: 200 }));

    await apiPublicFetch('/auth/me', {
      headers: { Authorization: 'Bearer custom-token' },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer custom-token',
        }),
      }),
    );
  });
});

describe('apiFetch', () => {
  it('throws when no access token is set', async () => {
    await expect(apiFetch('/users')).rejects.toThrow('No access token');
  });

  it('attaches Authorization and x-organization-id headers', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const token = makeJwt(futureExp);

    useAuthStore.setState({
      accessToken: token,
      refreshToken: 'refresh-tok',
      activeOrganizationId: 'org-1',
      isAuthenticated: true,
    });

    mockFetch.mockResolvedValueOnce(new Response('{}', { status: 200 }));

    await apiFetch('/users');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/users',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${token}`,
          'x-organization-id': 'org-1',
        }),
      }),
    );
  });

  it('omits x-organization-id when no active org', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const token = makeJwt(futureExp);

    useAuthStore.setState({
      accessToken: token,
      refreshToken: 'refresh-tok',
      activeOrganizationId: null,
      isAuthenticated: true,
    });

    mockFetch.mockResolvedValueOnce(new Response('{}', { status: 200 }));

    await apiFetch('/users');

    const callHeaders = mockFetch.mock.calls[0][1].headers;
    expect(callHeaders['x-organization-id']).toBeUndefined();
  });

  it('proactively refreshes expired token before request', async () => {
    // Token that expires in 30s (within 60s buffer → treated as expired)
    const soonExp = Math.floor(Date.now() / 1000) + 30;
    const oldToken = makeJwt(soonExp);
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const newToken = makeJwt(futureExp);

    useAuthStore.setState({
      accessToken: oldToken,
      refreshToken: 'refresh-tok',
      isAuthenticated: true,
    });

    // First call: refresh endpoint
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ accessToken: newToken, refreshToken: 'new-refresh' }),
        { status: 200 },
      ),
    );
    // Second call: actual request with new token
    mockFetch.mockResolvedValueOnce(new Response('{}', { status: 200 }));

    await apiFetch('/users');

    expect(mockFetch).toHaveBeenCalledTimes(2);
    // First call should be refresh
    expect(mockFetch.mock.calls[0][0]).toContain('/auth/refresh');
    // Second call should use new token
    expect(mockFetch.mock.calls[1][1].headers.Authorization).toBe(`Bearer ${newToken}`);
  });

  it('retries on 401 after successful refresh', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const token = makeJwt(futureExp);
    const newToken = makeJwt(futureExp + 3600);

    useAuthStore.setState({
      accessToken: token,
      refreshToken: 'refresh-tok',
      isAuthenticated: true,
    });

    // First: original request returns 401
    mockFetch.mockResolvedValueOnce(new Response('', { status: 401 }));
    // Second: refresh succeeds
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ accessToken: newToken, refreshToken: 'new-refresh' }),
        { status: 200 },
      ),
    );
    // Third: retry with new token succeeds
    mockFetch.mockResolvedValueOnce(new Response('{"ok":true}', { status: 200 }));

    const response = await apiFetch('/users');
    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('throws when refresh fails on 401', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const token = makeJwt(futureExp);

    useAuthStore.setState({
      accessToken: token,
      refreshToken: 'refresh-tok',
      isAuthenticated: true,
    });

    // Original request returns 401
    mockFetch.mockResolvedValueOnce(new Response('', { status: 401 }));
    // Refresh fails
    mockFetch.mockResolvedValueOnce(new Response('', { status: 401 }));

    await expect(apiFetch('/users')).rejects.toThrow('Authentication failed');
  });

  it('throws when proactive refresh fails', async () => {
    const soonExp = Math.floor(Date.now() / 1000) + 30;
    const token = makeJwt(soonExp);

    useAuthStore.setState({
      accessToken: token,
      refreshToken: 'refresh-tok',
      isAuthenticated: true,
    });

    // Refresh fails
    mockFetch.mockResolvedValueOnce(new Response('', { status: 500 }));

    await expect(apiFetch('/users')).rejects.toThrow('Token refresh failed');
  });
});
