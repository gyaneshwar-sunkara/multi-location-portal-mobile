import { View, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/providers/theme-provider';
import { useUIStore, type Language } from '@/stores/ui-store';
import { Text } from '@/components/ui';

const LANGUAGES: { value: Language; labelKey: string; nativeLabel: string }[] = [
  { value: 'en', labelKey: 'language.en', nativeLabel: 'English' },
  { value: 'es', labelKey: 'language.es', nativeLabel: 'Español' },
  { value: 'ar', labelKey: 'language.ar', nativeLabel: 'العربية' },
];

export default function LanguageScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();

  const language = useUIStore((s) => s.language);
  const setLanguage = useUIStore((s) => s.setLanguage);

  function handleSelect(lang: Language) {
    setLanguage(lang);
    router.back();
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[
        styles.container,
        { padding: theme.spacing.lg },
      ]}
    >
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
        {LANGUAGES.map((lang, index) => {
          const isActive = lang.value === language;

          return (
            <Pressable
              key={lang.value}
              onPress={() => handleSelect(lang.value)}
              style={({ pressed }) => [
                styles.row,
                { paddingHorizontal: theme.spacing.md },
                index < LANGUAGES.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.border,
                },
                isActive && {
                  backgroundColor: theme.colors.primary + '08',
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={[styles.rowLeft, { gap: theme.spacing.sm }]}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: isActive
                        ? theme.colors.primary + '12'
                        : theme.colors.muted,
                    },
                  ]}
                >
                  <Ionicons
                    name="globe-outline"
                    size={18}
                    color={
                      isActive
                        ? theme.colors.primary
                        : theme.colors.mutedForeground
                    }
                  />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    variant="body"
                    color={
                      isActive
                        ? theme.colors.primary
                        : theme.colors.foreground
                    }
                  >
                    {t(lang.labelKey)}
                  </Text>
                  {lang.nativeLabel !== t(lang.labelKey) && (
                    <Text
                      variant="caption"
                      color={theme.colors.mutedForeground}
                    >
                      {lang.nativeLabel}
                    </Text>
                  )}
                </View>
              </View>
              {isActive && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={theme.colors.primary}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingVertical: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
