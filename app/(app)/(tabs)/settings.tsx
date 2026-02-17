import React, { useState } from 'react';
import { View, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/providers/theme-provider';
import { useAuth } from '@/providers/auth-provider';
import { useUIStore, type ColorSchemePreference, type Language } from '@/stores/ui-store';
import { Text, OptionSheet } from '@/components/ui';

type SettingsItem = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  destructive?: boolean;
};

const LANGUAGES: { value: Language; labelKey: string }[] = [
  { value: 'en', labelKey: 'language.en' },
  { value: 'es', labelKey: 'language.es' },
  { value: 'ar', labelKey: 'language.ar' },
];

const THEMES: { value: ColorSchemePreference; labelKey: string }[] = [
  { value: 'light', labelKey: 'theme.light' },
  { value: 'dark', labelKey: 'theme.dark' },
  { value: 'system', labelKey: 'theme.system' },
];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user, logout } = useAuth();

  const language = useUIStore((s) => s.language);
  const setLanguage = useUIStore((s) => s.setLanguage);
  const colorScheme = useUIStore((s) => s.colorScheme);
  const setColorScheme = useUIStore((s) => s.setColorScheme);

  const [languageSheetVisible, setLanguageSheetVisible] = useState(false);
  const [themeSheetVisible, setThemeSheetVisible] = useState(false);

  const sections: { title: string; items: SettingsItem[] }[] = [
    {
      title: t('common.personal'),
      items: [
        {
          key: 'profile',
          icon: 'person-outline',
          label: t('settings.profile.title'),
          value: user
            ? [user.firstName, user.lastName].filter(Boolean).join(' ')
            : undefined,
          onPress: () => {},
        },
        {
          key: 'email',
          icon: 'mail-outline',
          label: t('settings.email.title'),
          value: user?.email ?? undefined,
          onPress: () => {},
        },
      ],
    },
    {
      title: t('settings.appearance.title'),
      items: [
        {
          key: 'language',
          icon: 'globe-outline',
          label: t('language.label'),
          value: t(`language.${language}`),
          onPress: () => setLanguageSheetVisible(true),
        },
        {
          key: 'theme',
          icon: 'color-palette-outline',
          label: t('theme.label'),
          value: t(`theme.${colorScheme}`),
          onPress: () => setThemeSheetVisible(true),
        },
      ],
    },
    {
      title: t('common.organizations'),
      items: [
        {
          key: 'org-switch',
          icon: 'swap-horizontal-outline',
          label: t('common.switchOrganization'),
          onPress: () => router.push('/(app)/org/switch'),
        },
      ],
    },
    {
      title: t('common.account'),
      items: [
        {
          key: 'sign-out',
          icon: 'log-out-outline',
          label: t('auth.signOut'),
          onPress: logout,
          destructive: true,
        },
      ],
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[
        styles.container,
        { padding: theme.spacing.lg, gap: theme.spacing.xl },
      ]}
    >
      {sections.map((section) => (
        <View key={section.title} style={{ gap: theme.spacing.xs }}>
          <Text
            variant="caption"
            color={theme.colors.mutedForeground}
            style={styles.sectionTitle}
          >
            {section.title.toUpperCase()}
          </Text>
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                borderRadius: theme.radii.lg,
              },
            ]}
          >
            {section.items.map((item, index) => (
              <Pressable
                key={item.key}
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.row,
                  { paddingHorizontal: theme.spacing.md },
                  index < section.items.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.colors.border,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={[styles.rowLeft, { gap: theme.spacing.sm }]}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={
                      item.destructive
                        ? theme.colors.destructive
                        : theme.colors.mutedForeground
                    }
                  />
                  <Text
                    variant="body"
                    color={
                      item.destructive
                        ? theme.colors.destructive
                        : theme.colors.foreground
                    }
                  >
                    {item.label}
                  </Text>
                </View>
                <View style={[styles.rowRight, { gap: theme.spacing.xs }]}>
                  {item.value && (
                    <Text
                      variant="bodySmall"
                      color={theme.colors.mutedForeground}
                    >
                      {item.value}
                    </Text>
                  )}
                  {!item.destructive && (
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={theme.colors.mutedForeground}
                    />
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
      <OptionSheet
        visible={languageSheetVisible}
        title={t('language.label')}
        options={LANGUAGES.map((l) => ({ label: t(l.labelKey), value: l.value }))}
        selectedValue={language}
        onSelect={setLanguage}
        onClose={() => setLanguageSheetVisible(false)}
      />
      <OptionSheet
        visible={themeSheetVisible}
        title={t('theme.label')}
        options={THEMES.map((th) => ({ label: t(th.labelKey), value: th.value }))}
        selectedValue={colorScheme}
        onSelect={setColorScheme}
        onClose={() => setThemeSheetVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  sectionTitle: {
    paddingHorizontal: 4,
    letterSpacing: 0.5,
  },
  sectionCard: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingVertical: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
