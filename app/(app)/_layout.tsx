import { Redirect, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/auth-provider';
import { useAppTheme } from '@/providers/theme-provider';
import { usePushNotifications } from '@/hooks/use-push-notifications';

export default function AppLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  usePushNotifications();

  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Stack
      key={user?.id}
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
        headerStyle: { backgroundColor: theme.colors.card },
        headerTintColor: theme.colors.foreground,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings/profile"
        options={{ title: t('settings.profile.title'), headerBackTitle: t('common.settings') }}
      />
      <Stack.Screen
        name="settings/email"
        options={{ title: t('settings.email.title'), headerBackTitle: t('common.settings') }}
      />
      <Stack.Screen
        name="settings/change-password"
        options={{ title: t('settings.password.title'), headerBackTitle: t('common.settings') }}
      />
      <Stack.Screen
        name="settings/delete-account"
        options={{ title: t('settings.danger.deleteTitle'), headerBackTitle: t('common.settings') }}
      />
      <Stack.Screen
        name="settings/language"
        options={{ title: t('language.label'), headerBackTitle: t('common.settings') }}
      />
      <Stack.Screen
        name="settings/theme"
        options={{ title: t('theme.label'), headerBackTitle: t('common.settings') }}
      />
      <Stack.Screen
        name="settings/notification-preferences"
        options={{ title: t('notifications.preferences'), headerBackTitle: t('common.settings') }}
      />
      <Stack.Screen
        name="org/members"
        options={{ title: t('org.members'), headerBackTitle: t('common.settings') }}
      />
      <Stack.Screen
        name="org/invite"
        options={{ title: t('org.inviteMember'), presentation: 'modal' }}
      />
      <Stack.Screen
        name="org/settings"
        options={{ title: t('org.settings'), headerBackTitle: t('common.settings') }}
      />
      <Stack.Screen
        name="org/switch"
        options={{ title: t('common.switchOrganization'), headerBackTitle: t('common.settings') }}
      />
      <Stack.Screen
        name="admin/dashboard"
        options={{ title: t('admin.title'), headerBackTitle: t('common.settings') }}
      />
    </Stack>
  );
}
