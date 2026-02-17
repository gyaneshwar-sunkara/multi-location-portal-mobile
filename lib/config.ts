import { Platform } from 'react-native';

function getApiUrl(): string {
  const envUrl = process.env['EXPO_PUBLIC_API_URL'];
  if (envUrl) return envUrl;

  // Dev fallback: iOS simulator uses localhost, Android emulator needs 10.0.2.2
  if (__DEV__) {
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    return `http://${host}:3000/api/v1`;
  }

  throw new Error('EXPO_PUBLIC_API_URL must be set in production');
}

export const API_URL = getApiUrl();
