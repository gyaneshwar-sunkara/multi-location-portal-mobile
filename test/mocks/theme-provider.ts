import { lightTheme } from '@/theme';

/** Static mock for useAppTheme — returns light theme. */
export const useAppTheme = () => ({
  theme: lightTheme,
  colorScheme: 'light' as const,
});
