import React, { useState } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/providers/theme-provider';
import { useAuthStore } from '@/stores/auth-store';
import { Text, Button, Input, Label } from '@/components/ui';
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from '@/lib/validations/settings';
import { apiFetch } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-error';
import type { User } from '@/lib/types';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    },
  });

  async function onSubmit(data: UpdateProfileInput) {
    setServerError('');
    setIsLoading(true);
    try {
      const response = await apiFetch('/auth/me', {
        method: 'PATCH',
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

      const result: User = await response.json();
      setUser(result);
      Alert.alert('', t('settings.profile.saved'));
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
        <Text variant="h3">{t('settings.profile.title')}</Text>
        <Text variant="bodySmall" color={theme.colors.mutedForeground}>
          {t('settings.profile.description')}
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
        {/* First Name */}
        <View style={{ gap: theme.spacing.xs }}>
          <Label>{t('settings.profile.firstName')}</Label>
          <Controller
            name="firstName"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.firstName}
                autoComplete="given-name"
                autoCapitalize="words"
                placeholder={t('auth.firstNamePlaceholder')}
                editable={!isLoading}
              />
            )}
          />
          {errors.firstName && (
            <Text variant="caption" color={theme.colors.destructive}>
              {errors.firstName.message}
            </Text>
          )}
        </View>

        {/* Last Name */}
        <View style={{ gap: theme.spacing.xs }}>
          <Label>{t('settings.profile.lastName')}</Label>
          <Controller
            name="lastName"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.lastName}
                autoComplete="family-name"
                autoCapitalize="words"
                placeholder={t('auth.lastNamePlaceholder')}
                editable={!isLoading}
              />
            )}
          />
          {errors.lastName && (
            <Text variant="caption" color={theme.colors.destructive}>
              {errors.lastName.message}
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
          {t('settings.profile.save')}
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
});
