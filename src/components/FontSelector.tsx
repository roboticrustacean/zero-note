import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { FontFamilyMode, FontSizeScale } from '../theme/types';

interface FontOption {
  id: FontFamilyMode;
  label: string;
  sublabel: string;
}

interface ScaleOption {
  id: FontSizeScale;
  label: string;
}

const FONT_OPTIONS: FontOption[] = [
  { id: 'mono', label: 'Monospace', sublabel: 'Fragment / Geist Mono' },
  { id: 'sans', label: 'Sans-Serif', sublabel: 'Geist / SF Pro' },
  { id: 'serif', label: 'Editorial Serif', sublabel: 'Newsreader / Georgia' },
];

const SCALE_OPTIONS: ScaleOption[] = [
  { id: 'compact', label: 'Compact' },
  { id: 'standard', label: 'Standard' },
  { id: 'large', label: 'Large' },
];

export const FontSelector: React.FC = () => {
  const { theme, fontMode, fontScale, setFontMode, setFontScale, fontFamily, typeScale } = useTheme();

  return (
    <View style={styles.container}>
      {/* Typeface Selection */}
      <Text style={[styles.title, { color: theme.textMuted, fontFamily, fontSize: typeScale.caption }]}>
        TYPOGRAPHY
      </Text>
      <View style={styles.fontOptionsList}>
        {FONT_OPTIONS.map((option) => {
          const isSelected = fontMode === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => setFontMode(option.id)}
              style={[
                styles.fontCard,
                {
                  backgroundColor: isSelected ? theme.cardActive : theme.card,
                  borderColor: isSelected ? theme.accent : theme.border,
                },
              ]}
              testID={`font-option-${option.id}`}
            >
              <Text
                style={[
                  styles.fontLabel,
                  {
                    color: theme.text,
                    fontWeight: isSelected ? '700' : '400',
                  },
                ]}
              >
                {option.label}
              </Text>
              <Text style={[styles.fontSublabel, { color: theme.textMuted, fontSize: typeScale.caption }]}>
                {option.sublabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Font Size Scaling */}
      <Text style={[styles.title, { color: theme.textMuted, fontFamily, fontSize: typeScale.caption, marginTop: 16 }]}>
        TEXT SIZE
      </Text>
      <View style={styles.scaleRow}>
        {SCALE_OPTIONS.map((scale) => {
          const isSelected = fontScale === scale.id;
          return (
            <TouchableOpacity
              key={scale.id}
              onPress={() => setFontScale(scale.id)}
              style={[
                styles.scaleCard,
                {
                  backgroundColor: isSelected ? theme.accent : theme.card,
                  borderColor: theme.border,
                },
              ]}
              testID={`scale-option-${scale.id}`}
            >
              <Text
                style={[
                  styles.scaleText,
                  {
                    color: isSelected ? theme.accentText : theme.text,
                    fontFamily,
                    fontSize: typeScale.caption,
                    fontWeight: isSelected ? '700' : '400',
                  },
                ]}
              >
                {scale.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 8,
  },
  fontOptionsList: {
    gap: 8,
  },
  fontCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fontLabel: {
    fontSize: 15,
  },
  fontSublabel: {
    letterSpacing: -0.2,
  },
  scaleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scaleCard: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleText: {
    letterSpacing: -0.2,
  },
});
