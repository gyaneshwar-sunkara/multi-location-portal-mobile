import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/providers/theme-provider';

export default function TabsLayout() {
  const { theme } = useAppTheme();
  const { t } = useTranslation();

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
