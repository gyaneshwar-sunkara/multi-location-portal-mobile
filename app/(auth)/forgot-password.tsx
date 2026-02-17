import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/providers/theme-provider';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { BrandHeader } from '@/components/auth/BrandHeader';
import { Text, Button, Input, Label } from '@/components/ui';
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '@/lib/validations/auth';
import { apiPublicFetch } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-error';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setServerError('');
    setIsLoading(true);
    try {
      const response = await apiPublicFetch('/auth/password-reset/request', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await parseApiError(response, t('errorState.genericDescription'));
        setServerError(error);
        return;
      }

      setEmailSent(true);
    } catch {
      setServerError(t('errorState.genericDescription'));
    } finally {
      setIsLoading(false);
    }
  }

  if (emailSent) {
    return (
      <AuthScreenLayout>
        <View style={[styles.centered, { gap: theme.spacing.md }]}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: theme.colors.primary + '15' },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={32}
              color={theme.colors.primary}
            />
          </View>
          <Text variant="h3" style={styles.textCenter}>
            {t('auth.checkYourEmail')}
          </Text>
          <Text
            variant="bodySmall"
            color={theme.colors.mutedForeground}
            style={styles.textCenter}
          >
            {t('auth.resetLinkSent')}
          </Text>
          <Text variant="body" style={styles.textCenter}>
            {getValues('email')}
          </Text>
          <Text
            variant="caption"
            color={theme.colors.mutedForeground}
            style={styles.textCenter}
          >
            {t('auth.checkSpamFolder')}
          </Text>

          <Button
            variant="outline"
            size="lg"
            onPress={() => router.replace('/(auth)/sign-in')}
            style={{ marginTop: theme.spacing.sm, alignSelf: 'stretch' }}
          >
            {t('auth.backToSignIn')}
          </Button>
        </View>
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout>
      <BrandHeader />

      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="h2">{t('auth.forgotPasswordTitle')}</Text>
        <Text variant="bodySmall" color={theme.colors.mutedForeground}>
          {t('auth.forgotPasswordDescription')}
        </Text>
      </View>

      {serverError !== '' && (
        <View
          style={[
            styles.errorBanner,
            {
              backgroundColor: theme.colors.destructive + '15',
              borderRadius: theme.radii.md,
              marginTop: theme.spacing.md,
            },
          ]}
        >
          <Text variant="bodySmall" color={theme.colors.destructive}>
            {serverError}
          </Text>
        </View>
      )}

      <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
        <View style={{ gap: theme.spacing.xs }}>
          <Label>{t('auth.emailAddress')}</Label>
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                placeholder={t('auth.emailPlaceholder')}
                editable={!isLoading}
              />
            )}
          />
          {errors.email && (
            <Text variant="caption" color={theme.colors.destructive}>
              {errors.email.message}
            </Text>
          )}
        </View>

        <Button size="lg" loading={isLoading} onPress={handleSubmit(onSubmit)}>
          {t('auth.sendResetLink')}
        </Button>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCenter: {
    textAlign: 'center',
  },
  errorBanner: {
    padding: 12,
  },
});
