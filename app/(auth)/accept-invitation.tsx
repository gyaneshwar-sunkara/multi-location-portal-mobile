import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/providers/theme-provider';
import { useAuth } from '@/providers/auth-provider';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { Text, Button } from '@/components/ui';
import { apiFetch, apiPublicFetch } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-error';
import { refreshMemberships } from '@/lib/auth-helpers';
import { setPendingInvitationToken } from '@/lib/storage';
import type { InvitationValidation } from '@/lib/types';

type ScreenState = 'validating' | 'details' | 'accepting' | 'accepted' | 'error' | 'no-token';

export default function AcceptInvitationScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { isAuthenticated } = useAuth();

  const [state, setState] = useState<ScreenState>(token ? 'validating' : 'no-token');
  const [invitation, setInvitation] = useState<InvitationValidation | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const hasValidated = useRef(false);

  useEffect(() => {
    if (!token || hasValidated.current) return;
    hasValidated.current = true;

    async function validate() {
      try {
        const response = await apiPublicFetch(`/invitations/validate/${token}`);

        if (!response.ok) {
          const error = await parseApiError(response, t('auth.invalidInvitation'));
          setErrorMessage(error);
          setState('error');
          return;
        }

        const data: InvitationValidation = await response.json();

        if (!data.valid) {
          setErrorMessage(data.error ?? t('auth.invalidInvitation'));
          setState('error');
          return;
        }

        setInvitation(data);
        setState('details');
      } catch {
        setErrorMessage(t('errorState.genericDescription'));
        setState('error');
      }
    }

    validate();
  }, [token, t]);

  async function handleAccept() {
    setState('accepting');
    try {
      const response = await apiFetch('/invitations/accept', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const error = await parseApiError(response, t('errorState.genericDescription'));
        setErrorMessage(error);
        setState('error');
        return;
      }

      // Refresh memberships so the new org appears in the store
      await refreshMemberships();
      setState('accepted');
    } catch {
      setErrorMessage(t('errorState.genericDescription'));
      setState('error');
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
            {t('auth.invalidInvitation')}
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

  // Validating
  if (state === 'validating') {
    return (
      <AuthScreenLayout>
        <View style={[styles.centered, { gap: theme.spacing.md }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="body" color={theme.colors.mutedForeground}>
            {t('auth.validatingInvitation')}
          </Text>
        </View>
      </AuthScreenLayout>
    );
  }

  // Accepted
  if (state === 'accepted') {
    return (
      <AuthScreenLayout>
        <View style={[styles.centered, { gap: theme.spacing.md }]}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '15' }]}>
            <Ionicons name="checkmark-circle-outline" size={32} color={theme.colors.primary} />
          </View>
          <Text variant="h3" style={styles.textCenter}>
            {t('auth.invitationAccepted')}
          </Text>
          <Button
            size="lg"
            onPress={() => router.replace('/(app)')}
            style={{ marginTop: theme.spacing.sm, alignSelf: 'stretch' }}
          >
            {t('auth.goToDashboard')}
          </Button>
        </View>
      </AuthScreenLayout>
    );
  }

  // Error
  if (state === 'error') {
    return (
      <AuthScreenLayout>
        <View style={[styles.centered, { gap: theme.spacing.md }]}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.destructive + '15' }]}>
            <Ionicons name="alert-circle-outline" size={32} color={theme.colors.destructive} />
          </View>
          <Text variant="h3" style={styles.textCenter}>
            {t('auth.invalidInvitation')}
          </Text>
          <Text
            variant="bodySmall"
            color={theme.colors.mutedForeground}
            style={styles.textCenter}
          >
            {errorMessage}
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

  // Details — show invitation info + accept/sign-in buttons
  return (
    <AuthScreenLayout>
      <View style={[styles.centered, { gap: theme.spacing.md }]}>
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '15' }]}>
          <Ionicons name="mail-open-outline" size={32} color={theme.colors.primary} />
        </View>
        <Text variant="h3" style={styles.textCenter}>
          {t('auth.acceptInvitationTitle')}
        </Text>
        <Text
          variant="bodySmall"
          color={theme.colors.mutedForeground}
          style={styles.textCenter}
        >
          {t('auth.acceptInvitationDescription')}
        </Text>
      </View>

      {/* Invitation Details Card */}
      <View
        style={[
          styles.detailsCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            borderRadius: theme.radii.lg,
            padding: theme.spacing.md,
            marginTop: theme.spacing.lg,
            gap: theme.spacing.sm,
          },
        ]}
      >
        {invitation?.organizationName && (
          <View style={styles.detailRow}>
            <Text variant="caption" color={theme.colors.mutedForeground}>
              {t('auth.organization')}
            </Text>
            <Text variant="body">{invitation.organizationName}</Text>
          </View>
        )}

        {invitation?.roleName && (
          <View style={styles.detailRow}>
            <Text variant="caption" color={theme.colors.mutedForeground}>
              {t('auth.assignedRole')}
            </Text>
            <Text variant="body">{invitation.roleName}</Text>
          </View>
        )}

        {invitation?.email && (
          <View style={styles.detailRow}>
            <Text variant="caption" color={theme.colors.mutedForeground}>
              {t('auth.invitedEmail')}
            </Text>
            <Text variant="body">{invitation.email}</Text>
          </View>
        )}

        {invitation?.expiresAt && (
          <View style={styles.detailRow}>
            <Text variant="caption" color={theme.colors.mutedForeground}>
              {t('auth.expiresAt', {
                date: new Date(invitation.expiresAt).toLocaleDateString(),
              })}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
        {isAuthenticated ? (
          <Button
            size="lg"
            loading={state === 'accepting'}
            onPress={handleAccept}
          >
            {t('auth.acceptInvitation')}
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              onPress={() => {
                if (token) setPendingInvitationToken(token);
                router.replace('/(auth)/sign-in');
              }}
            >
              {t('auth.signInToAccept')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onPress={() => {
                if (token) setPendingInvitationToken(token);
                router.push('/(auth)/register');
              }}
            >
              {t('auth.createAccountToAccept')}
            </Button>
          </>
        )}
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
  detailsCard: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  detailRow: {
    gap: 2,
  },
});
