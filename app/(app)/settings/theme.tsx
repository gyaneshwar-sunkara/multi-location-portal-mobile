import { View, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/providers/theme-provider';
import { useUIStore, type ColorSchemePreference } from '@/stores/ui-store';
import { Text } from '@/components/ui';

const THEMES: {
  value: ColorSchemePreference;
  labelKey: string;
  descriptionKey: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    value: 'light',
    labelKey: 'theme.light',
    descriptionKey: 'settings.appearance.lightDescription',
    icon: 'sunny-outline',
  },
  {
    value: 'dark',
    labelKey: 'theme.dark',
    descriptionKey: 'settings.appearance.darkDescription',
    icon: 'moon-outline',
  },
  {
    value: 'system',
    labelKey: 'theme.system',
    descriptionKey: 'settings.appearance.systemDescription',
    icon: 'phone-portrait-outline',
  },
];

export default function ThemeScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();

  const colorScheme = useUIStore((s) => s.colorScheme);
  const setColorScheme = useUIStore((s) => s.setColorScheme);

  function handleSelect(value: ColorSchemePreference) {
    setColorScheme(value);
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
        {THEMES.map((item, index) => {
          const isActive = item.value === colorScheme;

          return (
            <Pressable
              key={item.value}
              onPress={() => handleSelect(item.value)}
              style={({ pressed }) => [
                styles.row,
                { paddingHorizontal: theme.spacing.md },
                index < THEMES.length - 1 && {
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
                    name={item.icon}
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
                    {t(item.labelKey)}
                  </Text>
                  <Text
                    variant="caption"
                    color={theme.colors.mutedForeground}
                  >
                    {t(item.descriptionKey)}
                  </Text>
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
