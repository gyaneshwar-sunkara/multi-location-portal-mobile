import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useAppTheme } from '@/providers/theme-provider';
import { Text } from './Text';

function isTextContent(children: React.ReactNode): boolean {
  if (children == null || typeof children === 'boolean') return true;
  if (typeof children === 'string' || typeof children === 'number') return true;
  if (Array.isArray(children)) return children.every(isTextContent);
  return false;
}

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
          gap: theme.spacing.lg,
          paddingVertical: theme.spacing.lg,
          ...theme.shadows.md,
        },
        style,
      ]}
      {...props}
    />
  );
}

export function CardHeader({ style, ...props }: ViewProps) {
  const { theme } = useAppTheme();
  return <View style={[{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.xs }, style]} {...props} />;
}

interface CardTextProps extends ViewProps {
  children: string | React.ReactNode;
}

export function CardTitle({ style, children, ...props }: CardTextProps) {
  return isTextContent(children) ? (
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

  return isTextContent(children) ? (
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
  const { theme } = useAppTheme();
  return <View style={[{ paddingHorizontal: theme.spacing.lg }, style]} {...props} />;
}

export function CardFooter({ style, ...props }: ViewProps) {
  const { theme } = useAppTheme();
  return (
    <View
      style={[{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.lg }, style]}
      {...props}
    />
  );
}
