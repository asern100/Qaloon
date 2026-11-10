import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, BackHandler, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/store';
import { QURAN_FONT } from './src/theme';
import Home from './src/screens/Home';
import Reader from './src/screens/Reader';
import Search from './src/screens/Search';
import Settings from './src/screens/Settings';

const SCREENS = { home: Home, reader: Reader, search: Search, settings: Settings };

function Root() {
  const { ready, theme } = useApp();
  const [stack, setStack] = useState([{ name: 'home', params: {}, id: 0 }]);

  const nav = useMemo(() => ({
    push: (name, params = {}) => setStack((s) => {
      // Opening the reader from inside the reader/search replaces the old reader.
      const base = name === 'reader' ? s.filter((x) => x.name !== 'reader' && x.name !== 'search') : s;
      return [...base, { name, params, id: Date.now() }];
    }),
    back: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    // Remember state (e.g. current page) on the top screen without remounting it.
    update: (params) => setStack((s) => s.map((x, i) => (i === s.length - 1 ? { ...x, params: { ...x.params, ...params } } : x))),
  }), []);

  const onBack = useCallback(() => {
    if (stack.length > 1) { nav.back(); return true; }
    return false;
  }, [stack.length, nav]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [onBack]);

  if (!ready) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg }}><ActivityIndicator color={theme.accent} /></View>;
  }
  const top = stack[stack.length - 1];
  const Screen = SCREENS[top.name];
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={theme.bar} />
      <Screen key={top.id} {...top.params} nav={nav} />
    </View>
  );
}

export default function App() {
  const [loaded] = useFonts({ [QURAN_FONT]: require('./assets/fonts/qaloon.10.ttf') });
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}
