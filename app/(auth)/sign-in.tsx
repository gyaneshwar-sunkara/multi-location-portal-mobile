import React, { useEffect, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useRouter, Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/providers/theme-provider";
import { AuthScreenLayout } from "@/components/auth/AuthScreenLayout";
import { BrandHeader } from "@/components/auth/BrandHeader";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Text, Button, Input, Label } from "@/components/ui";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { apiPublicFetch } from "@/lib/api-client";
import { parseApiError } from "@/lib/api-error";
import { completeAuth } from "@/lib/auth-helpers";
import {
  getPendingInvitationToken,
  clearPendingInvitationToken,
} from "@/lib/storage";
import { isTwoFactorChallenge, type LoginResponse } from "@/lib/types";

export default function SignInScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function handleLoginResponse(response: Response) {
    if (!response.ok) {
      const error = await parseApiError(
        response,
        t("errorState.genericDescription"),
      );
      setServerError(error);
      return;
    }

    const result: LoginResponse = await response.json();

    if (isTwoFactorChallenge(result)) {
      router.push({
        pathname: "/(auth)/verify-2fa",
        params: {
          challengeToken: result.challengeToken,
          methods: result.methods.join(","),
          expiresAt: result.expiresAt,
        },
      });
      return;
    }

    await completeAuth(result);

    // If there's a pending invitation, redirect to accept it instead of dashboard
    const pendingToken = await getPendingInvitationToken();
    if (pendingToken) {
      await clearPendingInvitationToken();
      router.replace({
        pathname: "/(auth)/accept-invitation",
        params: { token: pendingToken },
      });
      return;
    }

    router.replace("/(app)/(tabs)/dashboard");
  }

  async function onSubmit(data: LoginInput) {
    setServerError("");
    setIsLoading(true);
    try {
      const response = await apiPublicFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      await handleLoginResponse(response);
    } catch (error) {
      console.error("Login network error:", error);
      setServerError(t("errorState.genericDescription"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScreenLayout>
      <BrandHeader />

      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="h2">{t("auth.welcomeBack")}</Text>
        <Text variant="bodySmall" color={theme.colors.mutedForeground}>
          {t("auth.signInDescription")}
        </Text>
      </View>

      {serverError !== "" && (
        <View
          style={[
            styles.errorBanner,
            {
              backgroundColor: theme.colors.destructive + "15",
              borderRadius: theme.radii.md,
              marginTop: theme.spacing.md,
            },
          ]}
        >
          <Text variant="bodySmall" color={theme.colors.destructive}>
            {serverError}
          </Text>
        </View>
      )}

      <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
        {/* Email */}
        <View style={{ gap: theme.spacing.xs }}>
          <Label>{t("auth.emailAddress")}</Label>
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                placeholder={t("auth.emailPlaceholder")}
                editable={!isLoading}
              />
            )}
          />
          {errors.email && (
            <Text variant="caption" color={theme.colors.destructive}>
              {errors.email.message}
            </Text>
          )}
        </View>

        {/* Password */}
        <View style={{ gap: theme.spacing.xs }}>
          <View style={styles.passwordHeader}>
            <Label>{t("auth.password")}</Label>
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable hitSlop={8}>
                <Text variant="bodySmall" color={theme.colors.primary}>
                  {t("auth.forgotPassword")}
                </Text>
              </Pressable>
            </Link>
          </View>
          <Controller
            name="password"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.password}
                autoComplete="current-password"
                placeholder={t("auth.passwordPlaceholder")}
                editable={!isLoading}
              />
            )}
          />
          {errors.password && (
            <Text variant="caption" color={theme.colors.destructive}>
              {errors.password.message}
            </Text>
          )}
        </View>

        {/* Submit */}
        <Button
          size="lg"
          loading={isLoading}
          onPress={handleSubmit(onSubmit)}
          style={{ marginTop: theme.spacing.xs }}
        >
          {t("auth.signIn")}
        </Button>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorBanner: {
    padding: 12,
  },
});
