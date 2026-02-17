import { lightColors, darkColors, type ColorTokens } from './colors';
import { spacing, type SpacingKey } from './spacing';
import { typography, type TextVariant, type TextPreset } from './typography';
import { radii, type RadiusKey } from './radii';
import { shadows } from './shadows';
import type { Theme as NavigationTheme } from '@react-navigation/native';

export interface Theme {
  dark: boolean;
  colors: ColorTokens;
  spacing: typeof spacing;
  typography: typeof typography;
  radii: typeof radii;
  shadows: typeof shadows;
}

export const lightTheme: Theme = {
  dark: false,
  colors: lightColors,
  spacing,
  typography,
  radii,
  shadows,
};

export const darkTheme: Theme = {
  dark: true,
  colors: darkColors,
  spacing,
  typography,
  radii,
  shadows,
};

/**
 * Maps our custom theme to React Navigation's Theme type.
 * This ensures navigation chrome (headers, tab bars, stack backgrounds)
 * automatically uses our design tokens.
 */
export function toNavigationTheme(theme: Theme): NavigationTheme {
  return {
    dark: theme.dark,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.foreground,
      border: theme.colors.border,
      notification: theme.colors.notification,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' },
      medium: { fontFamily: 'System', fontWeight: '500' },
      bold: { fontFamily: 'System', fontWeight: '600' },
      heavy: { fontFamily: 'System', fontWeight: '700' },
    },
  };
}

export { spacing, typography, radii, shadows };
export type { ColorTokens, SpacingKey, TextVariant, TextPreset, RadiusKey };
