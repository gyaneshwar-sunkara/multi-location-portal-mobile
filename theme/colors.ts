export interface ColorTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  notification: string;
}

/**
 * Hex values converted from portal-web's OKLch palette (globals.css).
 */

export const lightColors: ColorTokens = {
  background: '#FFFFFF',
  foreground: '#0A0A0A',
  card: '#FFFFFF',
  cardForeground: '#0A0A0A',
  primary: '#171717',
  primaryForeground: '#FAFAFA',
  secondary: '#F5F5F5',
  secondaryForeground: '#171717',
  muted: '#F5F5F5',
  mutedForeground: '#737373',
  accent: '#F5F5F5',
  accentForeground: '#171717',
  destructive: '#EF4444',
  destructiveForeground: '#EF4444',
  border: '#E5E5E5',
  input: '#E5E5E5',
  ring: '#A3A3A3',
  notification: '#EF4444',
};

export const darkColors: ColorTokens = {
  background: '#0A0A0A',
  foreground: '#FAFAFA',
  card: '#0A0A0A',
  cardForeground: '#FAFAFA',
  primary: '#FAFAFA',
  primaryForeground: '#171717',
  secondary: '#262626',
  secondaryForeground: '#FAFAFA',
  muted: '#262626',
  mutedForeground: '#A3A3A3',
  accent: '#262626',
  accentForeground: '#FAFAFA',
  destructive: '#7F1D1D',
  destructiveForeground: '#F75555',
  border: '#262626',
  input: '#262626',
  ring: '#525252',
  notification: '#7F1D1D',
};
