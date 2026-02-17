# portal-mobile

React Native (Expo) mobile portal for the SaaS boilerplate — the mobile companion to [portal-web](../portal-web/).

## Stack

| Concern | Library |
|---------|---------|
| Framework | Expo SDK 54 / Expo Router 6 |
| Language | TypeScript 5.9 |
| Server state | TanStack Query v5 |
| Client state | Zustand + react-native-mmkv |
| Forms | react-hook-form + zod v4 |
| Styling | StyleSheet + theme tokens |
| Icons | @expo/vector-icons (Ionicons) |
| i18n | i18next + react-i18next + expo-localization |
| Auth storage | expo-secure-store (tokens) + MMKV (preferences) |

## Prerequisites

- Node.js 18+
- iOS Simulator (Xcode) or Android Emulator (Android Studio)
- Running instance of `saas/api/` on localhost

> MMKV requires native modules — **will not work in Expo Go**. Use `npx expo prebuild` or EAS Build.

## Setup

```bash
# Install dependencies
npm install

# Generate native projects (required for MMKV)
npx expo prebuild

# Copy environment file
cp .env.example .env
# Edit .env with your API URL

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

## Features

### Authentication
- Sign in with email/password
- Registration with real-time password requirements
- Forgot password / reset password (deep link)
- Two-factor authentication (TOTP, Email OTP, SMS OTP)
- Recovery codes
- Secure token storage (expo-secure-store)
- Automatic token refresh with mutex

### App Shell
- Bottom tab navigator (Dashboard, Settings)
- Auth guard — unauthenticated users redirected to sign-in
- Organization switcher (modal)
- Pull-to-refresh on dashboard

### Settings
- Language switching (English, Spanish, Arabic)
- Theme switching (Light, Dark, System)
- Organization management
- Sign out

### i18n
- 3 languages: English (en), Spanish (es), Arabic (ar)
- Full RTL support for Arabic
- All text localized via translation keys

### Theming
- Light and dark mode with 18 semantic color tokens
- System preference detection with manual override
- Persisted to MMKV across app restarts

## Architecture

```
QueryProvider → AppThemeProvider → AuthProvider → Stack Navigator
                                                  ├── (auth)/ — public screens
                                                  └── (app)/ — protected screens
                                                       ├── (tabs)/ — Dashboard, Settings
                                                       └── org/switch — modal
```

### Storage Strategy

| Data | Storage | Why |
|------|---------|-----|
| Access/refresh tokens | expo-secure-store | Encrypted, hardware-backed |
| User profile, memberships | MMKV | Fast read, non-sensitive |
| UI preferences (theme, language) | MMKV (Zustand persist) | Survives app restarts |
| Server data cache | TanStack Query (in-memory) | Automatic refetch + stale management |

## Project Structure

See [CLAUDE.md](./CLAUDE.md) for the full annotated file tree and development patterns.

## Related

- [saas/api/](../api/) — NestJS backend (147+ endpoints)
- [saas/portal-web/](../portal-web/) — Next.js web portal (same features)
- [docs/](../../docs/) — Architecture docs, data models, derivation strategy
