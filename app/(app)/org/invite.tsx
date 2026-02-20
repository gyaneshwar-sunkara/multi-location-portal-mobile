import React, { useState } from 'react';
import { View, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/providers/theme-provider';
import { useAuthStore } from '@/stores/auth-store';
import { Text, Button, Input, Label, OptionSheet } from '@/components/ui';
import {
  inviteMemberSchema,
  type InviteMemberInput,
} from '@/lib/validations/org';
import { apiFetch } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-error';
import { qk } from '@/lib/query-keys';
import type { OrgRole } from '@/lib/types';

export default function InviteMemberScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const activeOrganizationId = useAuthStore((s) => s.activeOrganizationId);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roleSheetVisible, setRoleSheetVisible] = useState(false);

  // ── Fetch roles ────────────────────────────────────────────────────────
  // GET /roles is org-scoped: api-nest resolves the org from the x-organization-id header
  // (attached automatically by apiFetch via makeAuthenticatedRequest).
  const { data: rolesData } = useQuery({
    queryKey: qk.orgRoles(activeOrganizationId!),
    queryFn: async () => {
      const res = await apiFetch('/roles');
      if (!res.ok) return { data: [] };
      return res.json() as Promise<{ data: OrgRole[] }>;
    },
    enabled: !!activeOrganizationId,
  });

  const roles = rolesData?.data ?? [];

  // ── Form ───────────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: '', roleId: '' },
  });

  const selectedRoleId = watch('roleId');
  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  async function onSubmit(data: InviteMemberInput) {
    setServerError('');
    setIsLoading(true);
    try {
      const response = await apiFetch('/invitations', {
        method: 'POST',
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

      Alert.alert('', t('org.inviteSent'));
      queryClient.invalidateQueries({ queryKey: qk.orgMembers(activeOrganizationId!) });
      queryClient.invalidateQueries({ queryKey: qk.orgInvitations(activeOrganizationId!) });
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
        <Text variant="h3">{t('org.inviteMember')}</Text>
        <Text variant="bodySmall" color={theme.colors.mutedForeground}>
          {t('org.sendInvite')}
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
        {/* Email */}
        <View style={{ gap: theme.spacing.xs }}>
          <Label>{t('org.inviteEmail')}</Label>
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
                placeholder={t('org.inviteEmailPlaceholder')}
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

        {/* Role Picker */}
        <View style={{ gap: theme.spacing.xs }}>
          <Label>{t('org.inviteRole')}</Label>
          <Pressable
            onPress={() => setRoleSheetVisible(true)}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.rolePicker,
              {
                borderColor: errors.roleId
                  ? theme.colors.destructive
                  : theme.colors.input,
                borderRadius: theme.radii.md,
                paddingHorizontal: theme.spacing.sm,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text
              variant="body"
              color={
                selectedRole
                  ? theme.colors.foreground
                  : theme.colors.mutedForeground
              }
            >
              {selectedRole?.name ?? t('org.selectRole')}
            </Text>
            <Ionicons
              name="chevron-down"
              size={18}
              color={theme.colors.mutedForeground}
            />
          </Pressable>
          {errors.roleId && (
            <Text variant="caption" color={theme.colors.destructive}>
              {errors.roleId.message}
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
          {t('org.sendInvite')}
        </Button>
      </View>

      <OptionSheet
        visible={roleSheetVisible}
        title={t('org.inviteRole')}
        options={roles.map((r) => ({ label: r.name, value: r.id }))}
        selectedValue={selectedRoleId}
        onSelect={(value) => setValue('roleId', value, { shouldValidate: true })}
        onClose={() => setRoleSheetVisible(false)}
      />
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
  rolePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderWidth: 1,
  },
});
