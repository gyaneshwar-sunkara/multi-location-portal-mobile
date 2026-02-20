import React from 'react';
import { Modal, View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/providers/theme-provider';
import { Text } from './Text';

type Option<T> = { label: string; value: T };

interface OptionSheetProps<T> {
  visible: boolean;
  title: string;
  options: Option<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

function OptionSheetInner<T>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: OptionSheetProps<T>) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.card,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: insets.bottom + 20,
            },
          ]}
          // Prevent taps inside the sheet from closing it
          onStartShouldSetResponder={() => true}
        >
          {/* Handle */}
          <View style={styles.handleRow}>
            <View
              style={[styles.handle, { backgroundColor: theme.colors.border }]}
            />
          </View>

          {/* Title */}
          <View style={[styles.titleRow, { paddingHorizontal: theme.spacing.lg }]}>
            <Text variant="h3">{title}</Text>
          </View>

          {/* Options */}
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            {options.map((option, index) => {
              const isSelected = option.value === selectedValue;
              return (
                <Pressable
                  key={String(option.value)}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      paddingHorizontal: theme.spacing.md,
                      borderRadius: theme.radii.md,
                    },
                    isSelected && {
                      backgroundColor: theme.colors.muted,
                    },
                    pressed && { opacity: 0.7 },
                    index < options.length - 1 && { marginBottom: 2 },
                  ]}
                >
                  <Text
                    variant="body"
                    color={
                      isSelected
                        ? theme.colors.primary
                        : theme.colors.foreground
                    }
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

// React.memo for generic components requires a cast
export const OptionSheet = React.memo(OptionSheetInner) as typeof OptionSheetInner;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    gap: 12,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  titleRow: {
    paddingVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingVertical: 14,
  },
});
