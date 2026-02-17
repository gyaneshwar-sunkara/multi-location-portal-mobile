import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useUIStore, type ColorSchemePreference } from '@/stores/ui-store';
import { lightTheme, darkTheme, toNavigationTheme, type Theme } from '@/theme';

interface ThemeContextValue {
  theme: Theme;
  colorScheme: ColorSchemePreference;
  resolvedColorScheme: 'light' | 'dark';
  setColorScheme: (scheme: ColorSchemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const colorScheme = useUIStore((s) => s.colorScheme);
  const setColorScheme = useUIStore((s) => s.setColorScheme);

  const resolvedColorScheme: 'light' | 'dark' =
    colorScheme === 'system' ? (systemScheme ?? 'light') : colorScheme;

  const theme = resolvedColorScheme === 'dark' ? darkTheme : lightTheme;
  const navigationTheme = useMemo(() => toNavigationTheme(theme), [theme]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({ theme, colorScheme, resolvedColorScheme, setColorScheme }),
    [theme, colorScheme, resolvedColorScheme, setColorScheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <NavigationThemeProvider value={navigationTheme}>
        <StatusBar style={resolvedColorScheme === 'dark' ? 'light' : 'dark'} />
        {children}
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return context;
}
