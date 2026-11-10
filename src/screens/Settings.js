import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useApp } from '../store';
import { ar } from '../quran';
import { QURAN_FONT } from '../theme';
import { ROW, RIGHT } from '../rtl';
import { IconButton, TopBar } from '../components/ui';

const THEME_OPTIONS = [
  { key: 'auto', label: 'تلقائي' },
  { key: 'rose', label: 'وردي' },
  { key: 'light', label: 'أخضر' },
  { key: 'sepia', label: 'ورقي' },
  { key: 'dark', label: 'ليلي' },
];

export default function Settings({ nav }) {
  const { theme, settings, setSetting } = useApp();
  const size = settings.fontSize;
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <TopBar title="الإعدادات" onBack={nav.back} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Card theme={theme} title="المظهر">
          <View style={{ flexDirection: ROW, gap: 8, flexWrap: 'wrap' }}>
            {THEME_OPTIONS.map((o) => {
              const on = settings.theme === o.key;
              return (
                <Pressable key={o.key} onPress={() => setSetting('theme', o.key)}
                  style={[styles.chip, { borderColor: on ? theme.accent : theme.border, backgroundColor: on ? theme.accentSoft : 'transparent' }]}>
                  <Text style={{ color: on ? theme.accent : theme.text, fontWeight: on ? '700' : '500' }}>{o.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card theme={theme} title="حجم خط المصحف">
          <View style={{ flexDirection: ROW, alignItems: 'center', justifyContent: 'space-between' }}>
            <IconButton name="add-circle-outline" size={30} color={theme.accent} onPress={() => setSetting('fontSize', Math.min(44, size + 1))} label="تكبير" />
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>{ar(size)}</Text>
            <IconButton name="remove-circle-outline" size={30} color={theme.accent} onPress={() => setSetting('fontSize', Math.max(16, size - 1))} label="تصغير" />
          </View>
          <Text style={{ color: theme.text, fontFamily: QURAN_FONT, fontSize: size, lineHeight: size * 2, textAlign: 'center', marginTop: 8 }}>
            اِ۬لْحَمْدُ لِلهِ رَبِّ اِ۬لْعَٰلَمِينَ{' '}<Text style={{ color: theme.gold }}>١</Text>
          </Text>
        </Card>

        <Card theme={theme} title="القراءة">
          <View style={{ flexDirection: ROW, alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.text, fontSize: 15 }}>إبقاء الشاشة مضاءة أثناء القراءة</Text>
            <Switch value={settings.keepAwake} onValueChange={(v) => setSetting('keepAwake', v)}
              trackColor={{ true: theme.accent, false: theme.border }} thumbColor="#fff" />
          </View>
        </Card>

        <Card theme={theme} title="عن التطبيق">
          <Text style={[styles.about, { color: theme.muted }]}>
            مصحف برواية قالون عن نافع المدني، مجاني تمامًا وبدون إعلانات أو تتبّع، ويعمل دون اتصال بالإنترنت.
            {'\n'}النص والخط: مجمع الملك فهد لطباعة المصحف الشريف (KFGQPC Uthmanic Qaloon، الإصدار ١٠).
            {'\n'}للحفظ: اضغط مطولًا على أي آية. لإظهار الأشرطة أو إخفائها: اضغط على الآية مرة واحدة.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

function Card({ theme, title, children }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={{ color: theme.gold, fontWeight: '700', marginBottom: 12, textAlign: RIGHT }}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, padding: 16, borderWidth: StyleSheet.hairlineWidth },
  chip: { flexGrow: 1, minWidth: 70, alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  about: { fontSize: 14, lineHeight: 24, textAlign: RIGHT },
});
