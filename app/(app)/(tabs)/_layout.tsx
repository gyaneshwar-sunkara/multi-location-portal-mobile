import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAppTheme } from '@/providers/theme-provider';
import { apiFetch } from '@/lib/api-client';
import { qk } from '@/lib/query-keys';

export default function TabsLayout() {
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  const { data: unreadData } = useQuery({
    queryKey: qk.notificationsUnread,
    queryFn: async () => {
      const res = await apiFetch('/notifications/unread-count');
      if (!res.ok) return { count: 0 };
      return res.json() as Promise<{ count: number }>;
    },
    refetchInterval: 60_000,
  });

  const unreadCount = unreadData?.count ?? 0;

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          ...Platform.select({
            ios: {
              shadowColor: theme.colors.border,
              shadowOpacity: 0.3,
              shadowOffset: { width: 0, height: 1 },
              shadowRadius: 2,
            },
            android: { elevation: 2 },
          }),
        },
        headerTitleStyle: { fontWeight: '600' },
        headerTintColor: theme.colors.foreground,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          ...Platform.select({
            ios: {
              shadowColor: theme.colors.foreground,
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: -2 },
              shadowRadius: 6,
            },
            android: { elevation: 8 },
          }),
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mutedForeground,
        tabBarLabelStyle: { fontWeight: '500', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('dashboard.title'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t('notifications.title'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'notifications' : 'notifications-outline'}
              size={size}
              color={color}
            />
          ),
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
          tabBarBadgeStyle: { backgroundColor: theme.colors.notification, fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings.title'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
