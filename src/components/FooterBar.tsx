import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { NoteStats } from '../types/note';

interface FooterBarProps {
  stats: NoteStats;
  isSaving: boolean;
  visible?: boolean;
}

export const FooterBar: React.FC<FooterBarProps> = ({ stats, isSaving, visible = true }) => {
  const { theme, fontFamily, typeScale } = useTheme();

  if (!visible) return null;

  const wordLabel = stats.words === 1 ? 'word' : 'words';
  const charLabel = stats.chars === 1 ? 'char' : 'chars';

  return (
    <View style={[styles.container, { borderTopColor: theme.borderSubtle }]}>
      <Text style={[styles.statsText, { color: theme.textMuted, fontFamily, fontSize: typeScale.caption }]}>
        {stats.words} {wordLabel} · {stats.chars} {charLabel}
      </Text>

      <Text style={[styles.statusText, { color: theme.textMuted, fontFamily, fontSize: typeScale.caption }]}>
        {isSaving ? 'saving…' : 'saved'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  statsText: {
    letterSpacing: -0.2,
  },
  statusText: {
    letterSpacing: -0.2,
    opacity: 0.8,
  },
});
