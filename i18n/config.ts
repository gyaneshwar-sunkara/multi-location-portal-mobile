import { I18nManager } from 'react-native';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { mmkv } from '@/lib/storage';
import { type Language, SUPPORTED_LANGUAGES, isRtl } from '@/stores/ui-store';

// Enable RTL support globally
I18nManager.allowRTL(true);

// Empty placeholders — actual translation files are added in Step 6
import en from '@/messages/en.json';
import es from '@/messages/es.json';
import ar from '@/messages/ar.json';

function getInitialLanguage(): Language {
  // 1. Check user override persisted in MMKV
  try {
    const stored = mmkv.getString('ui-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      const state = parsed?.state;
      if (state?.language && SUPPORTED_LANGUAGES.includes(state.language)) {
        return state.language as Language;
      }
    }
  } catch {
    // Fall through to device locale
  }

  // 2. Detect device locale
  const deviceLocales = getLocales();
  if (deviceLocales.length > 0) {
    const code = deviceLocales[0].languageCode;
    if (code && SUPPORTED_LANGUAGES.includes(code as Language)) {
      return code as Language;
    }
  }

  // 3. Fallback
  return 'en';
}

const initialLanguage = getInitialLanguage();

// Set initial RTL direction based on detected language
I18nManager.forceRTL(isRtl(initialLanguage));

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    ar: { translation: ar },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: { escapeValue: false },
  initImmediate: false,
});

export default i18n;
