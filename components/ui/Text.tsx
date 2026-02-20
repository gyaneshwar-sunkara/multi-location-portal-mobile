import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { useAppTheme } from '@/providers/theme-provider';
import { typography, type TextVariant } from '@/theme';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
}

export const Text = React.memo(function Text({ variant = 'body', color, style, ...props }: TextProps) {
  const { theme } = useAppTheme();
  const preset = typography[variant];

  return (
    <RNText
      style={[
        {
          color: color ?? theme.colors.foreground,
          fontSize: preset.fontSize,
          lineHeight: preset.lineHeight,
          fontWeight: preset.fontWeight,
          ...('letterSpacing' in preset && { letterSpacing: preset.letterSpacing }),
        },
        style,
      ]}
      {...props}
    />
  );
});
