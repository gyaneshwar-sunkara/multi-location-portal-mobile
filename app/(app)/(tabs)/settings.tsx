import React from 'react';
import { View, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/providers/theme-provider';
import { useAuth } from '@/providers/auth-provider';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { Text } from '@/components/ui';
import { getInitials } from '@/lib/format';
import { meetsOrgHierarchy, isPlatformUser, ORG_HIERARCHY } from '@/lib/permissions';

type SettingsItem = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  destructive?: boolean;
};

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user, logout } = useAuth();

  const memberships = useAuthStore((s) => s.memberships);
  const activeOrganizationId = useAuthStore((s) => s.activeOrganizationId);
  const activeMembership = memberships.find(
    (m) => m.organizationId === activeOrganizationId,
  );
  const isOrgAdmin = meetsOrgHierarchy(
    activeMembership?.roleHierarchy,
    ORG_HIERARCHY.ADMIN_LEVEL,
  );

  const language = useUIStore((s) => s.language);
  const colorScheme = useUIStore((s) => s.colorScheme);

  const sections: { title: string; items: SettingsItem[] }[] = [
    {
      title: t('common.personal'),
      items: [
        {
          key: 'profile',
          icon: 'person-outline',
          label: t('settings.profile.title'),
          value: user
            ? [user.firstName, user.lastName].filter(Boolean).join(' ')
            : undefined,
          onPress: () => router.push('/(app)/settings/profile'),
        },
        {
          key: 'email',
          icon: 'mail-outline',
          label: t('settings.email.title'),
          value: user?.email ?? undefined,
          onPress: () => {},
        },
        {
          key: 'change-password',
          icon: 'lock-closed-outline',
          label: t('settings.password.title'),
          onPress: () => router.push('/(app)/settings/change-password'),
        },
        {
          key: 'notification-preferences',
          icon: 'notifications-outline',
          label: t('notifications.preferences'),
          onPress: () => router.push('/(app)/settings/notification-preferences'),
        },
      ],
    },
    {
      title: t('settings.appearance.title'),
      items: [
        {
          key: 'language',
          icon: 'globe-outline',
          label: t('language.label'),
          value: t(`language.${language}`),
          onPress: () => router.push('/(app)/settings/language'),
        },
        {
          key: 'theme',
          icon: 'color-palette-outline',
          label: t('theme.label'),
          value: t(`theme.${colorScheme}`),
          onPress: () => router.push('/(app)/settings/theme'),
        },
      ],
    },
    {
      title: t('common.organizations'),
      items: [
        {
          key: 'members',
          icon: 'people-outline',
          label: t('org.members'),
          onPress: () => router.push('/(app)/org/members'),
        },
        ...(isOrgAdmin
          ? [
              {
                key: 'org-settings',
                icon: 'business-outline' as const,
                label: t('org.settings'),
                onPress: () => router.push('/(app)/org/settings'),
              },
            ]
          : []),
        {
          key: 'org-switch',
          icon: 'swap-horizontal-outline',
          label: t('common.switchOrganization'),
          onPress: () => router.push('/(app)/org/switch'),
        },
      ],
    },
    ...(isPlatformUser(user?.platformRole)
      ? [
          {
            title: t('admin.title'),
            items: [
              {
                key: 'admin-dashboard',
                icon: 'stats-chart-outline' as keyof typeof Ionicons.glyphMap,
                label: t('admin.title'),
                onPress: () => router.push('/(app)/admin/dashboard'),
              },
            ],
          },
        ]
      : []),
    {
      title: t('common.account'),
      items: [
        {
          key: 'delete-account',
          icon: 'trash-outline',
          label: t('settings.danger.deleteAccount'),
          onPress: () => router.push('/(app)/settings/delete-account'),
          destructive: true,
        },
        {
          key: 'sign-out',
          icon: 'log-out-outline',
          label: t('auth.signOut'),
          onPress: logout,
          destructive: true,
        },
      ],
    },
  ];

  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ')
    : undefined;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[
        styles.container,
        { padding: theme.spacing.lg, gap: theme.spacing.lg },
      ]}
    >
      {/* User Profile Header */}
      <View style={[styles.profileCard, { gap: theme.spacing.md }]}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text
            variant="h2"
            color={theme.colors.primaryForeground}
            style={styles.avatarText}
          >
            {getInitials(user?.firstName, user?.lastName)}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          {fullName && <Text variant="h3">{fullName}</Text>}
          {user?.email && (
            <Text variant="bodySmall" color={theme.colors.mutedForeground}>
              {user.email}
            </Text>
          )}
        </View>
      </View>

      {/* Settings Sections */}
      {sections.map((section) => (
        <View key={section.title} style={{ gap: theme.spacing.xs }}>
          <Text
            variant="caption"
            color={theme.colors.mutedForeground}
            style={styles.sectionTitle}
          >
            {section.title.toUpperCase()}
          </Text>
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                borderRadius: theme.radii.lg,
              },
            ]}
          >
            {section.items.map((item, index) => (
              <Pressable
                key={item.key}
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.row,
                  { paddingHorizontal: theme.spacing.md },
                  index < section.items.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.colors.border,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={[styles.rowLeft, { gap: theme.spacing.sm }]}>
                  <View
                    style={[
                      styles.rowIcon,
                      {
                        backgroundColor: item.destructive
                          ? theme.colors.destructive + '12'
                          : theme.colors.muted,
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={
                        item.destructive
                          ? theme.colors.destructive
                          : theme.colors.mutedForeground
                      }
                    />
                  </View>
                  <Text
                    variant="body"
                    color={
                      item.destructive
                        ? theme.colors.destructive
                        : theme.colors.foreground
                    }
                  >
                    {item.label}
                  </Text>
                </View>
                <View style={[styles.rowRight, { gap: theme.spacing.xs }]}>
                  {item.value && (
                    <Text
                      variant="caption"
                      color={theme.colors.mutedForeground}
                      numberOfLines={1}
                      style={styles.rowValue}
                    >
                      {item.value}
                    </Text>
                  )}
                  {!item.destructive && (
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={theme.colors.mutedForeground}
                    />
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    lineHeight: 34,
  },
  profileInfo: {
    alignItems: 'center',
    gap: 2,
  },
  sectionTitle: {
    paddingHorizontal: 4,
    letterSpacing: 0.5,
  },
  sectionCard: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingVertical: 10,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    maxWidth: 120,
  },
});
