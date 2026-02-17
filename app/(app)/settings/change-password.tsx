import React, { useState } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/providers/theme-provider';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Text, Button, Label } from '@/components/ui';
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from '@/lib/validations/settings';
import { apiFetch } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-error';
import { PASSWORD_REQUIREMENTS } from '@/lib/validations/auth';

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  const newPassword = watch('newPassword', '');

  async function onSubmit(data: ChangePasswordInput) {
    setServerError('');
    setIsLoading(true);
    try {
      const response = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await parseApiError(
          response,
          t('errorState.genericDescription'),
        );
        setServerError(error);
        return;
      }

      Alert.alert('', t('settings.password.changed'));
      router.back();
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
        { padding: theme.spacing.lg, gap: theme.spacing.lg },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ gap: theme.spacing.xs }}>
        <Text variant="h3">{t('settings.password.title')}</Text>
        <Text variant="bodySmall" color={theme.colors.mutedForeground}>
          {t('settings.password.description')}
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
        {/* Current Password */}
        <View style={{ gap: theme.spacing.xs }}>
          <Label>{t('settings.password.currentPassword')}</Label>
          <Controller
            name="currentPassword"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.currentPassword}
                autoComplete="current-password"
                placeholder={t('auth.passwordPlaceholder')}
                editable={!isLoading}
              />
            )}
          />
          {errors.currentPassword && (
            <Text variant="caption" color={theme.colors.destructive}>
              {errors.currentPassword.message}
            </Text>
          )}
        </View>

        {/* New Password */}
        <View style={{ gap: theme.spacing.xs }}>
          <Label>{t('settings.password.newPassword')}</Label>
          <Controller
            name="newPassword"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.newPassword}
                autoComplete="new-password"
                placeholder={t('auth.newPasswordPlaceholder')}
                editable={!isLoading}
              />
            )}
          />
          {errors.newPassword && (
            <Text variant="caption" color={theme.colors.destructive}>
              {errors.newPassword.message}
            </Text>
          )}

          {/* Password Requirements */}
          {newPassword.length > 0 && (
            <View style={[styles.requirements, { gap: theme.spacing.xs }]}>
              {PASSWORD_REQUIREMENTS.map((req) => {
                const met = req.regex.test(newPassword);
                return (
                  <View key={req.key} style={styles.requirementRow}>
                    <Ionicons
                      name={met ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14}
                      color={
                        met
                          ? theme.colors.primary
                          : theme.colors.mutedForeground
                      }
                    />
                    <Text
                      variant="caption"
                      color={
                        met
                          ? theme.colors.foreground
                          : theme.colors.mutedForeground
                      }
                    >
                      {t(`auth.passwordRequirements.${req.key}`)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Submit */}
        <Button
          size="lg"
          loading={isLoading}
          onPress={handleSubmit(onSubmit)}
          style={{ marginTop: theme.spacing.sm }}
        >
          {t('settings.password.change')}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  errorBanner: {
    padding: 12,
  },
  requirements: {
    marginTop: 4,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
