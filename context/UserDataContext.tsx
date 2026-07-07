import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { loadJson, saveJson, STORAGE_KEYS } from '@/utils/storage';

export interface AppSettings {
  // Whether alt versions (e.g. "Aru (New Year)") can be picked as student of the day.
  dailyIncludeAlts: boolean;
}

const defaultSettings: AppSettings = {
  dailyIncludeAlts: true,
};

interface UserDataValue {
  isLoaded: boolean;
  owned: Set<number>;
  favorites: Set<number>;
  settings: AppSettings;
  toggleOwned: (id: number) => void;
  toggleFavorite: (id: number) => void;
  setOwnedMany: (ids: number[], value: boolean) => void;
  clearOwned: () => void;
  clearFavorites: () => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const UserDataContext = createContext<UserDataValue | null>(null);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [owned, setOwned] = useState<Set<number>>(new Set());
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    (async () => {
      const [ownedIds, favoriteIds, storedSettings] = await Promise.all([
        loadJson<number[]>(STORAGE_KEYS.owned, []),
        loadJson<number[]>(STORAGE_KEYS.favorites, []),
        loadJson<AppSettings>(STORAGE_KEYS.settings, defaultSettings),
      ]);
      setOwned(new Set(ownedIds));
      setFavorites(new Set(favoriteIds));
      setSettings({ ...defaultSettings, ...storedSettings });
      setIsLoaded(true);
    })();
  }, []);

  const value = useMemo<UserDataValue>(() => {
    const persistOwned = (next: Set<number>) => {
      setOwned(next);
      saveJson(STORAGE_KEYS.owned, [...next]);
    };
    const persistFavorites = (next: Set<number>) => {
      setFavorites(next);
      saveJson(STORAGE_KEYS.favorites, [...next]);
    };

    return {
      isLoaded,
      owned,
      favorites,
      settings,
      toggleOwned: (id) => {
        const next = new Set(owned);
        next.has(id) ? next.delete(id) : next.add(id);
        persistOwned(next);
      },
      toggleFavorite: (id) => {
        const next = new Set(favorites);
        next.has(id) ? next.delete(id) : next.add(id);
        persistFavorites(next);
      },
      setOwnedMany: (ids, val) => {
        const next = new Set(owned);
        for (const id of ids) val ? next.add(id) : next.delete(id);
        persistOwned(next);
      },
      clearOwned: () => persistOwned(new Set()),
      clearFavorites: () => persistFavorites(new Set()),
      updateSettings: (patch) => {
        const next = { ...settings, ...patch };
        setSettings(next);
        saveJson(STORAGE_KEYS.settings, next);
      },
    };
  }, [isLoaded, owned, favorites, settings]);

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData(): UserDataValue {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData must be used inside UserDataProvider');
  return ctx;
}
