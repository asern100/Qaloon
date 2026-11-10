import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../store';
import { ROW } from '../rtl';
import { ar } from '../quran';

// Eight-pointed star badge (two overlapping rotated squares) with a number.
export function StarNumber({ n, size = 38 }) {
  const { theme } = useApp();
  const sq = size * 0.72;
  const sqStyle = {
    position: 'absolute', width: sq, height: sq, borderWidth: 1.2,
    borderColor: theme.gold, borderRadius: 3,
  };
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={sqStyle} />
      <View style={[sqStyle, { transform: [{ rotate: '45deg' }] }]} />
      <Text style={{ color: theme.text, fontSize: size * 0.32, fontWeight: '600' }}>{ar(n)}</Text>
    </View>
  );
}

export function IconButton({ name, onPress, color, size = 24, style, label }) {
  const { theme } = useApp();
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.5 : 1 }, style]}
    >
      <Ionicons name={name} size={size} color={color || theme.text} />
    </Pressable>
  );
}

export function TopBar({ title, onBack, right }) {
  const { theme } = useApp();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.topBar, { paddingTop: insets.top + 6, backgroundColor: theme.bg, borderColor: theme.border, flexDirection: ROW }]}>
      {onBack ? <IconButton name="arrow-forward" onPress={onBack} label="رجوع" /> : <View style={styles.iconBtn} />}
      <Text style={[styles.topTitle, { color: theme.text }]} numberOfLines={1}>{title}</Text>
      {right || <View style={styles.iconBtn} />}
    </View>
  );
}

export function Divider() {
  const { theme } = useApp();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.border }} />;
}

const styles = StyleSheet.create({
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topBar: { alignItems: 'center', paddingHorizontal: 8, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  topTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700' },
});
