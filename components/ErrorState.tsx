import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/providers/theme-provider';
import { Text, Button } from '@/components/ui';

interface ErrorStateProps {
  /** Custom error message. Falls back to generic error description. */
  message?: string;
  /** Retry callback — renders a retry button when provided. */
  onRetry?: () => void;
}

/**
 * Reusable error state component with an icon, message, and optional retry button.
 * Use in screens that have `isError` from TanStack Query.
 */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background, padding: theme.spacing.lg },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: theme.colors.destructive + '15' },
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={32}
          color={theme.colors.destructive}
        />
      </View>
      <Text variant="h3" style={styles.textCenter}>
        {t('errorState.genericTitle')}
      </Text>
      <Text
        variant="bodySmall"
        color={theme.colors.mutedForeground}
        style={styles.textCenter}
      >
        {message ?? t('errorState.genericDescription')}
      </Text>
      {onRetry && (
        <Button
          variant="outline"
          size="lg"
          onPress={onRetry}
          style={styles.button}
        >
          {t('common.tryAgain')}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
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
  button: {
    marginTop: 8,
    alignSelf: 'stretch',
  },
});
