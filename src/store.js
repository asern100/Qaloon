import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES } from './theme';

const DEFAULTS = { theme: 'auto', fontSize: 25, keepAwake: true };
const Ctx = createContext(null);

async function load(key, fallback) {
  try {
    const v = await AsyncStorage.getItem(key);
    return v == null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
}
const save = (key, v) => AsyncStorage.setItem(key, JSON.stringify(v)).catch(() => {});

export function AppProvider({ children }) {
  const scheme = useColorScheme();
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState(DEFAULTS);
  const [bookmarks, setBookmarks] = useState([]);
  const [lastPage, setLastPageState] = useState(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    (async () => {
      const [s, b, p] = await Promise.all([
        load('settings', DEFAULTS), load('bookmarks', []), load('lastPage', null),
      ]);
      setSettings({ ...DEFAULTS, ...s });
      setBookmarks(b);
      setLastPageState(p);
      setReady(true);
    })();
  }, []);

  const setSetting = useCallback((k, v) => {
    setSettings((s) => {
      const n = { ...s, [k]: v };
      save('settings', n);
      return n;
    });
  }, []);

  const setLastPage = useCallback((p) => {
    setLastPageState(p);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save('lastPage', p), 400);
  }, []);

  const toggleBookmark = useCallback((sura, aya, page) => {
    setBookmarks((list) => {
      const exists = list.some((b) => b.sura === sura && b.aya === aya);
      const n = exists
        ? list.filter((b) => !(b.sura === sura && b.aya === aya))
        : [{ sura, aya, page, at: Date.now() }, ...list];
      save('bookmarks', n);
      return n;
    });
  }, []);

  const bookmarkKeys = useMemo(() => new Set(bookmarks.map((b) => `${b.sura}:${b.aya}`)), [bookmarks]);

  const themeKey = settings.theme === 'auto' ? (scheme === 'dark' ? 'dark' : 'rose') : settings.theme;
  const value = {
    ready, settings, setSetting, theme: THEMES[themeKey],
    bookmarks, bookmarkKeys, toggleBookmark, lastPage, setLastPage,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);
