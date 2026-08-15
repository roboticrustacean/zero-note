import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { NoteStats } from '../types/note';

interface FooterBarProps {
  stats: NoteStats;
  visible?: boolean;
  isHovered?: boolean;
}

export const FooterBar: React.FC<FooterBarProps> = ({
  stats,
  visible = true,
  isHovered = true,
}) => {
  const { theme, fontFamily, typeScale } = useTheme();

  if (!visible) return null;

  const wordLabel = stats.words === 1 ? 'word' : 'words';
  const charLabel = stats.chars === 1 ? 'char' : 'chars';

  return (
    <View
      style={[
        styles.container,
        {
          opacity: isHovered ? 0.6 : 0.04,
          ...(Platform.OS === 'web'
            ? ({
                transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              } as any)
            : {}),
        },
      ]}
    >
      <Text style={[styles.statsText, { color: theme.textMuted, fontFamily, fontSize: typeScale.caption }]}>
        {stats.words} {wordLabel}  ·  {stats.chars} {charLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  statsText: {
    letterSpacing: 0.2,
  },
});
