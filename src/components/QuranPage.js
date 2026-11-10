import React, { memo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AYAHS, BASMALA, ar, pageAyahs, pageInfo } from '../quran';
import { QURAN_FONT } from '../theme';
import { ROW } from '../rtl';

function SuraHeader({ sura, theme }) {
  return (
    <View style={[styles.suraFrame, { borderColor: theme.gold, backgroundColor: theme.accentSoft }]}>
      <View style={[styles.suraInner, { borderColor: theme.gold }]}>
        <Text style={[styles.suraLabel, { color: theme.muted }]}>سُورَة</Text>
        <Text style={[styles.suraName, { color: theme.accent, fontFamily: QURAN_FONT }]}>{sura.ar}</Text>
      </View>
    </View>
  );
}

// Builds the page as alternating headers and paragraphs of ayat.
function blocks(page) {
  const out = [];
  let para = null;
  for (const i of pageAyahs(page)) {
    const a = AYAHS[i];
    if (a[1] === 1) {
      para = null;
      out.push({ type: 'sura', sura: a[0] });
    }
    if (!para) {
      para = { type: 'para', items: [] };
      out.push(para);
    }
    para.items.push(i);
  }
  return out;
}

function QuranPage({ page, width, theme, fontSize, highlight, bookmarkKeys, onAyahPress, onAyahLongPress, suras }) {
  const info = pageInfo(page);
  const lineHeight = Math.round(fontSize * 2.05);
  return (
    <View style={{ width, flex: 1, backgroundColor: theme.paper }}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.pageHead, { flexDirection: ROW }]}>
          <Text style={[styles.headText, { color: theme.muted, fontFamily: QURAN_FONT }]}>{info.sura.ar}</Text>
          <Text style={[styles.headText, { color: theme.muted }]}>الجزء {ar(info.juz)}</Text>
        </View>
        {blocks(page).map((b, k) => {
          if (b.type === 'sura') {
            const sura = suras[b.sura - 1];
            return (
              <View key={k}>
                <SuraHeader sura={sura} theme={theme} />
                {b.sura !== 9 && (
                  <Text style={[styles.basmala, { color: theme.text, fontFamily: QURAN_FONT, fontSize: fontSize * 0.95 }]}>
                    {BASMALA}
                  </Text>
                )}
              </View>
            );
          }
          return (
            <Text
              key={k}
              style={[styles.para, { color: theme.text, fontFamily: QURAN_FONT, fontSize, lineHeight }]}
            >
              {b.items.map((i) => {
                const a = AYAHS[i];
                const key = `${a[0]}:${a[1]}`;
                const hl = highlight === key;
                const marked = bookmarkKeys.has(key);
                return (
                  <Text
                    key={key}
                    onPress={() => onAyahPress(i)}
                    onLongPress={() => onAyahLongPress(i)}
                    style={hl ? { backgroundColor: theme.highlight } : null}
                  >
                    {a[4]}
                    {' '}
                    <Text style={{ color: marked ? theme.accent : theme.gold }}>{ar(a[1])}</Text>
                    {' '}
                  </Text>
                );
              })}
            </Text>
          );
        })}
        <View style={styles.footer}>
          <View style={[styles.pageNum, { borderColor: theme.gold }]}>
            <Text style={{ color: theme.muted, fontSize: 13, fontWeight: '600' }}>{ar(page)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default memo(QuranPage);

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 90 },
  pageHead: { justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, paddingHorizontal: 2 },
  headText: { fontSize: 15 },
  suraFrame: { borderWidth: 1, borderRadius: 10, padding: 3, marginTop: 10, marginBottom: 6 },
  suraInner: { borderWidth: 1, borderRadius: 7, paddingVertical: 6, alignItems: 'center' },
  suraLabel: { fontSize: 11, letterSpacing: 1 },
  suraName: { fontSize: 26, lineHeight: 44 },
  basmala: { textAlign: 'center', marginVertical: 6, lineHeight: 52 },
  para: { textAlign: 'justify', writingDirection: 'rtl' },
  footer: { alignItems: 'center', marginTop: 18 },
  pageNum: { minWidth: 44, height: 28, paddingHorizontal: 10, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
