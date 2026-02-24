# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

React Native (Expo) mobile portal for `saas/api/` — the mobile companion to `../portal-web/`. Shares the same backend, auth system, and data model. See `../../docs/data-models.md` for how it fits into the data model hierarchy.

**Stack:** Expo SDK 54, React Native 0.81, React 19, TypeScript, Expo Router 6, TanStack Query, Zustand, react-hook-form, Zod v4, i18next, expo-secure-store, react-native-mmkv

**Backend:** `../api/` (NestJS API — 147+ endpoints, JWT auth, multi-tenant)

**Web counterpart:** `../portal-web/` (Next.js 16 — same features, web-optimized)

## Commands

```bash
# Development (requires dev build — MMKV won't work in Expo Go)
npx expo start           # Start Metro bundler
npx expo run:ios         # Build & run on iOS simulator
npx expo run:android     # Build & run on Android emulator
npx expo prebuild        # Generate native projects

# Type checking
npx tsc --noEmit         # TypeScript check
```

## Project Structure

```
app/
├── _layout.tsx              # Root layout: QueryProvider > ThemeProvider > AuthProvider > Stack
├── index.tsx                # Root redirect (authenticated → app, else → sign-in)
├── +not-found.tsx           # 404 screen
├── (auth)/
│   ├── _layout.tsx          # Auth stack navigator (public screens, no header)
│   ├── sign-in.tsx          # Email + password login, 2FA branching
│   ├── forgot-password.tsx  # Request password reset → success state
│   ├── verify-2fa.tsx       # OTP verification (TOTP/email/SMS) + recovery codes
│   ├── reset-password.tsx   # Set new password (from deep link)
│   ├── verify-email.tsx     # Email verification (from deep link, auto-verifies on mount)
│   └── accept-invitation.tsx # Accept org invitation (from deep link, validates + accepts)
└── (app)/
    ├── _layout.tsx          # Auth guard (Redirect if unauthenticated) + Stack
    ├── index.tsx             # Redirect → (tabs)/dashboard
    ├── (tabs)/
    │   ├── _layout.tsx      # Bottom tab navigator (Dashboard, Settings)
    │   ├── dashboard.tsx    # User greeting, active org, account info (TanStack Query)
    │   └── settings.tsx     # Profile, language, theme, org switch, sign out
    └── org/
        └── switch.tsx       # Organization membership picker (modal)
lib/
├── storage.ts               # Shared MMKV instance + Zustand StateStorage adapter
├── config.ts                # API_URL from EXPO_PUBLIC_API_URL with platform-aware dev fallback
├── api-client.ts            # apiFetch() (auth + refresh) + apiPublicFetch() (no auth)
├── api-error.ts             # extractApiError(), parseApiError() — localized error messages
├── auth-helpers.ts          # completeAuth() (fetchMe + setAuth), refreshMemberships(), 2FA API wrappers
├── types.ts                 # User, Membership, AuthResponse, TwoFactorChallengeResponse, InvitationValidation, etc.
├── permissions.ts           # P constants, hasPermission(), meetsOrgHierarchy()
├── query-keys.ts            # Query key factory: qk.authMe, qk.organizationsList, etc.
└── validations/
    ├── index.ts             # Barrel re-export
    ├── auth.ts              # Zod schemas: login, forgotPassword, verify2fa, etc.
    └── settings.ts          # Zod schemas: updateProfile, changePassword, deleteAccount, etc.
stores/
├── auth-store.ts            # Zustand: user, tokens, memberships, activeOrgId (SecureStore + MMKV)
└── ui-store.ts              # Zustand + MMKV persist: language (en/es/ar), colorScheme (light/dark/system)
providers/
├── query-provider.tsx       # QueryClient + focusManager (AppState) + onlineManager (NetInfo)
├── auth-provider.tsx        # AuthContext: hydrate from SecureStore, provide useAuth()
└── theme-provider.tsx       # Theme context: system/user preference, useAppTheme()
hooks/
└── use-countdown.ts         # Countdown timer hook (2FA expiry, OTP resend cooldown)
components/
├── auth/
│   ├── AuthScreenLayout.tsx  # Shared wrapper: SafeAreaView + KeyboardAvoidingView + ScrollView
│   └── PasswordInput.tsx     # Password field with show/hide eye icon toggle
├── ui/
│   ├── Text.tsx             # Themed text with variant prop (h1/h2/h3/body/bodySmall/caption/label)
│   ├── Button.tsx           # Themed button (default/secondary/destructive/outline/ghost, loading)
│   ├── Input.tsx            # Themed TextInput with focus/error border states
│   ├── Card.tsx             # Card + CardHeader/Title/Description/Content/Footer
│   ├── Label.tsx            # Form field label
│   └── index.ts             # Barrel export
└── ExternalLink.tsx         # Platform-aware URL opener
i18n/
├── config.ts                # i18next init: device locale detection, RTL via I18nManager
└── index.ts                 # Re-export
messages/
├── en.json                  # English (7 namespaces: common, errorState, auth, dashboard, settings, language, theme)
├── es.json                  # Spanish
└── ar.json                  # Arabic (RTL)
theme/
├── colors.ts                # lightColors + darkColors (18 semantic tokens)
├── spacing.ts               # xs/sm/md/lg/xl/2xl
├── typography.ts            # h1/h2/h3/body/bodySmall/caption/label presets
├── radii.ts                 # none/sm/md/lg/xl/full
├── shadows.ts               # Platform-specific (iOS shadow*, Android elevation)
└── index.ts                 # lightTheme + darkTheme, Theme type, toNavigationTheme()
```

