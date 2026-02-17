import { Stack, useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/providers/theme-provider';
import { Text, Button } from '@/components/ui';

export default function NotFoundScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: theme.colors.muted },
          ]}
        >
          <Ionicons
            name="help-circle-outline"
            size={32}
            color={theme.colors.mutedForeground}
          />
        </View>
        <Text variant="h3" style={styles.textCenter}>
          This screen doesn't exist.
        </Text>
        <Button
          variant="outline"
          size="lg"
          onPress={() => router.replace('/')}
          style={{ alignSelf: 'stretch' }}
        >
          Go to home screen
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCenter: {
    textAlign: 'center',
  },
});
