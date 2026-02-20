import React, { useState, useCallback } from 'react';
import { View, Pressable, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/providers/theme-provider';
import { useAuthStore } from '@/stores/auth-store';
import { Text, Button } from '@/components/ui';
import { refreshMemberships } from '@/lib/auth-helpers';

const AVATAR_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E',
  '#F97316', '#EAB308', '#22C55E', '#14B8A6',
  '#06B6D4', '#3B82F6',
];

function getOrgInitial(name: string): string {
  return name.charAt(0).toUpperCase() || '?';
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function OrgSwitchScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();

  const memberships = useAuthStore((s) => s.memberships);
  const activeOrganizationId = useAuthStore((s) => s.activeOrganizationId);
  const setActiveOrganization = useAuthStore((s) => s.setActiveOrganization);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshMemberships();
    setIsRefreshing(false);
  }, []);

  function handleSelect(orgId: string) {
    setActiveOrganization(orgId);
    router.back();
  }

  if (memberships.length === 0) {
    return (
      <View
        style={[
          styles.empty,
          { backgroundColor: theme.colors.background, padding: theme.spacing.lg },
        ]}
      >
        <View
          style={[
            styles.emptyIcon,
            { backgroundColor: theme.colors.muted },
          ]}
        >
          <Ionicons
            name="business-outline"
            size={32}
            color={theme.colors.mutedForeground}
          />
        </View>
        <Text
          variant="bodySmall"
          color={theme.colors.mutedForeground}
          style={styles.textCenter}
        >
          {t('common.organizations')}
        </Text>
        <Button
          variant="outline"
          size="lg"
          onPress={() => router.push('/(app)/org/create')}
        >
          {t('org.createOrganization')}
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[
        styles.container,
        { padding: theme.spacing.lg },
      ]}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
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
        {memberships.map((membership, index) => {
          const isActive =
            membership.organizationId === activeOrganizationId;
          const avatarColor = getAvatarColor(membership.organizationName);

          return (
            <Pressable
              key={membership.organizationId}
              onPress={() => handleSelect(membership.organizationId)}
              style={({ pressed }) => [
                styles.row,
                { paddingHorizontal: theme.spacing.md },
                index < memberships.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.border,
                },
                isActive && {
                  backgroundColor: theme.colors.primary + '08',
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={[styles.rowLeft, { gap: theme.spacing.sm }]}>
                <View
                  style={[
                    styles.orgAvatar,
                    { backgroundColor: avatarColor + '18' },
                  ]}
                >
                  <Text
                    variant="label"
                    color={avatarColor}
                    style={styles.orgInitial}
                  >
                    {getOrgInitial(membership.organizationName)}
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    variant="body"
                    color={
                      isActive
                        ? theme.colors.primary
                        : theme.colors.foreground
                    }
                  >
                    {membership.organizationName}
                  </Text>
                  <Text
                    variant="caption"
                    color={theme.colors.mutedForeground}
                  >
                    {membership.roleName}
                  </Text>
                </View>
              </View>
              {isActive && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={theme.colors.primary}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Create Organization Button */}
      <Button
        variant="outline"
        size="lg"
        onPress={() => router.push('/(app)/org/create')}
        style={{ marginTop: theme.spacing.sm }}
      >
        {t('org.createOrganization')}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCenter: {
    textAlign: 'center',
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingVertical: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orgAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgInitial: {
    fontSize: 16,
    fontWeight: '600',
  },
});
