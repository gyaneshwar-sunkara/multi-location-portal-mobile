import { useEffect } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/providers/theme-provider';
import { useAuthStore } from '@/stores/auth-store';
import {
  Text,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Skeleton,
} from '@/components/ui';
import { ErrorState } from '@/components/ErrorState';
import { apiFetch } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-error';
import { getInitials } from '@/lib/format';
import { qk } from '@/lib/query-keys';
import type { MeResponse } from '@/lib/types';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const activeOrganizationId = useAuthStore((s) => s.activeOrganizationId);
  const memberships = useAuthStore((s) => s.memberships);

  const setActiveOrganization = useAuthStore((s) => s.setActiveOrganization);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const activeOrg = memberships.find(
    (m) => m.organizationId === activeOrganizationId,
  );

  const {
    data: me,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: qk.authMe,
    queryFn: async () => {
      const res = await apiFetch('/auth/me');
      if (!res.ok) {
        const message = await parseApiError(res);
        throw new Error(message);
      }
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

    // Deep-compare memberships before updating to prevent unnecessary re-renders.
    // Compare org IDs + role names + org names as a lightweight but sufficient check.
    const isSame =
      freshMemberships.length === store.memberships.length &&
      freshMemberships.every((fm, i) => {
        const sm = store.memberships[i];
        return (
          sm &&
          fm.organizationId === sm.organizationId &&
          fm.roleName === sm.roleName &&
          fm.organizationName === sm.organizationName
        );
      });

    if (freshMemberships.length > 0 && !isSame) {
      useAuthStore.setState({ memberships: freshMemberships });
    }

    // Set active org if none is set yet
    if (!store.activeOrganizationId && freshMemberships.length > 0) {
      setActiveOrganization(freshMemberships[0].organizationId);
    }
  }, [me, setActiveOrganization]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <View
          style={[
            styles.container,
            { padding: theme.spacing.lg, gap: theme.spacing.lg, backgroundColor: theme.colors.background, flex: 1 },
          ]}
        >
          {/* Profile skeleton */}
          <View style={[styles.profileHeader, { gap: theme.spacing.md }]}>
            <Skeleton width={56} height={56} borderRadius={28} />
            <View style={{ flex: 1, gap: theme.spacing.xs }}>
              <Skeleton width={160} height={20} />
              <Skeleton width={120} height={14} />
            </View>
          </View>
          {/* Card skeleton */}
          <View style={{ gap: theme.spacing.md }}>
            <Skeleton height={120} borderRadius={theme.radii.xl} />
            <Skeleton height={140} borderRadius={theme.radii.xl} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  const firstName = me?.firstName ?? user?.firstName;
  const lastName = me?.lastName ?? user?.lastName;
  const email = me?.email ?? user?.email;
  const orgCount = (me?.memberships ?? memberships).length;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
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
      {/* Profile Header */}
      <View style={[styles.profileHeader, { gap: theme.spacing.md }]}>
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
            {getInitials(firstName, lastName)}
          </Text>
        </View>
        <View style={[styles.profileInfo, { gap: theme.spacing.xs }]}>
          <Text variant="h2">
            {t('dashboard.welcome', { name: firstName ?? '' })}
          </Text>
          <Text variant="bodySmall" color={theme.colors.mutedForeground}>
            {t('dashboard.description')}
          </Text>
        </View>
      </View>

      {/* Active Organization */}
      {activeOrg && (
        <Card>
          <CardHeader>
            <View style={[styles.cardHeaderRow, { gap: theme.spacing.sm }]}>
              <View
                style={[
                  styles.cardIcon,
                  { backgroundColor: theme.colors.primary + '12' },
                ]}
              >
                <Ionicons
                  name="business"
                  size={18}
                  color={theme.colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <CardTitle>{activeOrg.organizationName}</CardTitle>
                <CardDescription>{activeOrg.roleName}</CardDescription>
              </View>
            </View>
          </CardHeader>
          <CardContent>
            <View
              style={[
                styles.infoRow,
                {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.border,
                  paddingBottom: theme.spacing.sm,
                },
              ]}
            >
              <View style={[styles.infoLabel, { gap: theme.spacing.xs }]}>
                <Ionicons
                  name="link-outline"
                  size={16}
                  color={theme.colors.mutedForeground}
                />
                <Text variant="bodySmall" color={theme.colors.mutedForeground}>
                  {t('common.slug')}
                </Text>
              </View>
              <Text variant="bodySmall">{activeOrg.organizationSlug}</Text>
            </View>
            <View
              style={[
                styles.infoRow,
                { paddingTop: theme.spacing.sm },
              ]}
            >
              <View style={[styles.infoLabel, { gap: theme.spacing.xs }]}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color={theme.colors.mutedForeground}
                />
                <Text variant="bodySmall" color={theme.colors.mutedForeground}>
                  {t('auth.assignedRole')}
                </Text>
              </View>
              <Text variant="bodySmall">{activeOrg.roleName}</Text>
            </View>
          </CardContent>
        </Card>
      )}

      {/* Account Info */}
      <Card>
        <CardHeader>
          <View style={[styles.cardHeaderRow, { gap: theme.spacing.sm }]}>
            <View
              style={[
                styles.cardIcon,
                { backgroundColor: theme.colors.primary + '12' },
              ]}
            >
              <Ionicons
                name="person"
                size={18}
                color={theme.colors.primary}
              />
            </View>
            <CardTitle>{t('settings.profile.title')}</CardTitle>
          </View>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 0 }}>
            <View
              style={[
                styles.infoRow,
                {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.border,
                  paddingBottom: theme.spacing.sm,
                },
              ]}
            >
              <View style={[styles.infoLabel, { gap: theme.spacing.xs }]}>
                <Ionicons
                  name="mail-outline"
                  size={16}
                  color={theme.colors.mutedForeground}
                />
                <Text variant="bodySmall" color={theme.colors.mutedForeground}>
                  {t('auth.emailAddress')}
                </Text>
              </View>
              <Text variant="bodySmall" style={styles.infoValue}>
                {email}
              </Text>
            </View>
            {firstName && (
              <View
                style={[
                  styles.infoRow,
                  {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.colors.border,
                    paddingVertical: theme.spacing.sm,
                  },
                ]}
              >
                <View style={[styles.infoLabel, { gap: theme.spacing.xs }]}>
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color={theme.colors.mutedForeground}
                  />
                  <Text variant="bodySmall" color={theme.colors.mutedForeground}>
                    {t('auth.firstName')}
                  </Text>
                </View>
                <Text variant="bodySmall">
                  {firstName} {lastName}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.infoRow,
                { paddingTop: theme.spacing.sm },
              ]}
            >
              <View style={[styles.infoLabel, { gap: theme.spacing.xs }]}>
                <Ionicons
                  name="people-outline"
                  size={16}
                  color={theme.colors.mutedForeground}
                />
                <Text variant="bodySmall" color={theme.colors.mutedForeground}>
                  {t('common.organizations')}
                </Text>
              </View>
              <Text variant="bodySmall">{orgCount}</Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
    </SafeAreaView>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    lineHeight: 28,
  },
  profileInfo: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 36,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    flexShrink: 1,
  },
});
