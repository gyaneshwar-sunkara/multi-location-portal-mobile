import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/auth-provider';
import { useAppTheme } from '@/providers/theme-provider';
import { Text, Button } from '@/components/ui';

export default function AppHome() {
  const { user, logout } = useAuth();
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="h2">
        {t('dashboard.welcome', { name: user?.firstName ?? '' })}
      </Text>
      <Text variant="bodySmall" color={theme.colors.mutedForeground}>
        {user?.email}
      </Text>
      <Button variant="outline" onPress={logout} style={styles.logoutButton}>
        {t('auth.signOut')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoutButton: {
    marginTop: 24,
  },
});
