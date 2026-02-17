import { Redirect, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/auth-provider';
import { useAppTheme } from '@/providers/theme-provider';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
        headerStyle: { backgroundColor: theme.colors.card },
        headerTintColor: theme.colors.foreground,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="org/switch"
        options={{
          title: t('common.switchOrganization'),
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
