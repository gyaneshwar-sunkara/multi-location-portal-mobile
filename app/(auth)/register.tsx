import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/providers/theme-provider';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Text, Button, Input, Label } from '@/components/ui';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { apiPublicFetch } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-error';
import { completeAuth } from '@/lib/auth-helpers';
import type { AuthResponse } from '@/lib/types';

const PASSWORD_REQUIREMENTS = [
  { key: 'length', regex: /.{8,}/ },
  { key: 'uppercase', regex: /[A-Z]/ },
  { key: 'lowercase', regex: /[a-z]/ },
  { key: 'number', regex: /[0-9]/ },
] as const;

export default function RegisterScreen() {
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
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      terms: false as unknown as true,
    },
  });

  const password = watch('password', '');

  async function onSubmit(data: RegisterInput) {
    setServerError('');
    setIsLoading(true);
    try {
      const { terms: _terms, ...registerData } = data;
      const response = await apiPublicFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const error = await parseApiError(
          response,
          t('errorState.genericDescription'),
        );
        setServerError(error);
        return;
      }

      const result: AuthResponse = await response.json();
      await completeAuth(result);
      router.replace('/(app)');
    } catch {
      setServerError(t('errorState.genericDescription'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScreenLayout>
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="h2">{t('auth.createAccount')}</Text>
        <Text variant="bodySmall" color={theme.colors.mutedForeground}>
          {t('auth.signUpDescription')}
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
        {/* First Name */}
        <View style={{ gap: theme.spacing.xs }}>
          <Label>{t('auth.firstName')}</Label>
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
          <Label>{t('auth.lastName')}</Label>
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

        {/* Email */}
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

        {/* Password */}
        <View style={{ gap: theme.spacing.xs }}>
          <Label>{t('auth.password')}</Label>
          <Controller
            name="password"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.password}
                autoComplete="new-password"
                placeholder={t('auth.createPasswordPlaceholder')}
                editable={!isLoading}
              />
            )}
          />
          {errors.password && (
            <Text variant="caption" color={theme.colors.destructive}>
              {errors.password.message}
            </Text>
          )}

          {/* Password Requirements */}
          {password.length > 0 && (
            <View style={[styles.requirements, { gap: theme.spacing.xs }]}>
              {PASSWORD_REQUIREMENTS.map((req) => {
                const met = req.regex.test(password);
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

        {/* Terms */}
        <Controller
          name="terms"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Pressable
              onPress={() => onChange(!value)}
              style={[styles.termsRow, { gap: theme.spacing.sm }]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: !!value }}
              disabled={isLoading}
            >
              <Ionicons
                name={value ? 'checkbox' : 'square-outline'}
                size={22}
                color={
                  value ? theme.colors.primary : theme.colors.mutedForeground
                }
              />
              <Text
                variant="bodySmall"
                color={
                  errors.terms
                    ? theme.colors.destructive
                    : theme.colors.mutedForeground
                }
                style={styles.termsText}
              >
                {t('auth.termsAgreement', {
                  terms: t('auth.termsOfService'),
                  privacy: t('auth.privacyPolicy'),
                })}
              </Text>
            </Pressable>
          )}
        />

        {/* Submit */}
        <Button
          size="lg"
          loading={isLoading}
          onPress={handleSubmit(onSubmit)}
          style={{ marginTop: theme.spacing.xs }}
        >
          {t('auth.signUp')}
        </Button>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { marginTop: theme.spacing.lg }]}>
        <Text variant="bodySmall" color={theme.colors.mutedForeground}>
          {t('auth.haveAccount')}{' '}
        </Text>
        <Link href="/(auth)/sign-in" asChild>
          <Pressable hitSlop={8}>
            <Text variant="bodySmall" color={theme.colors.primary}>
              {t('auth.signIn')}
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 44,
  },
  termsText: {
    flex: 1,
    paddingTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
