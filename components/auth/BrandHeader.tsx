import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/providers/theme-provider';
import { Text } from '@/components/ui';

export function BrandHeader() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  return (
    <View style={[styles.row, { marginBottom: theme.spacing.xl }]}>
      <View
        style={[styles.icon, { backgroundColor: theme.colors.primary }]}
      >
        <Ionicons name="cube" size={28} color={theme.colors.primaryForeground} />
      </View>
      <Text variant="h3">{t('common.appName')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
