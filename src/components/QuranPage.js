import React, { memo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AYAHS, BASMALA, LAYOUT, LINE_WIDTH, ar, pageAyahs, pageInfo } from '../quran';
import { JUZ_NAMES, QURAN_FONT } from '../theme';
import { PageFrame, SuraBanner } from './Ornament';
import { ROW } from '../rtl';

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

// Leave ~8% of each line for the gaps between words.
const RENDER_RATIO = 1.08;
const FRAME_SIDE = 29; // padding + frame + inner padding on each side

function LayoutLines({ page, lines, width, theme, highlight, bookmarkKeys, onAyahPress, onAyahLongPress, suras }) {
  const inner = width - FRAME_SIDE * 2;
  const fontSize = Math.min(40, Math.floor(((inner * 100) / (LINE_WIDTH[page] * RENDER_RATIO)) * 10) / 10);
  const lineH = Math.round(fontSize * 2.15);
  return lines.map((l, k) => {
    if (l.h) return <SuraBanner key={k} sura={suras[l.h - 1]} theme={theme} />;
    if (l.b) {
      return (
        <Text key={k} style={[styles.basmala, { color: theme.text, fontFamily: QURAN_FONT, fontSize, lineHeight: lineH }]}>{BASMALA}</Text>
      );
    }
    return (
      <View key={k} style={{ flexDirection: ROW, height: lineH, alignItems: 'center', justifyContent: l.w.length > 2 ? 'space-between' : 'center', gap: l.w.length > 2 ? 0 : fontSize * 0.4 }}>
        {l.w.map(([t, idx, n], j) => {
          const a = idx >= 0 ? AYAHS[idx] : null;
          const key = a ? `${a[0]}:${a[1]}` : null;
          const hl = key && highlight === key;
          return (
            <Text
              key={j}
              onPress={() => onAyahPress(idx)}
              onLongPress={a ? () => onAyahLongPress(idx) : undefined}
              style={{ flexShrink: 0, fontFamily: QURAN_FONT, fontSize, lineHeight: lineH, color: theme.text, backgroundColor: hl ? theme.highlight : 'transparent' }}
            >
              {t}
              {n ? <Text style={{ color: key && bookmarkKeys.has(key) ? theme.accent : theme.frameInk }}>{'\u00A0' + ar(n)}</Text> : null}
            </Text>
          );
        })}
      </View>
    );
  });
}

function QuranPage({ page, width, theme, fontSize, highlight, bookmarkKeys, onAyahPress, onAyahLongPress, suras }) {
  const info = pageInfo(page);
  const lineHeight = Math.round(fontSize * 2.05);
  return (
    <View style={{ width, flex: 1, backgroundColor: theme.paper }}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.pageHead, { flexDirection: ROW }]}>
          <Text style={[styles.headText, { color: theme.text }]}>
            <Text style={{ fontFamily: QURAN_FONT, fontSize: 17 }}>الجزء {JUZ_NAMES[info.juz - 1]}</Text>{'   '}{info.juz}
          </Text>
          <Text style={[styles.headText, { color: theme.text }]}>
            {info.sura.n}{'   '}<Text style={{ fontFamily: QURAN_FONT, fontSize: 17 }}>سورة {info.sura.ar}</Text>
          </Text>
        </View>
        <PageFrame theme={theme}>
        {LAYOUT[page] ? (
          <LayoutLines page={page} lines={LAYOUT[page]} width={width} theme={theme} highlight={highlight} bookmarkKeys={bookmarkKeys}
            onAyahPress={onAyahPress} onAyahLongPress={onAyahLongPress} suras={suras} />
        ) : blocks(page).map((b, k) => {
          if (b.type === 'sura') {
            const sura = suras[b.sura - 1];
            return (
              <View key={k}>
                <SuraBanner sura={sura} theme={theme} />
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
                    <Text style={{ color: marked ? theme.accent : theme.frameInk }}>{ar(a[1])}</Text>
                    {' '}
                  </Text>
                );
              })}
            </Text>
          );
        })}
        </PageFrame>
        <Text style={[styles.pageNo, { color: theme.text }]}>{page}</Text>
      </ScrollView>
    </View>
  );
}

export default memo(QuranPage);

const styles = StyleSheet.create({
  content: { paddingHorizontal: 6, paddingTop: 6, paddingBottom: 90 },
  pageHead: { justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, paddingHorizontal: 8 },
  headText: { fontSize: 14, fontWeight: '600' },
  pageNo: { textAlign: 'center', fontSize: 15, marginTop: 8, fontWeight: '500' },
  basmala: { textAlign: 'center', marginBottom: 4, lineHeight: 52 },
  para: { textAlign: 'justify', writingDirection: 'rtl' },
});
