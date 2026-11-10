import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, Share, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store';
import { AYAHS, FIRST_PAGE, SURAS, TOTAL_PAGES, ar, pageInfo } from '../quran';
import { QURAN_FONT } from '../theme';
import { ROW } from '../rtl';
import QuranPage from '../components/QuranPage';
import { IconButton } from '../components/ui';

const PAGES = Array.from({ length: TOTAL_PAGES - FIRST_PAGE + 1 }, (_, i) => i + FIRST_PAGE);

export default function Reader({ page: startPage = FIRST_PAGE, highlight: startHighlight, nav }) {
  const { theme, settings, bookmarkKeys, toggleBookmark, setLastPage } = useApp();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);
  const [page, setPage] = useState(startPage);
  const [chrome, setChrome] = useState(true);
  const [highlight, setHighlight] = useState(startHighlight || null);
  const [sheet, setSheet] = useState(null); // ayah index
  const [jumpOpen, setJumpOpen] = useState(false);

  useEffect(() => {
    if (!settings.keepAwake) return undefined;
    activateKeepAwakeAsync('reader').catch(() => {});
    return () => { deactivateKeepAwake('reader').catch(() => {}); };
  }, [settings.keepAwake]);

  useEffect(() => { setLastPage(page); nav.update({ page }); }, [page, setLastPage, nav]);

  const onViewable = useRef(({ viewableItems }) => {
    if (viewableItems.length) setPage(viewableItems[0].item);
  }).current;

  const goTo = useCallback((p) => {
    const n = Math.max(FIRST_PAGE, Math.min(TOTAL_PAGES, p));
    listRef.current?.scrollToIndex({ index: n - FIRST_PAGE, animated: false });
    setPage(n);
  }, []);

  const onAyahPress = useCallback(() => setChrome((c) => !c), []);
  const onAyahLongPress = useCallback((i) => {
    const a = AYAHS[i];
    setHighlight(`${a[0]}:${a[1]}`);
    setSheet(i);
  }, []);

  const renderItem = useCallback(({ item }) => (
    <QuranPage
      page={item}
      width={width}
      theme={theme}
      fontSize={settings.fontSize}
      highlight={highlight}
      bookmarkKeys={bookmarkKeys}
      onAyahPress={onAyahPress}
      onAyahLongPress={onAyahLongPress}
      suras={SURAS}
    />
  ), [width, theme, settings.fontSize, highlight, bookmarkKeys, onAyahPress, onAyahLongPress]);

  const info = pageInfo(page);
  const sheetAyah = sheet != null ? AYAHS[sheet] : null;
  const shareText = useMemo(() => {
    if (!sheetAyah) return '';
    const s = SURAS[sheetAyah[0] - 1];
    return `${sheetAyah[4]} ﴿${ar(sheetAyah[1])}﴾\n[سورة ${s.ar}، الآية ${ar(sheetAyah[1])}، رواية قالون عن نافع]`;
  }, [sheetAyah]);

  const closeSheet = () => { setSheet(null); };

  return (
    <View style={{ flex: 1, backgroundColor: theme.paper }}>
      <View style={{ height: insets.top, backgroundColor: theme.paper }} />
      <FlatList
        ref={listRef}
        data={PAGES}
        keyExtractor={(p) => String(p)}
        renderItem={renderItem}
        horizontal
        inverted
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={Math.max(0, startPage - FIRST_PAGE)}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        windowSize={3}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        extraData={highlight}
      />

      {chrome && (
        <View style={[styles.top, { paddingTop: insets.top + 4, backgroundColor: theme.bg + 'F2', borderColor: theme.border, flexDirection: ROW }]}>
          <IconButton name="arrow-forward" onPress={nav.back} label="رجوع" />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: theme.text, fontFamily: QURAN_FONT, fontSize: 20 }}>{info.sura.ar}</Text>
            <Text style={{ color: theme.muted, fontSize: 12 }}>الجزء {ar(info.juz)}، صفحة {ar(page)}</Text>
          </View>
          <IconButton name="search" onPress={() => nav.push('search')} label="بحث" />
        </View>
      )}

      {chrome && (
        <View style={[styles.bottom, { paddingBottom: insets.bottom + 8, backgroundColor: theme.bg + 'F2', borderColor: theme.border, flexDirection: ROW }]}>
          <IconButton name="chevron-forward" onPress={() => goTo(page - 1)} label="الصفحة السابقة" />
          <Pressable onPress={() => setJumpOpen(true)} style={[styles.pill, { borderColor: theme.gold }]}>
            <Text style={{ color: theme.text, fontWeight: '600' }}>صفحة {ar(page)} من {ar(TOTAL_PAGES)}</Text>
          </Pressable>
          <IconButton name="chevron-back" onPress={() => goTo(page + 1)} label="الصفحة التالية" />
        </View>
      )}

      <Modal visible={sheet != null} transparent animationType="slide" onRequestClose={closeSheet}>
        <Pressable style={styles.backdrop} onPress={closeSheet} />
        {sheetAyah && (
          <View style={[styles.sheet, { backgroundColor: theme.card, paddingBottom: insets.bottom + 16 }]}>
            <View style={[styles.handle, { backgroundColor: theme.border }]} />
            <Text style={{ color: theme.muted, textAlign: 'center', marginBottom: 8 }}>
              سورة {SURAS[sheetAyah[0] - 1].ar}، الآية {ar(sheetAyah[1])}
            </Text>
            <Text numberOfLines={3} style={{ color: theme.text, fontFamily: QURAN_FONT, fontSize: 21, lineHeight: 40, textAlign: 'center' }}>
              {sheetAyah[4]}
            </Text>
            <View style={[styles.actions, { flexDirection: ROW }]}>
              <SheetAction
                theme={theme}
                icon={bookmarkKeys.has(`${sheetAyah[0]}:${sheetAyah[1]}`) ? 'bookmark' : 'bookmark-outline'}
                label={bookmarkKeys.has(`${sheetAyah[0]}:${sheetAyah[1]}`) ? 'إزالة العلامة' : 'حفظ علامة'}
                onPress={() => { toggleBookmark(sheetAyah[0], sheetAyah[1], sheetAyah[2]); closeSheet(); }}
              />
              <SheetAction theme={theme} icon="copy-outline" label="نسخ" onPress={() => { Clipboard.setStringAsync(shareText); closeSheet(); }} />
              <SheetAction theme={theme} icon="share-outline" label="مشاركة" onPress={() => { Share.share({ message: shareText }).catch(() => {}); closeSheet(); }} />
            </View>
          </View>
        )}
      </Modal>

      <JumpModal visible={jumpOpen} theme={theme} onClose={() => setJumpOpen(false)} onGo={(p) => { setJumpOpen(false); goTo(p); }} />
    </View>
  );
}

