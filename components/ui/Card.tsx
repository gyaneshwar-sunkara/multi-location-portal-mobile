import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useAppTheme } from '@/providers/theme-provider';
import { Text } from './Text';

export function Card({ style, ...props }: ViewProps) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.card,
          borderRadius: theme.radii.xl,
          borderWidth: 1,
          borderColor: theme.colors.border,
          gap: 24,
          paddingVertical: 24,
          ...theme.shadows.sm,
        },
        style,
      ]}
      {...props}
    />
  );
}

export function CardHeader({ style, ...props }: ViewProps) {
  return <View style={[{ paddingHorizontal: 24, gap: 8 }, style]} {...props} />;
}

interface CardTextProps extends ViewProps {
  children: string | React.ReactNode;
}

export function CardTitle({ style, children, ...props }: CardTextProps) {
  return typeof children === 'string' ? (
    <Text variant="h3" style={style} {...(props as any)}>
      {children}
    </Text>
  ) : (
    <View style={style} {...props}>
      {children}
    </View>
  );
}

export function CardDescription({ style, children, ...props }: CardTextProps) {
  const { theme } = useAppTheme();

  return typeof children === 'string' ? (
    <Text variant="bodySmall" color={theme.colors.mutedForeground} style={style} {...(props as any)}>
      {children}
    </Text>
  ) : (
    <View style={style} {...props}>
      {children}
    </View>
  );
}

export function CardContent({ style, ...props }: ViewProps) {
  return <View style={[{ paddingHorizontal: 24 }, style]} {...props} />;
}

export function CardFooter({ style, ...props }: ViewProps) {
  return (
    <View
      style={[{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24 }, style]}
      {...props}
    />
  );
}
