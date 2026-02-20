import { I18nManager, Alert } from 'react-native';
import i18next from 'i18next';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';

export type ColorSchemePreference = 'light' | 'dark' | 'system';
export type Language = 'en' | 'es' | 'ar';

const SUPPORTED_LANGUAGES: Language[] = ['en', 'es', 'ar'];
const RTL_LANGUAGES: Language[] = ['ar'];

function isRtl(lang: Language): boolean {
  return RTL_LANGUAGES.includes(lang);
}

interface UIState {
  colorScheme: ColorSchemePreference;
  language: Language;
  setColorScheme: (colorScheme: ColorSchemePreference) => void;
  setLanguage: (language: Language) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      colorScheme: 'system',
      language: 'en',

      setColorScheme: (colorScheme) => set({ colorScheme }),

      setLanguage: (language) => {
        if (!SUPPORTED_LANGUAGES.includes(language)) return;

        const oldLanguage = get().language;
        set({ language });
        i18next.changeLanguage(language);

        // Handle RTL direction change
        const directionChanged = isRtl(oldLanguage) !== isRtl(language);
        if (directionChanged) {
          I18nManager.forceRTL(isRtl(language));
          // i18next.changeLanguage() above has already switched, so t() returns the new language
          Alert.alert(
            i18next.t('language.changedTitle'),
            i18next.t('language.changedDescription'),
          );
        }
      },
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

export { SUPPORTED_LANGUAGES, RTL_LANGUAGES, isRtl };
