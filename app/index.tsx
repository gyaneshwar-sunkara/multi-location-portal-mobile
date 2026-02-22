import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';

export default function RootIndex() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)/dashboard" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
