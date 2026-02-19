const stores = new Map<string, Map<string, string>>();

function getStore(id: string): Map<string, string> {
  if (!stores.has(id)) stores.set(id, new Map());
  return stores.get(id)!;
}

export function createMMKV(config: { id: string }) {
  const store = getStore(config.id);

  return {
    getString: (key: string) => store.get(key) ?? undefined,
    set: (key: string, value: string) => store.set(key, value),
    remove: (key: string) => store.delete(key),
    getAllKeys: () => Array.from(store.keys()),
    contains: (key: string) => store.has(key),
    clearAll: () => store.clear(),
  };
}

/** Clear all mock MMKV stores. Call in `beforeEach` or `afterEach`. */
export function clearAllMockMMKV(): void {
  stores.forEach((store) => store.clear());
}
