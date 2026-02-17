import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

// Shared MMKV instance for all Zustand stores.
// Each store uses a different `name` in its persist config, so data is namespaced by key.
export const mmkv = createMMKV({ id: 'app-storage' });

export const mmkvStorage: StateStorage = {
  getItem: (name) => mmkv.getString(name) ?? null,
  setItem: (name, value) => mmkv.set(name, value),
  removeItem: (name) => mmkv.remove(name),
};
