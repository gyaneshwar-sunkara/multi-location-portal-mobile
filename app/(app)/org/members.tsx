import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  Alert,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { Swipeable } from 'react-native-gesture-handler';

import { useAppTheme } from '@/providers/theme-provider';
import { useAuthStore } from '@/stores/auth-store';
import { Text } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { apiFetch } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-error';
import { qk } from '@/lib/query-keys';
import { meetsOrgHierarchy, ORG_HIERARCHY } from '@/lib/permissions';
import type { OrgMember, OrgInvitation } from '@/lib/types';

const PAGE_SIZE = 20;

const AVATAR_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E',
  '#F97316', '#EAB308', '#22C55E', '#14B8A6',
  '#06B6D4', '#3B82F6',
];

function getInitial(name: string | null): string {
  return name?.charAt(0)?.toUpperCase() ?? '?';
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function MembersScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const memberships = useAuthStore((s) => s.memberships);
  const activeOrganizationId = useAuthStore((s) => s.activeOrganizationId);
  const activeMembership = memberships.find(
    (m) => m.organizationId === activeOrganizationId,
  );
  const isOrgAdmin = meetsOrgHierarchy(
    activeMembership?.roleHierarchy,
    ORG_HIERARCHY.ADMIN_LEVEL,
  );

  const [removingId, setRemovingId] = useState<string | null>(null);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  // ── Members query ──────────────────────────────────────────────────────
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: qk.orgMembersList(activeOrganizationId!),
    queryFn: async ({ pageParam = 0 }) => {
      const res = await apiFetch(
        `/organizations/${activeOrganizationId}/members?skip=${pageParam}&take=${PAGE_SIZE}`,
      );
      if (!res.ok) throw new Error('Failed to fetch members');
      return res.json() as Promise<{
        data: OrgMember[];
        total: number;
        skip: number;
        take: number;
      }>;
    },
    getNextPageParam: (lastPage) =>
      lastPage.skip + lastPage.take < lastPage.total
        ? lastPage.skip + lastPage.take
        : undefined,
    initialPageParam: 0,
    enabled: !!activeOrganizationId,
  });

  const members = data?.pages.flatMap((p) => p.data) ?? [];

  // ── Invitations query (admin only) ─────────────────────────────────────
  const { data: invitationsData } = useQuery({
    queryKey: qk.orgInvitations(activeOrganizationId!),
    queryFn: async () => {
      const res = await apiFetch('/invitations?status=pending');
      if (!res.ok) return { data: [] };
      return res.json() as Promise<{ data: OrgInvitation[] }>;
    },
    enabled: isOrgAdmin && !!activeOrganizationId,
  });

  const invitations = invitationsData?.data ?? [];

  // ── Header invite button (admin only) ──────────────────────────────────
  const headerRight = isOrgAdmin
    ? () => (
        <Pressable
          onPress={() => router.push('/(app)/org/invite')}
          hitSlop={8}
        >
          <Ionicons name="person-add-outline" size={22} color={theme.colors.primary} />
        </Pressable>
      )
    : undefined;

  // ── Remove member ──────────────────────────────────────────────────────
  async function handleRemove(member: OrgMember) {
    Alert.alert(t('org.removeTitle'), t('org.removeDescription'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('org.remove'),
        style: 'destructive',
        onPress: async () => {
          setRemovingId(member.userId);
          try {
            const res = await apiFetch(
              `/organizations/${activeOrganizationId}/members/${member.userId}`,
              { method: 'DELETE' },
            );
            if (!res.ok) {
              const error = await parseApiError(res);
              Alert.alert('', error);
              return;
            }
            Alert.alert('', t('org.removed'));
            queryClient.invalidateQueries({ queryKey: qk.orgMembers(activeOrganizationId!) });
          } catch {
            Alert.alert('', t('errorState.genericDescription'));
          } finally {
            setRemovingId(null);
          }
        },
      },
    ]);
    // Close the swipeable
    swipeableRefs.current.get(member.userId)?.close();
  }

  // ── Cancel invitation ──────────────────────────────────────────────────
  function handleCancelInvite(invitation: OrgInvitation) {
    Alert.alert(t('org.cancelInvite'), t('org.cancelInviteDescription'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await apiFetch(`/invitations/${invitation.id}/revoke`, {
              method: 'POST',
            });
            if (!res.ok) {
              const error = await parseApiError(res);
              Alert.alert('', error);
              return;
            }
            Alert.alert('', t('org.inviteCancelled'));
            queryClient.invalidateQueries({ queryKey: qk.orgInvitations(activeOrganizationId!) });
          } catch {
            Alert.alert('', t('errorState.genericDescription'));
          }
        },
      },
    ]);
  }

  // ── Render swipe action ────────────────────────────────────────────────
  const renderRightActions = useCallback(
    (member: OrgMember) => () => (
      <Pressable
        onPress={() => handleRemove(member)}
        style={[styles.swipeAction, { backgroundColor: theme.colors.destructive }]}
      >
        {removingId === member.userId ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text variant="caption" color="#fff">
              {t('org.remove')}
            </Text>
          </>
        )}
      </Pressable>
    ),
    [removingId, theme.colors.destructive, t],
  );

  // ── Render member row ──────────────────────────────────────────────────
  const renderMember = useCallback(
    ({ item }: { item: OrgMember }) => {
      const displayName = [item.firstName, item.lastName]
        .filter(Boolean)
        .join(' ');
      const avatarColor = getAvatarColor(item.email);
      const initial = getInitial(item.firstName) || getInitial(item.email);

      const row = (
        <View
          style={[
            styles.memberRow,
            {
              paddingHorizontal: theme.spacing.md,
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          <View style={[styles.rowLeft, { gap: theme.spacing.sm }]}>
            <View
              style={[styles.avatar, { backgroundColor: avatarColor + '18' }]}
            >
              <Text variant="label" color={avatarColor} style={styles.avatarText}>
                {initial}
              </Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              {displayName ? (
                <Text variant="body">{displayName}</Text>
              ) : null}
              <Text variant="caption" color={theme.colors.mutedForeground}>
                {item.email}
              </Text>
            </View>
          </View>
          <Badge label={item.roleName} />
        </View>
      );

      if (!isOrgAdmin) return row;

      return (
        <Swipeable
          ref={(ref) => {
            if (ref) swipeableRefs.current.set(item.userId, ref);
          }}
          renderRightActions={renderRightActions(item)}
          overshootRight={false}
        >
          {row}
        </Swipeable>
      );
    },
    [isOrgAdmin, theme, renderRightActions],
  );

  // ── Invitations footer ─────────────────────────────────────────────────
  const renderFooter = useCallback(() => {
    if (!isOrgAdmin) return null;

    return (
      <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.xl }}>
        <Text
          variant="caption"
          color={theme.colors.mutedForeground}
          style={[styles.sectionTitle, { paddingHorizontal: theme.spacing.md }]}
        >
          {t('org.pendingInvitations').toUpperCase()}
        </Text>

        {invitations.length === 0 ? (
          <Text
            variant="bodySmall"
            color={theme.colors.mutedForeground}
            style={{ paddingHorizontal: theme.spacing.md }}
          >
            {t('org.noPendingInvitations')}
          </Text>
        ) : (
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                borderRadius: theme.radii.lg,
                marginHorizontal: theme.spacing.md,
              },
            ]}
          >
            {invitations.map((inv, index) => (
              <View
                key={inv.id}
                style={[
                  styles.invitationRow,
                  { paddingHorizontal: theme.spacing.md },
                  index < invitations.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="body">{inv.email}</Text>
                  <View style={styles.invitationMeta}>
                    <Badge label={inv.roleName} />
                    <Text variant="caption" color={theme.colors.mutedForeground}>
                      {t('org.expires', {
                        date: new Date(inv.expiresAt).toLocaleDateString(),
                      })}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => handleCancelInvite(inv)}
                  hitSlop={8}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={22}
                    color={theme.colors.mutedForeground}
                  />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {isFetchingNextPage && (
          <ActivityIndicator style={{ marginTop: theme.spacing.md }} />
        )}
      </View>
    );
  }, [isOrgAdmin, invitations, isFetchingNextPage, theme, t]);

  // ── Empty state ────────────────────────────────────────────────────────
  if (!isLoading && members.length === 0) {
    return (
      <>
      <Stack.Screen options={{ headerRight }} />
      <View
        style={[
          styles.empty,
          { backgroundColor: theme.colors.background, padding: theme.spacing.lg },
        ]}
      >
        <View style={[styles.emptyIcon, { backgroundColor: theme.colors.muted }]}>
          <Ionicons
            name="people-outline"
            size={32}
            color={theme.colors.mutedForeground}
          />
        </View>
        <Text
          variant="bodySmall"
          color={theme.colors.mutedForeground}
          style={styles.textCenter}
        >
          {t('org.noMembers')}
        </Text>
      </View>
      </>
    );
  }

  return (
    <>
    <Stack.Screen options={{ headerRight }} />
    <FlatList
      data={members}
      keyExtractor={(item) => item.userId}
      renderItem={renderMember}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingVertical: theme.spacing.md }}
      ItemSeparatorComponent={() => (
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: theme.colors.border,
            marginHorizontal: theme.spacing.md,
          }}
        />
      )}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={
        isLoading ? (
          <ActivityIndicator style={{ marginTop: theme.spacing.xl }} />
        ) : null
      }
    />
    </>
  );
}

const styles = StyleSheet.create({
  memberRow: {
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    gap: 4,
  },
  sectionTitle: {
    letterSpacing: 0.5,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  invitationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingVertical: 12,
  },
  invitationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
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
});
