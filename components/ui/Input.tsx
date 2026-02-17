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
          height: 44,
          borderWidth: 1,
          borderColor,
          borderRadius: radii.md,
          paddingHorizontal: 12,
          fontSize: 16,
          color: colors.foreground,
          backgroundColor: 'transparent',
        },
        focused && {
          borderWidth: 2,
          paddingHorizontal: 11,
        },
        Platform.OS === 'android' && { paddingVertical: 8 },
        style,
      ]}
      {...props}
    />
  );
}
