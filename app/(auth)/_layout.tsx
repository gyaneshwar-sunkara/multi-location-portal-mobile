import { Stack } from 'expo-router';
import { useAppTheme } from '@/providers/theme-provider';

export default function AuthLayout() {
  const { theme } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="verify-2fa" />
    </Stack>
  );
}
