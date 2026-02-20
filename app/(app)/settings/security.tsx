import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAppTheme } from '@/providers/theme-provider';
import { useAuthStore } from '@/stores/auth-store';
import { Text, Button, Input, Label } from '@/components/ui';
import { apiFetch } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-error';
import { qk } from '@/lib/query-keys';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TwoFactorStatus {
  totpEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
}

interface TotpSetupResponse {
  qrCodeDataUrl: string;
  secret: string;
}

interface RecoveryCodeCount {
  count: number;
}

interface TrustedDevice {
  id: string;
  deviceName: string | null;
  browser: string | null;
  os: string | null;
  lastUsedAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SecurityScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  // ── 2FA Status ────────────────────────────────────────────────────────────
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: qk.twoFactorStatus,
    queryFn: async () => {
      const res = await apiFetch('/auth/2fa/status');
      if (!res.ok) throw new Error('Failed to fetch 2FA status');
      return res.json() as Promise<TwoFactorStatus>;
    },
  });

  // ── Recovery code count ───────────────────────────────────────────────────
  const { data: recoveryCount } = useQuery({
    queryKey: ['two-factor', 'recovery-count'],
    queryFn: async () => {
      const res = await apiFetch('/auth/2fa/recovery/count');
      if (!res.ok) throw new Error('Failed to fetch recovery count');
      return res.json() as Promise<RecoveryCodeCount>;
    },
    enabled: !!status?.totpEnabled || !!status?.smsEnabled,
  });

  // ── Trusted devices ───────────────────────────────────────────────────────
  const { data: trustedDevices } = useQuery({
    queryKey: qk.trustedDevices,
    queryFn: async () => {
      const res = await apiFetch('/auth/2fa/trusted-devices');
      if (!res.ok) throw new Error('Failed to fetch trusted devices');
      return res.json() as Promise<TrustedDevice[]>;
    },
    enabled: !!status?.totpEnabled || !!status?.smsEnabled,
  });

  // ── TOTP Setup ────────────────────────────────────────────────────────────
  const [setupData, setSetupData] = useState<TotpSetupResponse | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [setupError, setSetupError] = useState('');

  async function handleSetupTotp() {
    setSetupError('');
    setIsSettingUp(true);
    try {
      const res = await apiFetch('/auth/2fa/totp/setup', { method: 'POST' });
      if (!res.ok) {
        const error = await parseApiError(res, t('errorState.genericDescription'));
        setSetupError(error);
        return;
      }
      const data: TotpSetupResponse = await res.json();
      setSetupData(data);
    } catch {
      setSetupError(t('errorState.genericDescription'));
    } finally {
      setIsSettingUp(false);
    }
  }

  async function handleVerifySetup() {
    setSetupError('');
    setIsVerifying(true);
    try {
      const res = await apiFetch('/auth/2fa/totp/verify-setup', {
        method: 'POST',
        body: JSON.stringify({ code: totpCode }),
      });
      if (!res.ok) {
        const error = await parseApiError(res, t('errorState.genericDescription'));
        setSetupError(error);
        return;
      }
      const data = await res.json() as { recoveryCodes: string[]; message: string };
      setRecoveryCodes(data.recoveryCodes);
      setSetupData(null);
      setTotpCode('');
      queryClient.invalidateQueries({ queryKey: qk.twoFactorStatus });
      Alert.alert('', t('security.totpSetupComplete'));
    } catch {
      setSetupError(t('errorState.genericDescription'));
    } finally {
      setIsVerifying(false);
    }
  }

  // ── Regenerate recovery codes ─────────────────────────────────────────────
  const [isRegenerating, setIsRegenerating] = useState(false);

  function handleRegenerateCodes() {
    Alert.alert(
      t('security.regenerateCodes'),
      t('security.regenerateCodesConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            setIsRegenerating(true);
            try {
              // Prompt for password
              // For simplicity, we send without password and let the API handle it
              const res = await apiFetch('/auth/2fa/recovery/regenerate', {
                method: 'POST',
                body: JSON.stringify({ password: '' }),
              });
              if (!res.ok) {
                const error = await parseApiError(res, t('errorState.genericDescription'));
                Alert.alert('', error);
                return;
              }
              const data = await res.json() as { recoveryCodes: string[] };
              setRecoveryCodes(data.recoveryCodes);
              queryClient.invalidateQueries({ queryKey: ['two-factor', 'recovery-count'] });
              Alert.alert('', t('security.codesRegenerated'));
            } catch {
              Alert.alert('', t('errorState.genericDescription'));
            } finally {
              setIsRegenerating(false);
            }
          },
        },
      ],
    );
  }

  // ── Revoke trusted device ─────────────────────────────────────────────────
  const [revokingId, setRevokingId] = useState<string | null>(null);

  function handleRevokeDevice(deviceId: string) {
    Alert.alert(
      t('security.revokeDevice'),
      t('security.revokeDeviceConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('security.revokeDevice'),
          style: 'destructive',
          onPress: async () => {
            setRevokingId(deviceId);
            try {
              const res = await apiFetch(`/auth/2fa/trusted-devices/${deviceId}`, {
                method: 'DELETE',
              });
              if (!res.ok && res.status !== 204) {
                const error = await parseApiError(res, t('errorState.genericDescription'));
                Alert.alert('', error);
                return;
              }
              queryClient.invalidateQueries({ queryKey: qk.trustedDevices });
              Alert.alert('', t('security.deviceRevoked'));
            } catch {
              Alert.alert('', t('errorState.genericDescription'));
            } finally {
              setRevokingId(null);
            }
          },
        },
      ],
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────

  if (statusLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator />
      </View>
    );
  }

  const is2faEnabled = status?.totpEnabled || status?.smsEnabled;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[
        styles.container,
        { padding: theme.spacing.lg, gap: theme.spacing.lg },
      ]}
    >
      {/* Header */}
      <View style={{ gap: theme.spacing.xs }}>
        <Text variant="h3">{t('security.title')}</Text>
        <Text variant="bodySmall" color={theme.colors.mutedForeground}>
          {t('security.description')}
        </Text>
      </View>

      {/* 2FA Status Section */}
      <View style={{ gap: theme.spacing.xs }}>
        <Text
          variant="caption"
          color={theme.colors.mutedForeground}
          style={styles.sectionTitle}
        >
          {t('security.twoFactor').toUpperCase()}
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.lg,
            },
          ]}
        >
          <View
            style={[
              styles.row,
              { paddingHorizontal: theme.spacing.md },
            ]}
          >
            <View style={[styles.rowLeft, { gap: theme.spacing.sm }]}>
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: is2faEnabled
                      ? theme.colors.primary + '12'
                      : theme.colors.muted,
                  },
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={is2faEnabled ? theme.colors.primary : theme.colors.mutedForeground}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="body">{t('security.twoFactor')}</Text>
                <Text variant="caption" color={theme.colors.mutedForeground}>
                  {is2faEnabled
                    ? t('security.twoFactorEnabled')
                    : t('security.twoFactorDisabled')}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: is2faEnabled
                    ? theme.colors.primary + '15'
                    : theme.colors.destructive + '15',
                  borderRadius: theme.radii.sm,
                },
              ]}
            >
              <Text
                variant="caption"
                color={is2faEnabled ? theme.colors.primary : theme.colors.destructive}
              >
                {is2faEnabled ? t('common.enabled') : t('common.disabled')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* TOTP Setup (if not enabled) */}
      {!status?.totpEnabled && !setupData && (
        <Button
          size="lg"
          loading={isSettingUp}
          onPress={handleSetupTotp}
        >
          {t('security.setupTotp')}
        </Button>
      )}

      {/* Setup Error */}
      {setupError !== '' && (
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
            {setupError}
          </Text>
        </View>
      )}

      {/* QR Code Setup */}
      {setupData && (
        <View style={{ gap: theme.spacing.md }}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                borderRadius: theme.radii.lg,
                padding: theme.spacing.md,
                gap: theme.spacing.md,
                alignItems: 'center',
              },
            ]}
          >
            <Text variant="bodySmall" color={theme.colors.mutedForeground} style={styles.textCenter}>
              {t('security.scanQrCode')}
            </Text>
            <View style={styles.qrContainer}>
              <Image
                source={{ uri: setupData.qrCodeDataUrl }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>
            <Text variant="bodySmall" color={theme.colors.mutedForeground} style={styles.textCenter}>
              {t('security.enterTotpCode')}
            </Text>
          </View>
          <View style={{ gap: theme.spacing.xs }}>
            <Label>{t('auth.verificationCode')}</Label>
            <Input
              value={totpCode}
              onChangeText={setTotpCode}
              placeholder={t('auth.enterCode')}
              keyboardType="number-pad"
              maxLength={6}
              editable={!isVerifying}
            />
          </View>
          <Button
            size="lg"
            loading={isVerifying}
            onPress={handleVerifySetup}
            disabled={totpCode.length !== 6}
          >
            {t('auth.verifyCode')}
          </Button>
        </View>
      )}

      {/* Recovery Codes Display */}
      {recoveryCodes && recoveryCodes.length > 0 && (
        <View style={{ gap: theme.spacing.xs }}>
          <Text
            variant="caption"
            color={theme.colors.mutedForeground}
            style={styles.sectionTitle}
          >
            {t('security.recoveryCodes').toUpperCase()}
          </Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                borderRadius: theme.radii.lg,
                padding: theme.spacing.md,
                gap: theme.spacing.sm,
              },
            ]}
          >
            <Text variant="bodySmall" color={theme.colors.mutedForeground}>
              {t('security.saveRecoveryCodes')}
            </Text>
            <View style={styles.codesGrid}>
              {recoveryCodes.map((code) => (
                <View
                  key={code}
                  style={[
                    styles.codeItem,
                    {
                      backgroundColor: theme.colors.muted,
                      borderRadius: theme.radii.sm,
                    },
                  ]}
                >
                  <Text variant="caption" style={styles.codeText}>
                    {code}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Recovery Code Count & Regenerate (when 2FA is enabled) */}
      {is2faEnabled && (
        <View style={{ gap: theme.spacing.xs }}>
          <Text
            variant="caption"
            color={theme.colors.mutedForeground}
            style={styles.sectionTitle}
          >
            {t('security.recoveryCodes').toUpperCase()}
          </Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                borderRadius: theme.radii.lg,
              },
            ]}
          >
            <View
              style={[
                styles.row,
                { paddingHorizontal: theme.spacing.md },
              ]}
            >
              <View style={[styles.rowLeft, { gap: theme.spacing.sm }]}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.muted }]}>
                  <Ionicons
                    name="key-outline"
                    size={18}
                    color={theme.colors.mutedForeground}
                  />
                </View>
                <Text variant="body">
                  {t('security.recoveryCodesRemaining', {
                    count: recoveryCount?.count ?? 0,
                  })}
                </Text>
              </View>
            </View>
          </View>
          <Button
            variant="outline"
            size="lg"
            loading={isRegenerating}
            onPress={handleRegenerateCodes}
            style={{ marginTop: theme.spacing.xs }}
          >
            {t('security.regenerateCodes')}
          </Button>
        </View>
      )}

      {/* Trusted Devices (when 2FA is enabled) */}
      {is2faEnabled && (
        <View style={{ gap: theme.spacing.xs }}>
          <Text
            variant="caption"
            color={theme.colors.mutedForeground}
            style={styles.sectionTitle}
          >
            {t('security.trustedDevices').toUpperCase()}
          </Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                borderRadius: theme.radii.lg,
              },
            ]}
          >
            {(!trustedDevices || trustedDevices.length === 0) ? (
              <View style={[styles.row, { paddingHorizontal: theme.spacing.md }]}>
                <Text variant="bodySmall" color={theme.colors.mutedForeground}>
                  {t('security.noTrustedDevices')}
                </Text>
              </View>
            ) : (
              trustedDevices.map((device, index) => (
                <View
                  key={device.id}
                  style={[
                    styles.row,
                    { paddingHorizontal: theme.spacing.md },
                    index < trustedDevices.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={[styles.rowLeft, { gap: theme.spacing.sm }]}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.muted }]}>
                      <Ionicons
                        name="phone-portrait-outline"
                        size={18}
                        color={theme.colors.mutedForeground}
                      />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={styles.deviceNameRow}>
                        <Text variant="body" numberOfLines={1} style={{ flex: 1 }}>
                          {device.deviceName ?? [device.browser, device.os].filter(Boolean).join(' - ') ?? t('security.trustedDevices')}
                        </Text>
                        {device.isCurrent && (
                          <View
                            style={[
                              styles.currentBadge,
                              {
                                backgroundColor: theme.colors.primary + '15',
                                borderRadius: theme.radii.sm,
                              },
                            ]}
                          >
                            <Text variant="caption" color={theme.colors.primary}>
                              {t('security.currentDevice')}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text variant="caption" color={theme.colors.mutedForeground}>
                        {t('security.expiresAt', {
                          date: new Date(device.expiresAt).toLocaleDateString(),
                        })}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => handleRevokeDevice(device.id)}
                    disabled={revokingId === device.id}
                    hitSlop={8}
                  >
                    {revokingId === device.id ? (
                      <ActivityIndicator size="small" />
                    ) : (
                      <Ionicons
                        name="close-circle-outline"
                        size={22}
                        color={theme.colors.destructive}
                      />
                    )}
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    paddingHorizontal: 4,
    letterSpacing: 0.5,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingVertical: 10,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  errorBanner: {
    padding: 12,
  },
  qrContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  textCenter: {
    textAlign: 'center',
  },
  codesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  codeItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  codeText: {
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
