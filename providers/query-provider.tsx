import React, { useEffect, useRef } from 'react';
import { Alert, AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {
  focusManager,
  onlineManager,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes
const MAX_RETRY_DELAY_MS = 10_000;

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) return true;
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return ['network', 'fetch', 'timeout', 'abort', 'econnrefused'].some((kw) =>
      msg.includes(kw),
    );
  }
  return false;
}

function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof Error && 'status' in error) {
    return (error as { status: number }).status;
  }
  return undefined;
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        const status = getErrorStatus(error);

        // Don't alert 401s — auth store handles logout
        if (status === 401) return;

        // Don't alert network errors — onlineManager handles those
        if (isNetworkError(error)) return;

        // Show alert for other errors (already localized by API)
        const message =
          error instanceof Error ? error.message : 'An unexpected error occurred';
        Alert.alert('Error', message);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        retry: (failureCount, error) => {
          const status = getErrorStatus(error);

          // Don't retry auth errors
          if (status === 401) return false;

          // Network errors: retry up to 3 times with backoff
          if (isNetworkError(error)) return failureCount < 3;

          // Other errors: retry once
          return failureCount < 1;
        },
        retryDelay: (attemptIndex) =>
          Math.min(1000 * 2 ** attemptIndex, MAX_RETRY_DELAY_MS),
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClientRef = useRef(makeQueryClient());

  // Wire focusManager to AppState (mobile equivalent of window focus)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (status: AppStateStatus) => {
        focusManager.setFocused(status === 'active');
      },
    );
    return () => subscription.remove();
  }, []);

  // Wire onlineManager to NetInfo (mobile equivalent of navigator.onLine)
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      onlineManager.setOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClientRef.current}>
      {children}
    </QueryClientProvider>
  );
}
