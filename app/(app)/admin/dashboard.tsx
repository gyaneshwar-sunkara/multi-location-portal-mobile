import React from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/providers/theme-provider';
import { useAuthStore } from '@/stores/auth-store';
import { Text } from '@/components/ui';
import { ErrorState } from '@/components/ErrorState';
import { apiFetch } from '@/lib/api-client';
import { qk } from '@/lib/query-keys';
import { isPlatformUser } from '@/lib/permissions';
import type { AdminStats } from '@/lib/types';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: number | undefined;
  label: string;
  width: number;
}

function StatCard({ icon, value, label, width }: StatCardProps) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.statCard,
        {
          width,
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          padding: theme.spacing.md,
          gap: theme.spacing.sm,
        },
      ]}
    >
      <View
        style={[
          styles.statIcon,
          { backgroundColor: theme.colors.primary + '12' },
        ]}
      >
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </View>
      {value !== undefined ? (
        <Text variant="h2">{value.toLocaleString()}</Text>
      ) : (
        <ActivityIndicator size="small" />
      )}
      <Text variant="caption" color={theme.colors.mutedForeground}>
        {label}
      </Text>
    </View>
  );
}

export default function AdminDashboardScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();

  const user = useAuthStore((s) => s.user);
  const isAdmin = isPlatformUser(user?.platformRole);

  // Hooks must be called unconditionally — use `enabled` to skip the fetch
  const { data: stats, isError, error, isRefetching, refetch } = useQuery({
    queryKey: qk.adminStats,
    queryFn: async () => {
      const res = await apiFetch('/admin/stats/overview');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json() as Promise<AdminStats>;
    },
    enabled: isAdmin,
  });

  // Guard: redirect non-platform users
  if (!isAdmin) {
    return <Redirect href="/(app)/(tabs)/dashboard" />;
  }

  if (isError) {
    return <ErrorState message={error?.message} onRetry={() => refetch()} />;
  }

  const cardWidth = (screenWidth - theme.spacing.lg * 2 - theme.spacing.md) / 2;

  const statCards: { icon: keyof typeof Ionicons.glyphMap; value: number | undefined; label: string }[] = [
    { icon: 'people-outline', value: stats?.users.total, label: t('admin.totalUsers') },
    { icon: 'checkmark-circle-outline', value: stats?.users.active, label: t('admin.activeUsers') },
    { icon: 'shield-checkmark-outline', value: stats?.users.verified, label: t('admin.verifiedUsers') },
    { icon: 'lock-closed-outline', value: stats?.users.with2FA, label: t('admin.usersWith2FA') },
    { icon: 'business-outline', value: stats?.organizations.total, label: t('admin.totalOrgs') },
    { icon: 'pulse-outline', value: stats?.organizations.active, label: t('admin.activeOrgs') },
    { icon: 'globe-outline', value: stats?.sessions.active, label: t('admin.activeSessions') },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[
        styles.container,
        { padding: theme.spacing.lg, gap: theme.spacing.lg },
      ]}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <View style={{ gap: theme.spacing.xs }}>
        <Text variant="h3">{t('admin.title')}</Text>
        <Text variant="bodySmall" color={theme.colors.mutedForeground}>
          {t('admin.description')}
        </Text>
      </View>

      <View style={[styles.grid, { gap: theme.spacing.md }]}>
        {statCards.map((card) => (
          <StatCard
            key={card.label}
            icon={card.icon}
            value={card.value}
            label={card.label}
            width={cardWidth}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statCard: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
