import React from 'react';
import {
  Pressable,
  type PressableProps,
  ActivityIndicator,
  Platform,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useAppTheme } from '@/providers/theme-provider';
import { Text } from './Text';
import type { Theme } from '@/theme';

type ButtonVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
type ButtonSize = 'default' | 'sm' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: string | React.ReactNode;
}

function getVariantStyles(
  variant: ButtonVariant,
  theme: Theme,
): { container: ViewStyle; text: TextStyle } {
  const { colors, radii } = theme;
  const base: ViewStyle = {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  };

  switch (variant) {
    case 'default':
      return {
        container: { ...base, backgroundColor: colors.primary },
        text: { color: colors.primaryForeground, fontWeight: '500' },
      };
    case 'secondary':
      return {
        container: { ...base, backgroundColor: colors.secondary },
        text: { color: colors.secondaryForeground, fontWeight: '500' },
      };
    case 'destructive':
      return {
        container: { ...base, backgroundColor: colors.destructive },
        text: { color: '#FFFFFF', fontWeight: '500' },
      };
    case 'outline':
      return {
        container: {
          ...base,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.input,
        },
        text: { color: colors.foreground, fontWeight: '500' },
      };
    case 'ghost':
      return {
        container: { ...base, backgroundColor: 'transparent' },
        text: { color: colors.foreground, fontWeight: '500' },
      };
  }
}

function getSizeStyles(size: ButtonSize): { container: ViewStyle; text: TextStyle } {
  switch (size) {
    case 'sm':
      return {
        container: { height: 36, paddingHorizontal: 12 },
        text: { fontSize: 13 },
      };
    case 'default':
      return {
        container: { height: 44, paddingHorizontal: 16 },
        text: { fontSize: 15 },
      };
    case 'lg':
      return {
        container: { height: 52, paddingHorizontal: 24 },
        text: { fontSize: 17 },
      };
  }
}

export function Button({
  variant = 'default',
  size = 'default',
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const { theme } = useAppTheme();
  const variantStyles = getVariantStyles(variant, theme);
  const sizeStyles = getSizeStyles(size);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      style={(state) => [
        variantStyles.container,
        sizeStyles.container,
        { flexDirection: 'row', gap: 8 },
        isDisabled && { opacity: 0.5 },
        Platform.OS === 'ios' && state.pressed && { opacity: 0.7 },
        typeof style === 'function' ? style(state) : style,
      ]}
      android_ripple={
        variant !== 'ghost' ? { color: theme.colors.ring, borderless: false } : undefined
      }
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.text.color as string} />
      ) : typeof children === 'string' ? (
        <Text variant="label" style={[variantStyles.text, sizeStyles.text]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
