import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAppTheme } from '@/providers/theme-provider';
import { useAuth } from '@/providers/auth-provider';
import { useAuthStore } from '@/stores/auth-store';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import type { User } from '@/lib/types';
import { Text, Button, Input, Label } from '@/components/ui';
import { apiPublicFetch } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-error';
import { resendVerificationSchema, type ResendVerificationInput } from '@/lib/validations/auth';

type ScreenState = 'verifying' | 'success' | 'error' | 'no-token';

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { isAuthenticated } = useAuth();
  const user = useAuthStore((s) => s.user);

  const [state, setState] = useState<ScreenState>(token ? 'verifying' : 'no-token');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const hasVerified = useRef(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendVerificationInput>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: { email: user?.email ?? '' },
  });

  useEffect(() => {
    if (!token || hasVerified.current) return;
    hasVerified.current = true;

    async function verify() {
      try {
        const response = await apiPublicFetch('/auth/email/verify', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const error = await parseApiError(response, t('auth.emailVerificationFailed'));
          setErrorMessage(error);
          setState('error');
          return;
        }

        // Update local user state if authenticated (read store directly to avoid reactive deps)
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setUser({ ...currentUser, isEmailVerified: true } as User);
        }

        setState('success');
      } catch {
        setErrorMessage(t('errorState.genericDescription'));
        setState('error');
      }
    }

    verify();
  }, [token, t]);

  async function handleResend(data: ResendVerificationInput) {
    setIsResending(true);
    try {
      const response = await apiPublicFetch('/auth/email/resend', {
        method: 'POST',
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        const error = await parseApiError(response, t('errorState.genericDescription'));
        setErrorMessage(error);
        return;
      }

      setErrorMessage(t('auth.verificationResent'));
    } catch {
      setErrorMessage(t('errorState.genericDescription'));
    } finally {
      setIsResending(false);
    }
  }

  // No token
  if (state === 'no-token') {
    return (
      <AuthScreenLayout>
        <View style={[styles.centered, { gap: theme.spacing.md }]}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.destructive + '15' }]}>
            <Ionicons name="alert-circle-outline" size={32} color={theme.colors.destructive} />
          </View>
          <Text variant="h3" style={styles.textCenter}>
            {t('auth.invalidVerificationLink')}
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

  // Verifying
  if (state === 'verifying') {
    return (
      <AuthScreenLayout>
        <View style={[styles.centered, { gap: theme.spacing.md }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="body" color={theme.colors.mutedForeground}>
            {t('auth.verifyingEmail')}
          </Text>
        </View>
      </AuthScreenLayout>
    );
  }

  // Success
  if (state === 'success') {
    return (
      <AuthScreenLayout>
        <View style={[styles.centered, { gap: theme.spacing.md }]}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '15' }]}>
            <Ionicons name="checkmark-circle-outline" size={32} color={theme.colors.primary} />
          </View>
          <Text variant="h3" style={styles.textCenter}>
            {t('auth.emailVerified')}
          </Text>
          <Text
            variant="bodySmall"
            color={theme.colors.mutedForeground}
            style={styles.textCenter}
          >
            {t('auth.emailVerifiedDescription')}
          </Text>
          <Button
            size="lg"
            onPress={() =>
              router.replace(isAuthenticated ? '/(app)/(tabs)/dashboard' : '/(auth)/sign-in')
            }
            style={{ marginTop: theme.spacing.sm, alignSelf: 'stretch' }}
          >
            {isAuthenticated ? t('auth.goToDashboard') : t('auth.goToSignIn')}
          </Button>
        </View>
      </AuthScreenLayout>
    );
  }

  // Error — with resend option
  return (
    <AuthScreenLayout>
      <View style={[styles.centered, { gap: theme.spacing.md }]}>
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.destructive + '15' }]}>
          <Ionicons name="alert-circle-outline" size={32} color={theme.colors.destructive} />
        </View>
        <Text variant="h3" style={styles.textCenter}>
          {t('auth.emailVerificationFailed')}
        </Text>
        <Text
          variant="bodySmall"
          color={theme.colors.mutedForeground}
          style={styles.textCenter}
        >
          {errorMessage}
        </Text>
      </View>

      <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.xl }}>
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
                editable={!isResending}
              />
            )}
          />
          {errors.email && (
            <Text variant="caption" color={theme.colors.destructive}>
              {errors.email.message}
            </Text>
          )}
        </View>

        <Button
          variant="outline"
          size="lg"
          loading={isResending}
          onPress={handleSubmit(handleResend)}
        >
          {t('auth.resendVerificationEmail')}
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onPress={() => router.replace('/(auth)/sign-in')}
        >
          {t('auth.goToSignIn')}
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
});
