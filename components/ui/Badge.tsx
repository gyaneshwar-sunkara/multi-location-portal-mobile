import { View, StyleSheet } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';
import { Text } from '@/components/ui/Text';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'destructive';
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const { theme } = useAppTheme();

  const backgroundColor =
    variant === 'destructive'
      ? theme.colors.destructive + '15'
      : theme.colors.muted;

  const textColor =
    variant === 'destructive'
      ? theme.colors.destructive
      : theme.colors.mutedForeground;

  return (
    <View style={[styles.badge, { backgroundColor, borderRadius: theme.radii.full }]}>
      <Text variant="caption" color={textColor}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
