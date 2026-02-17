import { Stack } from 'expo-router';
import { useAppTheme } from '@/providers/theme-provider';

export default function AppLayout() {
  const { theme } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
    </Stack>
  );
}
