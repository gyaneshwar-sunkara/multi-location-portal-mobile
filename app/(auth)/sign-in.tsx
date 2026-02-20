import React, { useState } from 'react';
import { View, Pressable, Platform, StyleSheet } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

import { useAppTheme } from '@/providers/theme-provider';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { BrandHeader } from '@/components/auth/BrandHeader';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { Text, Button, Input, Label } from '@/components/ui';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { apiPublicFetch } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-error';
import { completeAuth } from '@/lib/auth-helpers';
import { getPendingInvitationToken, clearPendingInvitationToken } from '@/lib/storage';
import { isTwoFactorChallenge, type LoginResponse } from '@/lib/types';

export default function SignInScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function handleSocialLoginResponse(response: Response) {
    if (!response.ok) {
      const error = await parseApiError(response, t('errorState.genericDescription'));
      setServerError(error);
      return;
    }

    const result: LoginResponse = await response.json();

    if (isTwoFactorChallenge(result)) {
      router.push({
        pathname: '/(auth)/verify-2fa',
        params: {
          challengeToken: result.challengeToken,
          methods: result.methods.join(','),
          expiresAt: result.expiresAt,
        },
      });
      return;
    }

    await completeAuth(result);

    // If there's a pending invitation, redirect to accept it instead of dashboard
    const pendingToken = await getPendingInvitationToken();
    if (pendingToken) {
      await clearPendingInvitationToken();
      router.replace({
        pathname: '/(auth)/accept-invitation',
        params: { token: pendingToken },
      });
      return;
    }

    router.replace('/(app)');
  }

  async function handleGoogleSignIn() {
    setServerError('');
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();
      const idToken = result.data?.idToken;
      if (!idToken) return;

      // Field name `idToken` matches api-nest GoogleLoginDto (auth.dto.ts)
      const response = await apiPublicFetch('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });
      await handleSocialLoginResponse(response);
    } catch (error: unknown) {
      // User cancelled — not an error
      if (error && typeof error === 'object' && 'code' in error && error.code === 'SIGN_IN_CANCELLED') return;
      setServerError(t('errorState.genericDescription'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAppleSignIn() {
    if (Platform.OS !== 'ios') return;
    setServerError('');
    setIsLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) return;

      // Field names `identityToken` + `user.firstName/lastName` match api-nest AppleLoginDto (auth.dto.ts)
      const response = await apiPublicFetch('/auth/apple', {
        method: 'POST',
        body: JSON.stringify({
          identityToken: credential.identityToken,
          user: {
            firstName: credential.fullName?.givenName ?? undefined,
            lastName: credential.fullName?.familyName ?? undefined,
          },
        }),
      });
      await handleSocialLoginResponse(response);
    } catch (error: unknown) {
      // User cancelled — not an error
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ERR_REQUEST_CANCELED') return;
      setServerError(t('errorState.genericDescription'));
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(data: LoginInput) {
    setServerError('');
    setIsLoading(true);
    try {
      const response = await apiPublicFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      await handleSocialLoginResponse(response);
    } catch {
      setServerError(t('errorState.genericDescription'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScreenLayout>
      <BrandHeader />

      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="h2">{t('auth.welcomeBack')}</Text>
        <Text variant="bodySmall" color={theme.colors.mutedForeground}>
          {t('auth.signInDescription')}
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
          <View style={styles.passwordHeader}>
            <Label>{t('auth.password')}</Label>
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable hitSlop={8}>
                <Text variant="bodySmall" color={theme.colors.primary}>
                  {t('auth.forgotPassword')}
                </Text>
              </Pressable>
            </Link>
          </View>
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
          size="lg"
          loading={isLoading}
          onPress={handleSubmit(onSubmit)}
          style={{ marginTop: theme.spacing.xs }}
        >
          {t('auth.signIn')}
        </Button>
      </View>

      {/* Social Login */}
      <View style={{ marginTop: theme.spacing.lg }}>
        <SocialLoginButtons
          disabled={isLoading}
          onGooglePress={handleGoogleSignIn}
          onApplePress={handleAppleSignIn}
        />
      </View>

      {/* Footer */}
      <View style={[styles.footer, { marginTop: theme.spacing.lg }]}>
        <Text variant="bodySmall" color={theme.colors.mutedForeground}>
          {t('auth.noAccount')}{' '}
        </Text>
        <Link href="/(auth)/register" asChild>
          <Pressable hitSlop={8}>
            <Text variant="bodySmall" color={theme.colors.primary}>
              {t('auth.createOne')}
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBanner: {
    padding: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
