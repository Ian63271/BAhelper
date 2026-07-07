import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  owned: 'bahelper:owned',
  favorites: 'bahelper:favorites',
  settings: 'bahelper:settings',
} as const;

export async function loadJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export async function saveJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is best-effort; the in-memory state stays authoritative.
  }
}
