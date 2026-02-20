import React from 'react';
import { View, Switch, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAppTheme } from '@/providers/theme-provider';
import { Text } from '@/components/ui';
import { ErrorState } from '@/components/ErrorState';
import { apiFetch } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-error';
import { qk } from '@/lib/query-keys';
import type { NotificationPreferences } from '@/lib/types';

type ToggleItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  channel: 'email' | 'push';
  category: string;
};

export default function NotificationPreferencesScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading, isError, refetch } = useQuery({
    queryKey: qk.notificationsPreferences,
    queryFn: async () => {
      const res = await apiFetch('/notifications/preferences');
      if (!res.ok) throw new Error('Failed to fetch preferences');
      return res.json() as Promise<NotificationPreferences>;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<NotificationPreferences>) => {
      const res = await apiFetch('/notifications/preferences', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await parseApiError(res);
        throw new Error(error);
      }
      return res.json() as Promise<NotificationPreferences>;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(qk.notificationsPreferences, updated);
    },
    onError: (error: Error) => {
      Alert.alert('', error.message);
      queryClient.invalidateQueries({ queryKey: qk.notificationsPreferences });
    },
  });

  function handleToggle(channel: 'email' | 'push', category: string, value: boolean) {
    if (!preferences) return;
    updateMutation.mutate({ [channel]: { [category]: value } });
    // Optimistic update
    queryClient.setQueryData(qk.notificationsPreferences, {
      ...preferences,
      [channel]: { ...preferences[channel], [category]: value },
    });
  }

  const emailToggles: ToggleItem[] = [
    { key: 'email-security', label: t('notifications.channelSecurity'), icon: 'shield-outline', channel: 'email', category: 'security' },
    { key: 'email-organization', label: t('notifications.channelOrganization'), icon: 'business-outline', channel: 'email', category: 'organization' },
    { key: 'email-marketing', label: t('notifications.channelMarketing'), icon: 'megaphone-outline', channel: 'email', category: 'marketing' },
  ];

  const pushToggles: ToggleItem[] = [
    { key: 'push-security', label: t('notifications.channelSecurity'), icon: 'shield-outline', channel: 'push', category: 'security' },
    { key: 'push-organization', label: t('notifications.channelOrganization'), icon: 'business-outline', channel: 'push', category: 'organization' },
  ];

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  function renderSection(title: string, items: ToggleItem[]) {
    return (
      <View style={{ gap: theme.spacing.xs }}>
        <Text
          variant="caption"
          color={theme.colors.mutedForeground}
          style={styles.sectionTitle}
        >
          {title.toUpperCase()}
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.lg,
            },
          ]}
        >
          {items.map((item, index) => {
            const value =
              preferences?.[item.channel]?.[item.category as keyof (typeof preferences)[typeof item.channel]] ?? false;

            return (
              <View
                key={item.key}
                style={[
                  styles.row,
                  { paddingHorizontal: theme.spacing.md },
                  index < items.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
              >
                <View style={[styles.rowLeft, { gap: theme.spacing.sm }]}>
                  <View style={[styles.iconContainer, { backgroundColor: theme.colors.muted }]}>
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={theme.colors.mutedForeground}
                    />
                  </View>
                  <Text variant="body" style={{ flex: 1 }}>
                    {item.label}
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={(v) => handleToggle(item.channel, item.category, v)}
                  trackColor={{ false: theme.colors.muted, true: theme.colors.primary }}
                  thumbColor={theme.colors.background}
                />
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[
        styles.container,
        { padding: theme.spacing.lg, gap: theme.spacing.lg },
      ]}
    >
      {/* Header */}
      <View style={{ gap: theme.spacing.xs }}>
        <Text variant="h3">{t('notifications.preferences')}</Text>
        <Text variant="bodySmall" color={theme.colors.mutedForeground}>
          {t('notifications.preferencesDescription')}
        </Text>
      </View>

      {renderSection(t('notifications.emailNotifications'), emailToggles)}
      {renderSection(t('notifications.pushNotifications'), pushToggles)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    paddingHorizontal: 4,
    letterSpacing: 0.5,
  },
  card: {
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
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
