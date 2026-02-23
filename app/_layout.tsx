import '@/i18n';
import 'react-native-reanimated';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useAuthStore } from '@/stores/auth-store';
import { QueryProvider } from '@/providers/query-provider';
import { AppThemeProvider } from '@/providers/theme-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { OfflineBanner } from '@/components/OfflineBanner';

export { ErrorBoundary } from 'expo-router';

GoogleSignin.configure({
  webClientId: process.env['EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'],
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <AppThemeProvider>
          <AuthProvider>
            <OfflineBanner />
            <RootNavigator />
          </AuthProvider>
        </AppThemeProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const isHydrated = useAuthStore((s) => s.isHydrated);

  if (!isHydrated) return null;

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
