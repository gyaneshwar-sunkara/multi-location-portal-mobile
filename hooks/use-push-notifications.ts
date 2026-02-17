import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { EventSubscription } from 'expo-modules-core';
import * as Device from 'expo-device';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { qk } from '@/lib/query-keys';

// Configure foreground notification display
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  const registerPushToken = useCallback(async () => {
    if (!Device.isDevice) return;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return;

    // Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    try {
      const deviceToken = await Notifications.getDevicePushTokenAsync();
      const platform = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';

      await apiFetch('/push-tokens', {
        method: 'POST',
        body: JSON.stringify({
          token: deviceToken.data,
          platform,
          deviceName: Device.deviceName ?? undefined,
        }),
      });
    } catch (error) {
      console.warn('Push token registration error:', error);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    registerPushToken();

    // Foreground: invalidate caches so badge + list update
    notificationListener.current = Notifications.addNotificationReceivedListener(
      () => {
        queryClient.invalidateQueries({ queryKey: qk.notificationsUnread });
        queryClient.invalidateQueries({ queryKey: qk.notifications });
      },
    );

    // Tap: navigate to notifications tab
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      () => {
        queryClient.invalidateQueries({ queryKey: qk.notifications });
        queryClient.invalidateQueries({ queryKey: qk.notificationsUnread });
        router.push('/(app)/(tabs)/notifications');
      },
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated, registerPushToken, queryClient, router]);
}
