import React, { useState } from 'react';
import { TextInput, type TextInputProps, Platform } from 'react-native';
import { useAppTheme } from '@/providers/theme-provider';

interface InputProps extends TextInputProps {
  error?: boolean;
}

export function Input({ error, style, onFocus, onBlur, ...props }: InputProps) {
  const { theme } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const { colors, radii } = theme;

  const borderColor = error
    ? colors.destructive
    : focused
      ? colors.ring
      : colors.input;

  return (
    <TextInput
      placeholderTextColor={colors.mutedForeground}
      selectionColor={colors.primary}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[
        {
          height: 48,
          borderWidth: 1,
          borderColor,
          borderRadius: radii.lg,
          paddingHorizontal: 14,
          fontSize: 16,
          color: colors.foreground,
          backgroundColor: colors.muted + '60',
        },
        focused && {
          borderWidth: 2,
          paddingHorizontal: 13,
          backgroundColor: 'transparent',
        },
        Platform.OS === 'android' && { paddingVertical: 8 },
        style,
      ]}
      {...props}
    />
  );
}
