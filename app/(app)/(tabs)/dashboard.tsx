import { useEffect } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import { useAppTheme } from '@/providers/theme-provider';
import { useAuthStore } from '@/stores/auth-store';
import {
  Text,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui';
import { apiFetch } from '@/lib/api-client';
import { qk } from '@/lib/query-keys';
import type { MeResponse } from '@/lib/types';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const activeOrganizationId = useAuthStore((s) => s.activeOrganizationId);
  const memberships = useAuthStore((s) => s.memberships);

  const setActiveOrganization = useAuthStore((s) => s.setActiveOrganization);

  const activeOrg = memberships.find(
    (m) => m.organizationId === activeOrganizationId,
  );

  const {
    data: me,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: qk.authMe,
    queryFn: async () => {
      const res = await apiFetch('/auth/me');
      if (!res.ok) throw new Error('Failed to fetch profile');
      return (await res.json()) as MeResponse;
    },
  });

  // Sync fresh membership data back to auth store (covers the case where
  // completeAuth couldn't fetch memberships during login)
  useEffect(() => {
    if (!me) return;
    const store = useAuthStore.getState();
    const freshMemberships = me.memberships ?? [];

    if (store.user) {
      store.setUser({ ...store.user, ...me });
    }

    // Only update if store has stale/empty memberships
    if (freshMemberships.length > 0 && store.memberships.length !== freshMemberships.length) {
      useAuthStore.setState({ memberships: freshMemberships });
    }

    // Set active org if none is set yet
    if (!store.activeOrganizationId && freshMemberships.length > 0) {
      setActiveOrganization(freshMemberships[0].organizationId);
    }
  }, [me, setActiveOrganization]);

  if (isLoading) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      {/* Greeting */}
      <View style={{ gap: theme.spacing.xs }}>
        <Text variant="h2">
          {t('dashboard.welcome', { name: user?.firstName ?? '' })}
        </Text>
        <Text variant="bodySmall" color={theme.colors.mutedForeground}>
          {t('dashboard.description')}
        </Text>
      </View>

      {/* Active Organization */}
      {activeOrg && (
        <Card>
          <CardHeader>
            <CardTitle>{activeOrg.organizationName}</CardTitle>
            <CardDescription>
              {`${activeOrg.roleName} · ${activeOrg.organizationSlug}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View style={{ gap: theme.spacing.xs }}>
              <View style={styles.statRow}>
                <Text variant="bodySmall" color={theme.colors.mutedForeground}>
                  {t('auth.organization')}
                </Text>
                <Text variant="body">{activeOrg.organizationName}</Text>
              </View>
              <View style={styles.statRow}>
                <Text variant="bodySmall" color={theme.colors.mutedForeground}>
                  {t('auth.assignedRole')}
                </Text>
                <Text variant="body">{activeOrg.roleName}</Text>
              </View>
            </View>
          </CardContent>
        </Card>
      )}

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profile.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <View style={{ gap: theme.spacing.xs }}>
            <View style={styles.statRow}>
              <Text variant="bodySmall" color={theme.colors.mutedForeground}>
                {t('auth.emailAddress')}
              </Text>
              <Text variant="body">{me?.email ?? user?.email}</Text>
            </View>
            {(me?.firstName ?? user?.firstName) && (
              <View style={styles.statRow}>
                <Text variant="bodySmall" color={theme.colors.mutedForeground}>
                  {t('auth.firstName')}
                </Text>
                <Text variant="body">
                  {me?.firstName ?? user?.firstName}{' '}
                  {me?.lastName ?? user?.lastName}
                </Text>
              </View>
            )}
            <View style={styles.statRow}>
              <Text variant="bodySmall" color={theme.colors.mutedForeground}>
                {t('common.organizations')}
              </Text>
              <Text variant="body">
                {(me?.memberships ?? memberships).length}
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexGrow: 1,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 32,
  },
});
