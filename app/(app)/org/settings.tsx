import React, { useState } from 'react';
import { View, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { useAppTheme } from '@/providers/theme-provider';
import { useAuthStore } from '@/stores/auth-store';
import { Text, Button, Input, Label } from '@/components/ui';
import { updateOrgSchema, type UpdateOrgInput } from '@/lib/validations/org';
import { apiFetch } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-error';
import { qk } from '@/lib/query-keys';
import { meetsOrgHierarchy, ORG_HIERARCHY } from '@/lib/permissions';

export default function OrgSettingsScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const memberships = useAuthStore((s) => s.memberships);
  const activeOrganizationId = useAuthStore((s) => s.activeOrganizationId);
  const setActiveOrganization = useAuthStore((s) => s.setActiveOrganization);
  const logout = useAuthStore((s) => s.logout);

  const activeMembership = memberships.find(
    (m) => m.organizationId === activeOrganizationId,
  );
  const isOrgAdmin = meetsOrgHierarchy(
    activeMembership?.roleHierarchy,
    ORG_HIERARCHY.ADMIN_LEVEL,
  );
  const isOwner = activeMembership?.roleName === 'owner';

  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Guard: redirect non-admins
  if (!isOrgAdmin) {
    return <Redirect href="/(app)/(tabs)/dashboard" />;
  }

  // ── Fetch org details ──────────────────────────────────────────────────
  const { data: org } = useQuery({
    queryKey: qk.organizationDetail(activeOrganizationId!),
    queryFn: async () => {
      const res = await apiFetch(`/organizations/${activeOrganizationId}`);
      if (!res.ok) throw new Error('Failed to fetch org');
      return res.json() as Promise<{
        id: string;
        name: string;
        slug: string;
        status: string;
      }>;
    },
    enabled: !!activeOrganizationId,
  });

  // ── Form ───────────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateOrgInput>({
    resolver: zodResolver(updateOrgSchema),
    defaultValues: { name: org?.name ?? activeMembership?.organizationName ?? '' },
    values: org ? { name: org.name } : undefined,
  });

  async function onSubmit(data: UpdateOrgInput) {
    setServerError('');
    setIsLoading(true);
    try {
      const response = await apiFetch(`/organizations/${activeOrganizationId}`, {
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

      // Refresh membership data
      queryClient.invalidateQueries({ queryKey: qk.organizationDetail(activeOrganizationId!) });
      queryClient.invalidateQueries({ queryKey: qk.authMe });
      Alert.alert('', t('org.saved'));
      router.back();
    } catch {
      setServerError(t('errorState.genericDescription'));
    } finally {
      setIsLoading(false);
    }
  }

  // ── Copy slug ──────────────────────────────────────────────────────────
  async function handleCopySlug() {
    if (org?.slug) {
      await Clipboard.setStringAsync(org.slug);
      Alert.alert('', t('org.slugCopied'));
    }
  }

  // ── Delete org ─────────────────────────────────────────────────────────
  function handleDeleteOrg() {
    Alert.alert(t('org.deleteOrgConfirm'), t('org.deleteOrgDescription'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('org.deleteOrg'),
        style: 'destructive',
        onPress: performDelete,
      },
    ]);
  }

  async function performDelete() {
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/organizations/${activeOrganizationId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await parseApiError(res, t('errorState.genericDescription'));
        Alert.alert('', error);
        return;
      }

      // Switch to another org or logout
      const remaining = memberships.filter(
        (m) => m.organizationId !== activeOrganizationId,
      );

      if (remaining.length > 0) {
        setActiveOrganization(remaining[0].organizationId);
        queryClient.invalidateQueries({ queryKey: qk.authMe });
        Alert.alert('', t('org.orgDeleted'));
        router.replace('/(app)/(tabs)/dashboard');
      } else {
        await logout();
        router.replace('/(auth)/sign-in');
      }
    } catch {
      Alert.alert('', t('errorState.genericDescription'));
    } finally {
      setIsDeleting(false);
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
        <Text variant="h3">{t('org.settings')}</Text>
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
        {/* Org Name */}
        <View style={{ gap: theme.spacing.xs }}>
          <Label>{t('org.orgName')}</Label>
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.name}
                autoCapitalize="words"
                editable={!isLoading}
              />
            )}
          />
          {errors.name && (
            <Text variant="caption" color={theme.colors.destructive}>
              {errors.name.message}
            </Text>
          )}
        </View>

        {/* Slug (read-only) */}
        {org?.slug && (
          <View style={{ gap: theme.spacing.xs }}>
            <Label>{t('org.orgSlug')}</Label>
            <Pressable
              onPress={handleCopySlug}
              style={[
                styles.slugRow,
                {
                  borderColor: theme.colors.input,
                  borderRadius: theme.radii.md,
                  paddingHorizontal: theme.spacing.sm,
                  backgroundColor: theme.colors.muted,
                },
              ]}
            >
              <Text variant="body" color={theme.colors.mutedForeground}>
                {org.slug}
              </Text>
              <Ionicons
                name="copy-outline"
                size={18}
                color={theme.colors.mutedForeground}
              />
            </Pressable>
          </View>
        )}

        {/* Save */}
        <Button
          size="lg"
          loading={isLoading}
          onPress={handleSubmit(onSubmit)}
          style={{ marginTop: theme.spacing.sm }}
        >
          {t('settings.profile.save')}
        </Button>
      </View>

      {/* Danger Zone (owner only) */}
      {isOwner && (
        <View
          style={[
            styles.dangerZone,
            {
              backgroundColor: theme.colors.destructive + '15',
              borderRadius: theme.radii.lg,
              padding: theme.spacing.md,
              gap: theme.spacing.sm,
              marginTop: theme.spacing.lg,
            },
          ]}
        >
          <View style={styles.dangerHeader}>
            <Ionicons
              name="warning-outline"
              size={20}
              color={theme.colors.destructive}
            />
            <Text
              variant="body"
              color={theme.colors.destructive}
              style={{ fontWeight: '600' }}
            >
              {t('settings.danger.title')}
            </Text>
          </View>
          <Text variant="bodySmall" color={theme.colors.destructive}>
            {t('org.deleteOrgDescription')}
          </Text>
          <Button
            variant="destructive"
            size="default"
            loading={isDeleting}
            onPress={handleDeleteOrg}
            style={{ marginTop: theme.spacing.xs }}
          >
            {t('org.deleteOrg')}
          </Button>
        </View>
      )}
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
  slugRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderWidth: 1,
  },
  dangerZone: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
