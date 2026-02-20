import React, { useState } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/providers/theme-provider';
import { useAuthStore } from '@/stores/auth-store';
import { Text, Button, Input, Label } from '@/components/ui';
import {
  createOrgSchema,
  type CreateOrgInput,
} from '@/lib/validations/org';
import { apiFetch } from '@/lib/api-client';
import { parseApiError } from '@/lib/api-error';
import { refreshMemberships } from '@/lib/auth-helpers';

export default function CreateOrganizationScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();
  const setActiveOrganization = useAuthStore((s) => s.setActiveOrganization);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrgInput>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  async function onSubmit(data: CreateOrgInput) {
    setServerError('');
    setIsLoading(true);
    try {
      const response = await apiFetch('/organizations', {
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

      const result = await response.json() as { id: string };

      // Refresh memberships to include the new org
      await refreshMemberships();

      // Switch to the new org
      setActiveOrganization(result.id);

      Alert.alert('', t('org.orgCreated'));
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
        <Text variant="h3">{t('org.createOrganization')}</Text>
        <Text variant="bodySmall" color={theme.colors.mutedForeground}>
          {t('org.createOrgDescription')}
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
        {/* Organization Name */}
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
                placeholder={t('org.orgNamePlaceholder')}
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

        {/* Organization Slug */}
        <View style={{ gap: theme.spacing.xs }}>
          <Label>{t('org.orgSlug')}</Label>
          <Controller
            name="slug"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value}
                onChangeText={(text) => onChange(text.toLowerCase().replace(/\s+/g, '-'))}
                onBlur={onBlur}
                error={!!errors.slug}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder={t('org.orgSlugPlaceholder')}
                editable={!isLoading}
              />
            )}
          />
          {errors.slug && (
            <Text variant="caption" color={theme.colors.destructive}>
              {errors.slug.message}
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
          {t('org.createOrganization')}
        </Button>
      </View>
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
});
