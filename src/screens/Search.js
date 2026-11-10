import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store';
import { AYAHS, SURAS, ar, normalize, search } from '../quran';
import { QURAN_FONT } from '../theme';
import { ROW, RIGHT, START } from '../rtl';
import { Divider, TopBar } from '../components/ui';

export default function Search({ nav }) {
  const { theme } = useApp();
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [suras, setSuras] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => {
      setResults(search(q));
      const nq = normalize(q);
      setSuras(nq.length ? SURAS.filter((s) => normalize(s.ar).includes(nq)) : []);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <TopBar title="البحث في القرآن" onBack={nav.back} />
      <View style={[styles.box, { backgroundColor: theme.card, borderColor: theme.border, flexDirection: ROW }]}>
        <Ionicons name="search" size={20} color={theme.muted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          autoFocus
          placeholder="اكتب كلمة أو اسم سورة…"
          placeholderTextColor={theme.muted}
          style={[styles.input, { color: theme.text, textAlign: RIGHT }]}
          returnKeyType="search"
        />
        {q ? <Ionicons name="close-circle" size={20} color={theme.muted} onPress={() => setQ('')} /> : null}
      </View>

      <FlatList
        data={results}
        keyExtractor={(i) => String(i)}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            {suras.map((s) => (
              <Pressable key={s.n} onPress={() => nav.push('reader', { page: s.page })} style={[styles.suraHit, { borderColor: theme.gold, flexDirection: ROW }]}>
                <Text style={{ color: theme.text, fontFamily: QURAN_FONT, fontSize: 20 }}>سورة {s.ar}</Text>
                <Text style={{ color: theme.muted }}>صفحة {ar(s.page)}</Text>
              </Pressable>
            ))}
            {q.trim().length > 1 && (
              <Text style={{ color: theme.muted, paddingHorizontal: 20, paddingVertical: 8, textAlign: RIGHT }}>
                {results.length >= 300 ? 'أكثر من ٣٠٠ نتيجة' : `${ar(results.length)} نتيجة`}
              </Text>
            )}
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ paddingHorizontal: 20 }}><Divider /></View>}
        renderItem={({ item }) => {
          const a = AYAHS[item];
          const s = SURAS[a[0] - 1];
          return (
            <Pressable
              onPress={() => nav.push('reader', { page: a[2], highlight: `${a[0]}:${a[1]}` })}
              style={({ pressed }) => [styles.hit, { backgroundColor: pressed ? theme.accentSoft : 'transparent', alignItems: START }]}
            >
              <Text style={{ color: theme.accent, fontSize: 12.5, fontWeight: '600' }}>
                {s.ar}، {ar(a[1])} — صفحة {ar(a[2])}
              </Text>
              <Text style={{ color: theme.text, fontFamily: QURAN_FONT, fontSize: 20, lineHeight: 40, textAlign: RIGHT, alignSelf: 'stretch' }}>
                {a[4]}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { margin: 16, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', paddingHorizontal: 14, gap: 8 },
  input: { flex: 1, fontSize: 17, paddingVertical: 12, outlineWidth: 0 },
  suraHit: { marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 12, borderWidth: 1, justifyContent: 'space-between', alignItems: 'center' },
  hit: { paddingHorizontal: 20, paddingVertical: 12 },
});
