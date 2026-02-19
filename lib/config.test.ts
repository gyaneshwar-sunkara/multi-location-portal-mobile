// config.ts runs getApiUrl() on import, so we use jest.isolateModules
// to get a fresh module for each test.

const originalEnv = process.env;
const originalPlatformOS = jest.requireActual('react-native').Platform.OS;

afterEach(() => {
  process.env = originalEnv;
  // Restore Platform.OS for other tests
  const { Platform } = require('react-native');
  Platform.OS = originalPlatformOS;
});

describe('config', () => {
  it('returns EXPO_PUBLIC_API_URL when set', () => {
    process.env = { ...originalEnv, EXPO_PUBLIC_API_URL: 'https://api.example.com' };

    jest.isolateModules(() => {
      const { API_URL } = require('./config');
      expect(API_URL).toBe('https://api.example.com');
    });
  });

  it('returns localhost fallback in dev when no env var', () => {
    process.env = { ...originalEnv };
    delete process.env['EXPO_PUBLIC_API_URL'];

    jest.isolateModules(() => {
      const { API_URL } = require('./config');
      // jest-expo defaults Platform.OS to 'ios'
      expect(API_URL).toBe('http://localhost:3000/api/v1');
    });
  });
});
