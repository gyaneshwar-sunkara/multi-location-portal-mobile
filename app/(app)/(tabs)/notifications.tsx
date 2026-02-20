import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  Alert,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Swipeable } from 'react-native-gesture-handler';

import { useAppTheme } from '@/providers/theme-provider';
import { Text } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { apiFetch } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-error';
import { qk } from '@/lib/query-keys';
import { formatRelativeTime } from '@/lib/format';
import type { Notification, NotificationType } from '@/lib/types';

const PAGE_SIZE = 20;

const TYPE_ICONS: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  SECURITY: 'shield-outline',
  SYSTEM: 'information-circle-outline',
  ORGANIZATION: 'business-outline',
  INVITATION: 'mail-outline',
};

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  const [actionId, setActionId] = useState<string | null>(null);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  // ── Notifications query ────────────────────────────────────────────────
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: qk.notificationsList({}),
    queryFn: async ({ pageParam = 0 }) => {
      const res = await apiFetch(
        `/notifications?skip=${pageParam}&take=${PAGE_SIZE}`,
      );
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json() as Promise<{
        data: Notification[];
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
  });

  const notifications = data?.pages.flatMap((p) => p.data) ?? [];
  const hasUnread = notifications.some((n) => !n.readAt);

  // ── Mark as read ───────────────────────────────────────────────────────
  async function handleMarkAsRead(notification: Notification) {
    if (notification.readAt) return;
    setActionId(notification.id);
    try {
      const res = await apiFetch(`/notifications/${notification.id}/read`, {
        method: 'PATCH',
      });
      if (!res.ok) {
        const error = await parseApiError(res);
        Alert.alert('', error);
        return;
      }
      queryClient.invalidateQueries({ queryKey: qk.notifications });
    } catch {
      Alert.alert('', t('errorState.genericDescription'));
    } finally {
      setActionId(null);
    }
  }

  // ── Mark all as read ───────────────────────────────────────────────────
  async function handleMarkAllRead() {
    setActionId('all');
    try {
      const res = await apiFetch('/notifications/read-all', {
        method: 'PATCH',
      });
      if (!res.ok) {
        const error = await parseApiError(res);
        Alert.alert('', error);
        return;
      }
      Alert.alert('', t('notifications.markAllReadSuccess'));
      queryClient.invalidateQueries({ queryKey: qk.notifications });
    } catch {
      Alert.alert('', t('errorState.genericDescription'));
    } finally {
      setActionId(null);
    }
  }

  // ── Dismiss ────────────────────────────────────────────────────────────
  async function handleDismiss(notification: Notification) {
    // Close swipeable immediately (same pattern as members.tsx)
    swipeableRefs.current.get(notification.id)?.close();
    setActionId(notification.id);
    try {
      const res = await apiFetch(`/notifications/${notification.id}/dismiss`, {
        method: 'PATCH',
      });
      if (!res.ok) {
        const error = await parseApiError(res);
        Alert.alert('', error);
        return;
      }
      queryClient.invalidateQueries({ queryKey: qk.notifications });
    } catch {
      Alert.alert('', t('errorState.genericDescription'));
    } finally {
      setActionId(null);
    }
  }

  // ── Header right (set via navigation for Tabs compatibility) ─────────
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: hasUnread
        ? () => (
            <Pressable
              onPress={handleMarkAllRead}
              hitSlop={8}
              disabled={actionId === 'all'}
            >
              {actionId === 'all' ? (
                <ActivityIndicator size="small" />
              ) : (
                <Ionicons
                  name="checkmark-done-outline"
                  size={22}
                  color={theme.colors.primary}
                />
              )}
            </Pressable>
          )
        : undefined,
    });
  }, [navigation, hasUnread, actionId, theme.colors.primary]);

  // ── Swipe action ──────────────────────────────────────────────────────
  const renderRightActions = useCallback(
    (notification: Notification) => () => (
      <Pressable
        onPress={() => handleDismiss(notification)}
        style={[styles.swipeAction, { backgroundColor: theme.colors.destructive }]}
      >
        {actionId === notification.id ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="close-outline" size={18} color="#fff" />
            <Text variant="caption" color="#fff">
              {t('notifications.dismiss')}
            </Text>
          </>
        )}
      </Pressable>
    ),
    [actionId, theme.colors.destructive, t],
  );

  // ── Render notification row ───────────────────────────────────────────
  const renderNotification = useCallback(
    ({ item }: { item: Notification }) => {
      const isUnread = !item.readAt;
      const icon = TYPE_ICONS[item.type] ?? 'notifications-outline';

      const row = (
        <Pressable
          onPress={() => handleMarkAsRead(item)}
          disabled={actionId === item.id}
          style={({ pressed }) => [
            styles.row,
            {
              paddingHorizontal: theme.spacing.md,
              backgroundColor: theme.colors.background,
            },
            pressed && { opacity: 0.7 },
          ]}
        >
          {/* Unread accent bar */}
          {isUnread && (
            <View
              style={[
                styles.unreadBar,
                { backgroundColor: theme.colors.notification },
              ]}
            />
          )}

          {/* Type icon */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isUnread
                  ? theme.colors.primary + '12'
                  : theme.colors.muted,
              },
            ]}
          >
            <Ionicons
              name={icon}
              size={18}
              color={isUnread ? theme.colors.primary : theme.colors.mutedForeground}
            />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text
                variant={isUnread ? 'label' : 'body'}
                style={{ flex: 1 }}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text variant="caption" color={theme.colors.mutedForeground}>
                {formatRelativeTime(item.createdAt)}
              </Text>
            </View>
            {item.message && (
              <Text
                variant="caption"
                color={theme.colors.mutedForeground}
                numberOfLines={2}
              >
                {item.message}
              </Text>
            )}
          </View>

          {/* Unread badge */}
          {isUnread && <Badge label={t('notifications.new')} />}
        </Pressable>
      );

      return (
        <Swipeable
          ref={(ref) => {
            if (ref) swipeableRefs.current.set(item.id, ref);
          }}
          renderRightActions={renderRightActions(item)}
          overshootRight={false}
        >
          {row}
        </Swipeable>
      );
    },
    [actionId, theme, renderRightActions, t],
  );

  // ── Empty state ───────────────────────────────────────────────────────
  if (!isLoading && notifications.length === 0) {
    return (
      <View
        style={[
          styles.empty,
          { backgroundColor: theme.colors.background, padding: theme.spacing.lg },
        ]}
      >
        <View style={[styles.emptyIcon, { backgroundColor: theme.colors.muted }]}>
          <Ionicons
            name="notifications-outline"
            size={32}
            color={theme.colors.mutedForeground}
          />
        </View>
        <Text variant="body" color={theme.colors.mutedForeground} style={styles.textCenter}>
          {t('notifications.empty')}
        </Text>
        <Text variant="caption" color={theme.colors.mutedForeground} style={styles.textCenter}>
          {t('notifications.emptyDescription')}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={renderNotification}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingVertical: theme.spacing.sm }}
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
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.lg }} />
        ) : null
      }
      ListEmptyComponent={
        isLoading ? (
          <ActivityIndicator style={{ marginTop: theme.spacing.xl }} />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
    paddingVertical: 12,
    gap: 12,
  },
  unreadBar: {
    position: 'absolute',
    start: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    gap: 4,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  textCenter: {
    textAlign: 'center',
  },
});