function SheetAction({ theme, icon, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, { backgroundColor: theme.accentSoft, opacity: pressed ? 0.6 : 1 }]}>
      <Ionicons name={icon} size={22} color={theme.accent} />
      <Text style={{ color: theme.text, marginTop: 6, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

function JumpModal({ visible, theme, onClose, onGo }) {
  const [val, setVal] = useState('');
  const submit = () => {
    const n = parseInt(val.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)), 10);
    if (n >= FIRST_PAGE && n <= TOTAL_PAGES) { setVal(''); onGo(n); }
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.jump, { backgroundColor: theme.card }]}>
        <Text style={{ color: theme.text, fontSize: 17, fontWeight: '700', textAlign: 'center' }}>الانتقال إلى صفحة</Text>
        <TextInput
          value={val}
          onChangeText={setVal}
          onSubmitEditing={submit}
          keyboardType="number-pad"
          placeholder={`${ar(FIRST_PAGE)} – ${ar(TOTAL_PAGES)}`}
          placeholderTextColor={theme.muted}
          autoFocus
          style={[styles.input, { color: theme.text, borderColor: theme.border, textAlign: 'center' }]}
        />
        <Pressable onPress={submit} style={[styles.go, { backgroundColor: theme.accent }]}>
          <Text style={{ color: theme.onAccent, fontWeight: '700' }}>انتقال</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', top: 0, width: '100%', alignItems: 'center', paddingHorizontal: 8, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  bottom: { position: 'absolute', bottom: 0, width: '100%', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth },
  pill: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  actions: { justifyContent: 'space-between', marginTop: 16, gap: 10 },
  action: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14 },
  jump: { position: 'absolute', top: '30%', alignSelf: 'center', width: '80%', maxWidth: 360, borderRadius: 18, padding: 20 },
  input: { borderWidth: 1, borderRadius: 12, fontSize: 20, paddingVertical: 10, marginVertical: 14 },
  go: { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
});
