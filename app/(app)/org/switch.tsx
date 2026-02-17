import { View, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/providers/theme-provider';
import { useAuthStore } from '@/stores/auth-store';
import { Text } from '@/components/ui';

export default function OrgSwitchScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();

  const memberships = useAuthStore((s) => s.memberships);
  const activeOrganizationId = useAuthStore((s) => s.activeOrganizationId);
  const setActiveOrganization = useAuthStore((s) => s.setActiveOrganization);

  function handleSelect(orgId: string) {
    setActiveOrganization(orgId);
    router.back();
  }

  if (memberships.length === 0) {
    return (
      <View
        style={[
          styles.empty,
          { backgroundColor: theme.colors.background, padding: theme.spacing.lg },
        ]}
      >
        <Ionicons
          name="business-outline"
          size={48}
          color={theme.colors.mutedForeground}
        />
        <Text
          variant="bodySmall"
          color={theme.colors.mutedForeground}
          style={styles.textCenter}
        >
          {t('common.organizations')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[
        styles.container,
        { padding: theme.spacing.lg },
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            borderRadius: theme.radii.lg,
          },
        ]}
      >
        {memberships.map((membership, index) => {
          const isActive =
            membership.organizationId === activeOrganizationId;

          return (
            <Pressable
              key={membership.organizationId}
              onPress={() => handleSelect(membership.organizationId)}
              style={({ pressed }) => [
                styles.row,
                { paddingHorizontal: theme.spacing.md },
                index < memberships.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.border,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={[styles.rowLeft, { gap: theme.spacing.sm }]}>
                <Ionicons
                  name="business-outline"
                  size={20}
                  color={
                    isActive
                      ? theme.colors.primary
                      : theme.colors.mutedForeground
                  }
                />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    variant="body"
                    color={
                      isActive
                        ? theme.colors.primary
                        : theme.colors.foreground
                    }
                  >
                    {membership.organizationName}
                  </Text>
                  <Text
                    variant="caption"
                    color={theme.colors.mutedForeground}
                  >
                    {membership.roleName}
                  </Text>
                </View>
              </View>
              {isActive && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={theme.colors.primary}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  textCenter: {
    textAlign: 'center',
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingVertical: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
});
