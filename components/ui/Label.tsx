import React from 'react';
import { type TextProps } from 'react-native';
import { Text } from './Text';

interface LabelProps extends TextProps {
  disabled?: boolean;
  children: string;
}

export function Label({ disabled, style, ...props }: LabelProps) {
  return (
    <Text variant="label" style={[disabled && { opacity: 0.5 }, style]} {...props} />
  );
}
