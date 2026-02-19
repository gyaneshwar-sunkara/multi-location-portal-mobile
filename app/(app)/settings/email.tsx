import React, { useState } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/providers/theme-provider';
import { useAuthStore } from '@/stores/auth-store';
import { Text, Button, Input, Label } from '@/components/ui';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { changeEmailSchema, type ChangeEmailInput } from '@/lib/validations/settings';
import { apiFetch, apiPublicFetch } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-error';

export default function EmailSettingsScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangeEmailInput>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: '', password: '' },
  });

  async function handleResendVerification() {
    if (!user?.email) return;
    setIsResending(true);
    try {
      const response = await apiPublicFetch('/auth/email/resend', {
        method: 'POST',
        body: JSON.stringify({ email: user.email }),
      });

      if (!response.ok) {
        const error = await parseApiError(response, t('errorState.genericDescription'));
        Alert.alert('', error);
        return;
      }

      Alert.alert('', t('settings.email.resent'));
    } catch {
      Alert.alert('', t('errorState.genericDescription'));
    } finally {
      setIsResending(false);
    }
  }

  async function onSubmit(data: ChangeEmailInput) {
    setServerError('');
    setIsLoading(true);
    try {
      const response = await apiFetch('/auth/me/change-email', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await parseApiError(response, t('errorState.genericDescription'));
        setServerError(error);
        return;
      }

      reset();
      Alert.alert('', t('settings.changeEmail.sent'));
    } catch {
      setServerError(t('errorState.genericDescription'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[
        styles.container,
        { padding: theme.spacing.lg, gap: theme.spacing.xl },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Current Email Section */}
      <View style={{ gap: theme.spacing.sm }}>
        <View style={{ gap: theme.spacing.xs }}>
          <Text variant="h3">{t('settings.email.title')}</Text>
          <Text variant="bodySmall" color={theme.colors.mutedForeground}>
            {t('settings.email.description')}
          </Text>
        </View>

        <View
          style={[
            styles.emailCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.lg,
              padding: theme.spacing.md,
              gap: theme.spacing.sm,
            },
          ]}
        >
          <View style={styles.emailRow}>
            <Text variant="body" numberOfLines={1} style={styles.emailText}>
              {user?.email}
            </Text>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: user?.isEmailVerified
                    ? theme.colors.primary + '15'
                    : theme.colors.muted,
                  borderRadius: theme.radii.full,
                },
              ]}
            >
              <Ionicons
                name={user?.isEmailVerified ? 'checkmark-circle' : 'alert-circle'}
                size={14}
                color={
                  user?.isEmailVerified
                    ? theme.colors.primary
                    : theme.colors.mutedForeground
                }
              />
              <Text
                variant="caption"
                color={
                  user?.isEmailVerified
                    ? theme.colors.primary
                    : theme.colors.mutedForeground
                }
              >
                {user?.isEmailVerified
                  ? t('settings.email.verified')
                  : t('settings.email.unverified')}
              </Text>
            </View>
          </View>

          {!user?.isEmailVerified && (
            <Button
              variant="outline"
              size="sm"
              loading={isResending}
              onPress={handleResendVerification}
            >
              {t('settings.email.resend')}
            </Button>
          )}
        </View>
      </View>

      {/* Change Email Section */}
      <View style={{ gap: theme.spacing.sm }}>
        <View style={{ gap: theme.spacing.xs }}>
          <Text variant="h3">{t('settings.changeEmail.title')}</Text>
          <Text variant="bodySmall" color={theme.colors.mutedForeground}>
            {t('settings.changeEmail.description')}
          </Text>
        </View>

        {serverError !== '' && (
          <View
            style={[
              styles.errorBanner,
              {
                backgroundColor: theme.colors.destructive + '15',
                borderRadius: theme.radii.md,
              },
            ]}
          >
            <Text variant="bodySmall" color={theme.colors.destructive}>
              {serverError}
            </Text>
          </View>
        )}

        <View style={{ gap: theme.spacing.md }}>
          {/* New Email */}
          <View style={{ gap: theme.spacing.xs }}>
            <Label>{t('settings.changeEmail.newEmail')}</Label>
            <Controller
              name="newEmail"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.newEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  placeholder={t('settings.changeEmail.newEmailPlaceholder')}
                  editable={!isLoading}
                />
              )}
            />
            {errors.newEmail && (
              <Text variant="caption" color={theme.colors.destructive}>
                {errors.newEmail.message}
              </Text>
            )}
          </View>

          {/* Password */}
          <View style={{ gap: theme.spacing.xs }}>
            <Label>{t('settings.changeEmail.password')}</Label>
            <Controller
              name="password"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <PasswordInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.password}
                  autoComplete="current-password"
                  placeholder={t('settings.changeEmail.passwordPlaceholder')}
                  editable={!isLoading}
                />
              )}
            />
            {errors.password && (
              <Text variant="caption" color={theme.colors.destructive}>
                {errors.password.message}
              </Text>
            )}
          </View>

          {/* Submit */}
          <Button
            size="lg"
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
            style={{ marginTop: theme.spacing.sm }}
          >
            {t('settings.changeEmail.submit')}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  emailCard: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  emailText: {
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  errorBanner: {
    padding: 12,
  },
});
