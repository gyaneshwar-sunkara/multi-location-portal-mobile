import { I18nManager, Alert } from 'react-native';
import i18next from 'i18next';
// @ts-expect-error -- mock-only export from __mocks__/react-native-mmkv
import { clearAllMockMMKV } from 'react-native-mmkv';
import { useUIStore, isRtl, SUPPORTED_LANGUAGES, RTL_LANGUAGES } from './ui-store';

jest.mock('i18next', () => ({
  changeLanguage: jest.fn(),
  t: jest.fn((key: string) => key),
}));

jest.spyOn(Alert, 'alert').mockImplementation(() => {});
jest.spyOn(I18nManager, 'forceRTL').mockImplementation(() => {});

beforeEach(() => {
  clearAllMockMMKV();
  jest.clearAllMocks();
  useUIStore.setState({ colorScheme: 'system', language: 'en' });
});

describe('ui-store', () => {
  describe('setColorScheme', () => {
    it('updates color scheme to dark', () => {
      useUIStore.getState().setColorScheme('dark');
      expect(useUIStore.getState().colorScheme).toBe('dark');
    });

    it('updates color scheme to light', () => {
      useUIStore.getState().setColorScheme('light');
      expect(useUIStore.getState().colorScheme).toBe('light');
    });

    it('updates color scheme to system', () => {
      useUIStore.getState().setColorScheme('dark');
      useUIStore.getState().setColorScheme('system');
      expect(useUIStore.getState().colorScheme).toBe('system');
    });
  });

  describe('setLanguage', () => {
    it('updates language and calls i18next.changeLanguage', () => {
      useUIStore.getState().setLanguage('es');
      expect(useUIStore.getState().language).toBe('es');
      expect(i18next.changeLanguage).toHaveBeenCalledWith('es');
    });

    it('ignores unsupported language', () => {
      useUIStore.getState().setLanguage('fr' as 'en');
      expect(useUIStore.getState().language).toBe('en');
      expect(i18next.changeLanguage).not.toHaveBeenCalled();
    });

    it('shows RTL alert when switching to Arabic', () => {
      useUIStore.getState().setLanguage('ar');
      expect(I18nManager.forceRTL).toHaveBeenCalledWith(true);
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('shows LTR alert when switching from Arabic to English', () => {
      useUIStore.setState({ language: 'ar' });
      useUIStore.getState().setLanguage('en');
      expect(I18nManager.forceRTL).toHaveBeenCalledWith(false);
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('does not show alert when direction stays the same', () => {
      useUIStore.getState().setLanguage('es');
      expect(Alert.alert).not.toHaveBeenCalled();
    });
  });
});

describe('isRtl', () => {
  it('returns true for Arabic', () => {
    expect(isRtl('ar')).toBe(true);
  });

  it('returns false for English', () => {
    expect(isRtl('en')).toBe(false);
  });

  it('returns false for Spanish', () => {
    expect(isRtl('es')).toBe(false);
  });
});

describe('constants', () => {
  it('includes all 3 supported languages', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['en', 'es', 'ar']);
  });

  it('includes Arabic as RTL language', () => {
    expect(RTL_LANGUAGES).toEqual(['ar']);
  });
});
