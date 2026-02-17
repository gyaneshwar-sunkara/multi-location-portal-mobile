import React, { useState } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/providers/theme-provider';
import { useAuthStore } from '@/stores/auth-store';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Text, Button, Label } from '@/components/ui';
import {
  deleteAccountSchema,
  type DeleteAccountInput,
} from '@/lib/validations/settings';
import { apiFetch } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-error';

export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { password: '' },
  });

  function onSubmit(data: DeleteAccountInput) {
    Alert.alert(
      t('settings.danger.deleteTitle'),
      t('settings.danger.deleteDescription'),
      [
        { text: t('settings.danger.cancel'), style: 'cancel' },
        {
          text: t('settings.danger.confirm'),
          style: 'destructive',
          onPress: () => performDelete(data),
        },
      ],
    );
  }

  async function performDelete(data: DeleteAccountInput) {
    setServerError('');
    setIsLoading(true);
    try {
      const response = await apiFetch('/auth/me', {
        method: 'DELETE',
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

      await logout();
      router.replace('/(auth)/sign-in');
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
      {/* Warning Banner */}
      <View
        style={[
          styles.warningBanner,
          {
            backgroundColor: theme.colors.destructive + '15',
            borderRadius: theme.radii.lg,
            padding: theme.spacing.md,
            gap: theme.spacing.sm,
          },
        ]}
      >
        <View style={styles.warningHeader}>
          <Ionicons
            name="warning-outline"
            size={20}
            color={theme.colors.destructive}
          />
          <Text variant="body" color={theme.colors.destructive} style={{ fontWeight: '600' }}>
            {t('settings.danger.title')}
          </Text>
        </View>
        <Text variant="bodySmall" color={theme.colors.destructive}>
          {t('settings.danger.description')}
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
        {/* Password Confirmation */}
        <View style={{ gap: theme.spacing.xs }}>
          <Label>{t('settings.danger.confirmPassword')}</Label>
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
                placeholder={t('auth.passwordPlaceholder')}
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
          variant="destructive"
          size="lg"
          loading={isLoading}
          onPress={handleSubmit(onSubmit)}
          style={{ marginTop: theme.spacing.sm }}
        >
          {t('settings.danger.deleteAccount')}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  warningBanner: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorBanner: {
    padding: 12,
  },
});
