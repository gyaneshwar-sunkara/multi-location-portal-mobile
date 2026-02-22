import { Platform } from 'react-native';

function getApiUrl(): string {
  const envUrl = process.env['EXPO_PUBLIC_API_URL'];

  // Dev: rewrite localhost to 10.0.2.2 for Android emulator (localhost = emulator itself)
  if (__DEV__ && envUrl) {
    if (Platform.OS === 'android') {
      return envUrl.replace('localhost', '10.0.2.2');
    }
    return envUrl;
  }

  if (envUrl) return envUrl;

  // Dev fallback when no env var is set
  if (__DEV__) {
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    return `http://${host}:3000/api/v1`;
  }

  throw new Error('EXPO_PUBLIC_API_URL must be set in production');
}

export const API_URL = getApiUrl();