## Patterns & Conventions

### Authentication & Storage

- **Three-tier storage:** SecureStore (tokens, encrypted), MMKV (user/memberships, fast), Zustand (in-memory)
- `auth-store.ts` — manual hydration on app launch (not Zustand persist). `hydrate()` restores from SecureStore + MMKV
- `auth-store.setAuth()` — full login flow: persist tokens to SecureStore, user/memberships to MMKV
- `auth-store.logout()` — clears both stores, resets state
- `auth-helpers.ts` — `completeAuth(authResponse)` fetches `/auth/me` for memberships, then calls `setAuth()`
- `auth-helpers.ts` — `refreshMemberships()` re-fetches `/auth/me` and updates memberships in store (used after accepting invitations)
- `providers/auth-provider.tsx` — `useAuth()` returns `{ isAuthenticated, isLoading, user, logout }`
- Splash screen gates on `isHydrated` — no flash of wrong screen

### API Client

- `apiFetch(path, options)` — attaches Bearer token, Accept-Language, x-organization-id. Auto-refreshes tokens (proactive 60s buffer + reactive 401 retry). Refresh mutex prevents concurrent refresh calls.
- `apiPublicFetch(path, options)` — no auth. Used for login, forgot-password, 2FA endpoints.
- Both prepend `API_URL` from `lib/config.ts` and accept standard `RequestInit` options.

### Forms & Validation

- React Hook Form + `zodResolver` + Zod schemas from `lib/validations/`
- **Always use `Controller`** (not `register()`) — `Input` component doesn't use `forwardRef`, and `Controller` is the standard React Native pattern
- Server errors displayed via `parseApiError(response, fallback)` — prefers API's localized message
- Password fields use `PasswordInput` component (eye icon toggle)

### Navigation

- **Expo Router** file-based routing with typed routes (`experiments.typedRoutes: true`)
- `router.replace()` after successful auth (prevents back to sign-in)
- `router.push()` for 2FA redirect from sign-in (user can go back)
- Auth guard in `app/(app)/_layout.tsx` via `<Redirect>` component
- Root `app/index.tsx` redirects based on auth state

### State Management

- **Server state:** TanStack Query (5-min staleTime, skip retry on 401, focusManager + onlineManager wired)
- **Auth state:** Zustand (`auth-store.ts`) with split persistence (SecureStore + MMKV)
- **UI state:** Zustand (`ui-store.ts`) with MMKV persist middleware (language, colorScheme)

### Styling

- `StyleSheet.create()` + theme tokens from `useAppTheme()` — no Tailwind
- Theme provides: `colors`, `spacing`, `typography`, `radii`, `shadows`
- 44px minimum touch targets (Apple HIG)
- Platform-specific press feedback: Android ripple, iOS opacity
- RTL automatic via React Native layout engine + `I18nManager.forceRTL()` (configured in i18n/config.ts)

### i18n

- 3 languages: English (en), Spanish (es), Arabic (ar with RTL)
- i18next with `react-i18next` — `useTranslation()` hook, `t('namespace.key')` access
- Interpolation: `{{var}}` format (not `{var}` — converted from portal-web's next-intl format)
- Language switching triggers `I18nManager.forceRTL()` + restart Alert for RTL direction changes
- All user-facing text must use translation keys — no hardcoded strings

### Mobile-Specific

- **Keyboard handling:** `AuthScreenLayout` wraps forms in `KeyboardAvoidingView` (iOS padding) + `ScrollView` (keyboardShouldPersistTaps)
- **Network detection:** `onlineManager` wired to `@react-native-community/netinfo`
- **Focus detection:** `focusManager` wired to `AppState` (refetch on app foreground)
- **Deep links:** scheme `portal-mobile://` (from app.json). Supported deep links: `reset-password?token=`, `verify-email?token=`, `accept-invitation?token=` — all read params via `useLocalSearchParams()`
- **MMKV required:** Won't work in Expo Go. Use `npx expo prebuild` or EAS Build.

## Mobile vs Web Adaptations

| portal-web | portal-mobile | Why |
|-----------|--------------|-----|
| httpOnly cookies (jose) | expo-secure-store (tokens) + MMKV (data) | No browser, need native secure storage |
| Server Actions | Direct fetch + TanStack Query mutations | No server components in RN |
| next-intl | i18next + react-i18next | next-intl is Next.js-specific |
| Tailwind + shadcn/ui | StyleSheet + theme tokens + hand-built components | RN doesn't support CSS |
| next-themes | useColorScheme() + Zustand (MMKV) | No browser, no CSS class toggle |
| lucide-react | @expo/vector-icons (Ionicons) | Ships with Expo |
| Middleware route guard | Redirect component in layout | Expo Router pattern |

## Provider Hierarchy

```
QueryProvider (TanStack Query)
  └── AppThemeProvider (theme context + React Navigation bridge)
      └── AuthProvider (auth hydration + useAuth())
          └── Stack Navigator
              ├── (auth)/ — public auth screens
              └── (app)/ — auth-guarded app shell
```

## Environment Variables

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1  # api-nest backend URL
```

Platform-aware dev fallback: iOS uses `localhost`, Android uses `10.0.2.2` (emulator host).

## Zod v4 Notes

portal-mobile uses Zod v4 (4.3.6) while portal-web uses Zod v3. All APIs used are v3/v4 compatible.
