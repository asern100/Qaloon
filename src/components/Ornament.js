import React, { useId } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, Path, Pattern, Rect } from 'react-native-svg';
import { QURAN_FONT } from '../theme';
import { ROW } from '../rtl';

// A repeating floral tile (four petals around a diamond) used for the page
// frame and the sura banners. Original artwork drawn in code.
function Tile({ id, size, theme }) {
  const h = size / 2;
  const p = size * 0.2;
  return (
    <Pattern id={id} patternUnits="userSpaceOnUse" x="0" y="0" width={size} height={size}>
      <Rect x="0" y="0" width={size} height={size} fill={theme.paper} />
      <Ellipse cx={h} cy={p * 0.9} rx={p * 0.55} ry={p * 0.95} fill={theme.frame} />
      <Ellipse cx={h} cy={size - p * 0.9} rx={p * 0.55} ry={p * 0.95} fill={theme.frame} />
      <Ellipse cx={p * 0.9} cy={h} rx={p * 0.95} ry={p * 0.55} fill={theme.frame} />
      <Ellipse cx={size - p * 0.9} cy={h} rx={p * 0.95} ry={p * 0.55} fill={theme.frame} />
      <Path d={`M${h} ${h - p} L${h + p} ${h} L${h} ${h + p} L${h - p} ${h} Z`} fill="none" stroke={theme.frameInk} strokeWidth={size * 0.06} />
      <Circle cx={h} cy={h} r={size * 0.06} fill={theme.frameInk} />
      <Circle cx="0" cy="0" r={size * 0.09} fill={theme.frameInk} />
      <Circle cx={size} cy="0" r={size * 0.09} fill={theme.frameInk} />
      <Circle cx="0" cy={size} r={size * 0.09} fill={theme.frameInk} />
      <Circle cx={size} cy={size} r={size * 0.09} fill={theme.frameInk} />
    </Pattern>
  );
}

function PatternFill({ theme, size = 14 }) {
  const id = 'orn' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs><Tile id={id} size={size} theme={theme} /></Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

// Decorative page frame: ink rule, floral band, double inner rule.
export function PageFrame({ theme, children, band = 9 }) {
  return (
    <View style={[styles.frameOuter, { borderColor: theme.frameInk }]}>
      <PatternFill theme={theme} />
      <View style={[styles.frameInner, { margin: band, borderColor: theme.frameInk, backgroundColor: theme.paper }]}>
        <View style={[styles.frameInner2, { borderColor: theme.frameInk }]}>{children}</View>
      </View>
    </View>
  );
}

function Medallion({ theme, label, value }) {
  return (
    <View style={styles.medal}>
      <View style={[styles.medalSq, { borderColor: theme.frameInk, backgroundColor: theme.paper }]} />
      <View style={[styles.medalSq, { borderColor: theme.frameInk, backgroundColor: theme.paper, transform: [{ rotate: '45deg' }] }]} />
      <Text style={[styles.medalLabel, { color: theme.frame }]}>{label}</Text>
      <Text style={[styles.medalValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

// Sura title banner: floral band, central cartouche and two medallions
// (sura order on the right, ayah count on the left).
export function SuraBanner({ theme, sura }) {
  return (
    <View style={[styles.banner, { borderColor: theme.frameInk }]}>
      <PatternFill theme={theme} size={12} />
      <View style={[styles.bannerRow, { flexDirection: ROW }]}>
        <Medallion theme={theme} label="ترتيبها" value={sura.n} />
        <View style={[styles.cartouche, { borderColor: theme.frameInk, backgroundColor: theme.paper }]}>
          <View style={[styles.cartoucheIn, { borderColor: theme.frame }]}>
            <Text style={[styles.suraTitle, { color: theme.text, fontFamily: QURAN_FONT }]}>سُورَةُ {sura.ar}</Text>
          </View>
        </View>
        <Medallion theme={theme} label="ءَايَاتُهَا" value={sura.printCount || sura.count} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frameOuter: { borderWidth: 1.5, overflow: 'hidden' },
  frameInner: { borderWidth: 1.5, padding: 2 },
  frameInner2: { borderWidth: 0.8, paddingHorizontal: 8, paddingVertical: 6 },
  banner: { borderWidth: 1.2, marginVertical: 8, overflow: 'hidden', borderRadius: 2 },
  bannerRow: { alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6, paddingVertical: 6 },
  cartouche: { flex: 1, marginHorizontal: 10, borderWidth: 1.4, borderRadius: 30, padding: 2 },
  cartoucheIn: { borderWidth: 1, borderRadius: 28, alignItems: 'center', paddingVertical: 2 },
  suraTitle: { fontSize: 24, lineHeight: 44 },
  medal: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  medalSq: { position: 'absolute', width: 34, height: 34, borderWidth: 1.2 },
  medalLabel: { fontSize: 8.5, fontWeight: '700', marginBottom: -1 },
  medalValue: { fontSize: 12, fontWeight: '700' },
});
