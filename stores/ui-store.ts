import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

// Shared MMKV instance for all UI state — reused by other stores in Step 5
export const mmkv = createMMKV({ id: 'ui-storage' });

const mmkvStorage: StateStorage = {
  getItem: (name) => mmkv.getString(name) ?? null,
  setItem: (name, value) => mmkv.set(name, value),
  removeItem: (name) => mmkv.remove(name),
};

export type ColorSchemePreference = 'light' | 'dark' | 'system';

interface UIState {
  colorScheme: ColorSchemePreference;
  setColorScheme: (colorScheme: ColorSchemePreference) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      colorScheme: 'system',
      setColorScheme: (colorScheme) => set({ colorScheme }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
