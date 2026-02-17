import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';

import { useAppTheme } from '@/providers/theme-provider';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Text, Button } from '@/components/ui';
import { apiPublicFetch } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-error';

const PASSWORD_REQUIREMENTS = [
  { key: 'length', regex: /.{8,}/ },
  { key: 'uppercase', regex: /[A-Z]/ },
  { key: 'lowercase', regex: /[a-z]/ },
  { key: 'number', regex: /[0-9]/ },
] as const;

const resetFormSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

type ResetFormInput = z.infer<typeof resetFormSchema>;

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();

  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormInput>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: { password: '' },
  });

  const password = watch('password', '');

  async function onSubmit(data: ResetFormInput) {
    setServerError('');
    setIsLoading(true);
    try {
      const response = await apiPublicFetch('/auth/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({ token, password: data.password }),
      });

      if (!response.ok) {
        const error = await parseApiError(response);
        setServerError(error);
        return;
      }

      setIsReset(true);
    } catch {
      setServerError(t('errorState.genericDescription'));
    } finally {
      setIsLoading(false);
    }
  }

  // No token — invalid link
  if (!token) {
    return (
      <AuthScreenLayout>
        <View style={[styles.centered, { gap: theme.spacing.md }]}>
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
            {t('auth.invalidResetToken')}
          </Text>
          <Link href="/(auth)/forgot-password" asChild>
            <Pressable style={styles.link} hitSlop={8}>
              <Text variant="bodySmall" color={theme.colors.primary}>
                {t('auth.requestNewLink')}
              </Text>
            </Pressable>
          </Link>
        </View>
      </AuthScreenLayout>
    );
  }

  // Success state
  if (isReset) {
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
              name="checkmark-circle-outline"
              size={32}
              color={theme.colors.primary}
            />
          </View>
          <Text variant="h3" style={styles.textCenter}>
            {t('auth.passwordResetSuccess')}
          </Text>
          <Text
            variant="bodySmall"
            color={theme.colors.mutedForeground}
            style={styles.textCenter}
          >
            {t('auth.signInWithNewPassword')}
          </Text>
          <Button
            size="lg"
            onPress={() => router.replace('/(auth)/sign-in')}
            style={{ marginTop: theme.spacing.sm, alignSelf: 'stretch' }}
          >
            {t('auth.goToSignIn')}
          </Button>
        </View>
      </AuthScreenLayout>
    );
  }

  // Form state
  return (
    <AuthScreenLayout>
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="h2">{t('auth.resetPasswordTitle')}</Text>
        <Text variant="bodySmall" color={theme.colors.mutedForeground}>
          {t('auth.resetPasswordDescription')}
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
                placeholder={t('auth.newPasswordPlaceholder')}
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

        <Button size="lg" loading={isLoading} onPress={handleSubmit(onSubmit)}>
          {t('auth.resetPassword')}
        </Button>
      </View>

      <Link href="/(auth)/sign-in" asChild>
        <Pressable
          style={[styles.backLink, { marginTop: theme.spacing.lg }]}
          hitSlop={8}
        >
          <Ionicons
            name="arrow-back"
            size={16}
            color={theme.colors.primary}
          />
          <Text variant="bodySmall" color={theme.colors.primary}>
            {t('auth.backToSignIn')}
          </Text>
        </Pressable>
      </Link>
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
  requirements: {
    marginTop: 4,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  link: {
    minHeight: 44,
    justifyContent: 'center',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
  },
});
