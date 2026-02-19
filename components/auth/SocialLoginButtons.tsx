import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/providers/theme-provider';
import { Text, Button } from '@/components/ui';

interface SocialLoginButtonsProps {
  disabled?: boolean;
  onGooglePress: () => void;
  onApplePress: () => void;
}

export function SocialLoginButtons({
  disabled,
  onGooglePress,
  onApplePress,
}: SocialLoginButtonsProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  return (
    <View style={{ gap: theme.spacing.lg }}>
      {/* Divider */}
      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
        <Text variant="caption" color={theme.colors.mutedForeground} style={styles.dividerText}>
          {t('auth.orContinueWith')}
        </Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
      </View>

      {/* Buttons */}
      <View style={{ gap: theme.spacing.sm }}>
        <Button variant="outline" size="lg" disabled={disabled} onPress={onGooglePress}>
          <Ionicons name="logo-google" size={18} color={theme.colors.foreground} />
          <Text variant="label" style={{ color: theme.colors.foreground }}>
            {t('auth.continueWithGoogle')}
          </Text>
        </Button>

        {Platform.OS === 'ios' && (
          <Button variant="outline" size="lg" disabled={disabled} onPress={onApplePress}>
            <Ionicons name="logo-apple" size={20} color={theme.colors.foreground} />
            <Text variant="label" style={{ color: theme.colors.foreground }}>
              {t('auth.continueWithApple')}
            </Text>
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
