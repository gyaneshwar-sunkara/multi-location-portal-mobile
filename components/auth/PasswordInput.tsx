import React, { useState } from 'react';
import { View, Pressable, StyleSheet, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/providers/theme-provider';
import { Input } from '@/components/ui';

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  error?: boolean;
}

export function PasswordInput({ error, style, ...props }: PasswordInputProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Input
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        error={error}
        style={[styles.input, style]}
        {...props}
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        style={styles.toggle}
        hitSlop={8}
        accessibilityLabel={visible ? t('auth.hidePassword') : t('auth.showPassword')}
        accessibilityRole="button"
      >
        <Ionicons
          name={visible ? 'eye-off-outline' : 'eye-outline'}
          size={20}
          color={theme.colors.mutedForeground}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    paddingEnd: 44,
  },
  toggle: {
    position: 'absolute',
    end: 0,
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
