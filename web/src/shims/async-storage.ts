type AsyncStorageLike = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
};

const AsyncStorage: AsyncStorageLike = {
  async getItem(key) {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  },
  async setItem(key, value) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  },
  async removeItem(key) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
  async clear() {
    if (typeof window === "undefined") return;
    window.localStorage.clear();
  }
};

export default AsyncStorage;

// Some libs expect this named export too:
export function useAsyncStorage(key: string) {
  return {
    getItem: () => AsyncStorage.getItem(key),
    setItem: (value: string) => AsyncStorage.setItem(key, value),
    removeItem: () => AsyncStorage.removeItem(key)
  };
}
