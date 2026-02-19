import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/providers/theme-provider';

export default function AuthLayout() {
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="register" />
      <Stack.Screen
        name="forgot-password"
        options={{
          headerShown: true,
          title: '',
          headerBackTitle: t('auth.signIn'),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.foreground,
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          headerShown: true,
          title: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.foreground,
        }}
      />
      <Stack.Screen
        name="verify-2fa"
        options={{
          headerShown: true,
          title: '',
          headerBackTitle: t('auth.signIn'),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.foreground,
        }}
      />
      <Stack.Screen
        name="verify-email"
        options={{
          headerShown: true,
          title: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.foreground,
        }}
      />
      <Stack.Screen
        name="accept-invitation"
        options={{
          headerShown: true,
          title: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.foreground,
        }}
      />
    </Stack>
  );
}
