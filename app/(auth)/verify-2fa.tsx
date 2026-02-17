import React, { useState, useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/providers/theme-provider';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { Text, Button, Input, Label } from '@/components/ui';
import { useCountdown } from '@/hooks/use-countdown';
import {
  completeAuth,
  send2faOtp,
  verify2faCode,
  verifyRecoveryCode,
} from '@/lib/auth-helpers';

type TwoFactorMethod = 'totp' | 'email' | 'sms';
type TabMode = 'code' | 'recovery';

const OTP_RESEND_COOLDOWN_S = 60;

const METHOD_ICONS: Record<TwoFactorMethod, keyof typeof Ionicons.glyphMap> = {
  totp: 'phone-portrait-outline',
  email: 'mail-outline',
  sms: 'chatbox-outline',
};

function getDefaultMethod(methods: TwoFactorMethod[]): TwoFactorMethod {
  if (methods.includes('totp')) return 'totp';
  return methods[0] ?? 'totp';
}

function padZero(n: number): string {
  return n.toString().padStart(2, '0');
}

export default function Verify2faScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();

  const {
    challengeToken,
    methods: methodsParam,
    expiresAt,
  } = useLocalSearchParams<{
    challengeToken?: string;
    methods?: string;
    expiresAt?: string;
  }>();

  const methods = (methodsParam?.split(',').filter(Boolean) ?? []) as TwoFactorMethod[];

  const [selectedMethod, setSelectedMethod] = useState<TwoFactorMethod>(() =>
    getDefaultMethod(methods),
  );
  const [activeTab, setActiveTab] = useState<TabMode>('code');
  const [code, setCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);
  const [serverError, setServerError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const challengeTimer = useCountdown(
    expiresAt
      ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      : 0,
  );

  const resendTimer = useCountdown(0, { autoStart: false });

  const needsOtpSend = selectedMethod === 'email' || selectedMethod === 'sms';

  // Redirect if no challenge token
  useEffect(() => {
    if (!challengeToken) {
      router.replace('/(auth)/sign-in');
    }
  }, [challengeToken, router]);

  function getMethodDescription(): string {
    switch (selectedMethod) {
      case 'totp':
        return t('auth.totpDescription');
      case 'email':
        return t('auth.emailOtpDescription');
      case 'sms':
        return t('auth.smsOtpDescription');
    }
  }

  function getMethodLabel(method: TwoFactorMethod): string {
    switch (method) {
      case 'totp':
        return t('auth.methodTotp');
      case 'email':
        return t('auth.methodEmail');
      case 'sms':
        return t('auth.methodSms');
    }
  }

  function handleMethodChange(method: TwoFactorMethod) {
    setSelectedMethod(method);
    setCode('');
    setServerError('');
    setOtpSent(false);
    resendTimer.restart(0);
  }

  async function handleSendOtp() {
    if (!challengeToken) return;
    setServerError('');
    setIsSending(true);
    const result = await send2faOtp(
      selectedMethod as 'email' | 'sms',
      challengeToken,
    );
    setIsSending(false);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    setOtpSent(true);
    resendTimer.restart(OTP_RESEND_COOLDOWN_S);
  }

  async function handleVerifyCode() {
    if (code.length !== 6 || !challengeToken) return;
    setServerError('');
    setIsVerifying(true);
    const result = await verify2faCode(selectedMethod, {
      challengeToken,
      code,
      trustDevice,
    });
    setIsVerifying(false);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    await completeAuth(result.auth!);
    router.replace('/(app)');
  }

  async function handleVerifyRecovery() {
    if (!recoveryCode.trim() || !challengeToken) return;
    setServerError('');
    setIsVerifying(true);
    const result = await verifyRecoveryCode({
      challengeToken,
      code: recoveryCode.trim(),
    });
    setIsVerifying(false);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    await completeAuth(result.auth!);
    router.replace('/(app)');
  }

  if (!challengeToken) return null;

  // Challenge expired
  if (challengeTimer.isExpired) {
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
              name="shield-outline"
              size={32}
              color={theme.colors.destructive}
            />
          </View>
          <Text variant="h3" style={styles.textCenter}>
            {t('auth.challengeExpired')}
          </Text>
          <Button
            size="lg"
            onPress={() => router.replace('/(auth)/sign-in')}
            style={{ alignSelf: 'stretch' }}
          >
            {t('auth.backToSignIn')}
          </Button>
        </View>
      </AuthScreenLayout>
    );
  }

  const minutes = padZero(Math.floor(challengeTimer.timeLeft / 60));
  const seconds = padZero(challengeTimer.timeLeft % 60);

  return (
    <AuthScreenLayout>
      {/* Header */}
      <View style={[styles.centered, { gap: theme.spacing.sm }]}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: theme.colors.primary + '15' },
          ]}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={32}
            color={theme.colors.primary}
          />
        </View>
        <Text variant="h2" style={styles.textCenter}>
          {t('auth.twoFactorTitle')}
        </Text>
        <Text
          variant="bodySmall"
          color={theme.colors.mutedForeground}
          style={styles.textCenter}
        >
          {getMethodDescription()}
        </Text>
        <Text
          variant="caption"
          color={
            challengeTimer.timeLeft <= 60
              ? theme.colors.destructive
              : theme.colors.mutedForeground
          }
        >
          {t('auth.challengeExpiresIn', { minutes, seconds })}
        </Text>
      </View>

      {/* Error */}
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

      {/* Method selector */}
      {methods.length > 1 && activeTab === 'code' && (
        <View style={[styles.methodRow, { gap: theme.spacing.sm, marginTop: theme.spacing.lg }]}>
          {methods.map((method) => (
            <Button
              key={method}
              variant={selectedMethod === method ? 'default' : 'outline'}
              size="sm"
              onPress={() => handleMethodChange(method)}
              style={styles.methodButton}
            >
              {getMethodLabel(method)}
            </Button>
          ))}
        </View>
      )}

      {/* Tab switcher */}
      <View
        style={[
          styles.tabBar,
          {
            borderBottomColor: theme.colors.border,
            marginTop: theme.spacing.lg,
          },
        ]}
      >
        <Pressable
          onPress={() => {
            setActiveTab('code');
            setServerError('');
          }}
          style={[
            styles.tab,
            activeTab === 'code' && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 2,
            },
          ]}
        >
          <Text
            variant="bodySmall"
            color={
              activeTab === 'code'
                ? theme.colors.foreground
                : theme.colors.mutedForeground
            }
          >
            {t('auth.useVerificationCode')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setActiveTab('recovery');
            setServerError('');
          }}
          style={[
            styles.tab,
            activeTab === 'recovery' && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 2,
            },
          ]}
        >
          <Text
            variant="bodySmall"
            color={
              activeTab === 'recovery'
                ? theme.colors.foreground
                : theme.colors.mutedForeground
            }
          >
            {t('auth.useRecoveryCode')}
          </Text>
        </Pressable>
      </View>

      {/* Code tab */}
      {activeTab === 'code' && (
        <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
          {/* Send OTP button for email/sms */}
          {needsOtpSend && !otpSent && (
            <Button size="lg" loading={isSending} onPress={handleSendOtp}>
              {t('auth.sendCode')}
            </Button>
          )}

          {/* OTP input (always for TOTP, after send for email/sms) */}
          {(!needsOtpSend || otpSent) && (
            <>
              <View style={{ gap: theme.spacing.xs }}>
                <Label>{t('auth.verificationCode')}</Label>
                <Input
                  value={code}
                  onChangeText={(text) => setCode(text.replace(/\D/g, ''))}
                  keyboardType="number-pad"
                  maxLength={6}
                  textAlign="center"
                  autoComplete="one-time-code"
                  placeholder={t('auth.enterCode')}
                  style={styles.codeInput}
                />
              </View>

              {/* Trust device */}
              <Pressable
                onPress={() => setTrustDevice(!trustDevice)}
                style={[styles.checkboxRow, { gap: theme.spacing.sm }]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: trustDevice }}
              >
                <Ionicons
                  name={trustDevice ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={
                    trustDevice
                      ? theme.colors.primary
                      : theme.colors.mutedForeground
                  }
                />
                <Text variant="bodySmall" color={theme.colors.mutedForeground}>
                  {t('auth.trustDevice')}
                </Text>
              </Pressable>

              <Button
                size="lg"
                loading={isVerifying}
                disabled={code.length !== 6}
                onPress={handleVerifyCode}
              >
                {t('auth.verifyCode')}
              </Button>

              {/* Resend button */}
              {needsOtpSend && (
                <Button
                  variant="ghost"
                  disabled={!resendTimer.isExpired || isSending}
                  onPress={handleSendOtp}
                >
                  {!resendTimer.isExpired
                    ? `${t('auth.resendCode')} (${resendTimer.timeLeft}s)`
                    : t('auth.resendCode')}
                </Button>
              )}
            </>
          )}
        </View>
      )}

      {/* Recovery tab */}
      {activeTab === 'recovery' && (
        <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
          <View style={{ gap: theme.spacing.xs }}>
            <Label>{t('auth.recoveryCode')}</Label>
            <Input
              value={recoveryCode}
              onChangeText={(text) => setRecoveryCode(text.toUpperCase())}
              placeholder={t('auth.recoveryCodePlaceholder')}
              textAlign="center"
              autoComplete="off"
              autoCapitalize="characters"
              style={styles.codeInput}
            />
            <Text variant="caption" color={theme.colors.mutedForeground}>
              {t('auth.recoveryCodeHint')}
            </Text>
          </View>

          <Button
            size="lg"
            loading={isVerifying}
            disabled={!recoveryCode.trim()}
            onPress={handleVerifyRecovery}
          >
            {t('auth.verifyCode')}
          </Button>
        </View>
      )}

      {/* Back to sign in */}
      <Pressable
        onPress={() => router.replace('/(auth)/sign-in')}
        style={[styles.backLink, { marginTop: theme.spacing.lg }]}
        hitSlop={8}
      >
        <Ionicons
          name="arrow-back"
          size={16}
          color={theme.colors.mutedForeground}
        />
        <Text variant="bodySmall" color={theme.colors.mutedForeground}>
          {t('auth.backToSignIn2fa')}
        </Text>
      </Pressable>
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
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  methodButton: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  codeInput: {
    fontSize: 24,
    letterSpacing: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
  },
});
