import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store';
import { JUZ, SURAS, ar, findAyah, pageInfo } from '../quran';
import { QURAN_FONT } from '../theme';
import { ROW, RIGHT, START } from '../rtl';
import { Divider, IconButton, StarNumber } from '../components/ui';

const TABS = [
  { key: 'suras', label: 'السور' },
  { key: 'juz', label: 'الأجزاء' },
  { key: 'marks', label: 'العلامات' },
];

export default function Home({ nav }) {
  const { theme, lastPage, bookmarks, toggleBookmark } = useApp();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('suras');

  const data = useMemo(() => {
    if (tab === 'suras') return SURAS;
    if (tab === 'juz') return JUZ;
    return bookmarks;
  }, [tab, bookmarks]);

  const header = (
    <View>
      <View style={[styles.hero, { paddingTop: insets.top + 10 }]}>
        <View style={{ flexDirection: ROW, alignItems: 'center' }}>
          <View style={{ flex: 1, alignItems: START }}>
            <Text style={[styles.kicker, { color: theme.gold }]}>رواية قالون عن نافع</Text>
            <Text style={[styles.title, { color: theme.text, fontFamily: QURAN_FONT }]}>اَ۬لْقُرْءَانُ اُ۬لْكَرِيمُ</Text>
          </View>
          <IconButton name="search-outline" onPress={() => nav.push('search')} label="بحث" />
          <IconButton name="settings-outline" onPress={() => nav.push('settings')} label="الإعدادات" />
        </View>

        <Pressable
          onPress={() => nav.push('reader', { page: lastPage || 1 })}
          style={({ pressed }) => [styles.continue, { backgroundColor: theme.accent, opacity: pressed ? 0.9 : 1, flexDirection: ROW }]}
        >
          <View style={{ flex: 1, alignItems: START }}>
            <Text style={{ color: theme.onAccent, opacity: 0.8, fontSize: 13 }}>
              {lastPage ? 'متابعة القراءة' : 'ابدأ القراءة'}
            </Text>
            <Text style={{ color: theme.onAccent, fontSize: 22, fontFamily: QURAN_FONT, marginTop: 2 }}>
              {pageInfo(lastPage || 1).sura.ar}
            </Text>
            <Text style={{ color: theme.onAccent, opacity: 0.8, fontSize: 13, marginTop: 2 }}>
              صفحة {ar(lastPage || 1)}، الجزء {ar(pageInfo(lastPage || 1).juz)}
            </Text>
          </View>
          <View style={[styles.playCircle, { borderColor: theme.onAccent }]}>
            <Ionicons name="book-outline" size={24} color={theme.onAccent} />
          </View>
        </Pressable>
      </View>

      <View style={[styles.tabs, { backgroundColor: theme.card, borderColor: theme.border, flexDirection: ROW }]}>
        {TABS.map((t) => {
          const on = t.key === tab;
          return (
            <Pressable key={t.key} onPress={() => setTab(t.key)} style={[styles.tab, on && { backgroundColor: theme.accentSoft }]}>
              <Text style={{ color: on ? theme.accent : theme.muted, fontWeight: on ? '700' : '500' }}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderItem = ({ item }) => {
    if (tab === 'suras') {
      return (
        <Row theme={theme} onPress={() => nav.push('reader', { page: item.page })}
          badge={<StarNumber n={item.n} />}
          title={<Text style={[styles.suraName, { color: theme.text, fontFamily: QURAN_FONT }]}>{item.ar}</Text>}
          sub={`${item.type}، ${ar(item.count)} آية`}
          end={ar(item.page)}
        />
      );
    }
    if (tab === 'juz') {
      const s = SURAS[item.sura - 1];
      return (
        <Row theme={theme} onPress={() => nav.push('reader', { page: item.page, highlight: `${item.sura}:${item.aya}` })}
          badge={<StarNumber n={item.n} />}
          title={<Text style={[styles.rowTitle, { color: theme.text, textAlign: RIGHT }]}>الجزء {ar(item.n)}</Text>}
          sub={`${s.ar}، الآية ${ar(item.aya)}`}
          end={ar(item.page)}
        />
      );
    }
    const s = SURAS[item.sura - 1];
    const a = findAyah(item.sura, item.aya);
    return (
      <Row theme={theme} onPress={() => nav.push('reader', { page: item.page, highlight: `${item.sura}:${item.aya}` })}
        badge={<Ionicons name="bookmark" size={22} color={theme.gold} style={{ width: 38, textAlign: 'center' }} />}
        title={<Text numberOfLines={1} style={[styles.markText, { color: theme.text, fontFamily: QURAN_FONT, textAlign: RIGHT }]}>{a ? a[4] : ''}</Text>}
        sub={`سورة ${s.ar}، الآية ${ar(item.aya)}، صفحة ${ar(item.page)}`}
        endNode={<IconButton name="trash-outline" size={20} color={theme.muted} onPress={() => toggleBookmark(item.sura, item.aya, item.page)} label="حذف" />}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <FlatList
        data={data}
        keyExtractor={(it, i) => (tab === 'marks' ? `${it.sura}:${it.aya}` : String(it.n || i))}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={{ paddingHorizontal: 20 }}><Divider /></View>}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Ionicons name="bookmark-outline" size={36} color={theme.muted} />
            <Text style={{ color: theme.muted, marginTop: 10, textAlign: 'center', lineHeight: 22 }}>
              لا توجد علامات بعد.{'\n'}اضغط مطولًا على أي آية لحفظها.
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      />
    </View>
  );
}

function Row({ theme, onPress, badge, title, sub, end, endNode }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, { flexDirection: ROW, backgroundColor: pressed ? theme.accentSoft : 'transparent' }]}>
      {badge}
      <View style={{ flex: 1, marginHorizontal: 14, alignItems: START }}>
        {title}
        <Text style={{ color: theme.muted, fontSize: 12.5, marginTop: 2, textAlign: RIGHT }}>{sub}</Text>
      </View>
      {endNode || <Text style={{ color: theme.muted, fontSize: 13, minWidth: 28, textAlign: 'center' }}>{end}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 16 },
  kicker: { fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  title: { fontSize: 32, lineHeight: 56 },
  continue: { marginTop: 14, borderRadius: 20, padding: 18, alignItems: 'center' },
  playCircle: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.2, alignItems: 'center', justifyContent: 'center', opacity: 0.9 },
  tabs: { marginHorizontal: 20, marginBottom: 8, borderRadius: 14, padding: 4, borderWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10 },
  row: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  suraName: { fontSize: 22, lineHeight: 38 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  markText: { fontSize: 19, lineHeight: 36, alignSelf: 'stretch' },
});
