import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ThemeMode } from '../theme/types';

interface ThemeOption {
  id: ThemeMode;
  label: string;
  previewBg: string;
  previewText: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  { id: 'oled-dark', label: 'OLED Dark', previewBg: '#000000', previewText: '#EAEAEA' },
  { id: 'warm-paper', label: 'Warm Paper', previewBg: '#F7F6F3', previewText: '#1F1F1F' },
  { id: 'clean-light', label: 'Clean Light', previewBg: '#FFFFFF', previewText: '#111111' },
];

export const ThemeSelector: React.FC = () => {
  const { theme, themeMode, setThemeMode, fontFamily, typeScale } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.textMuted, fontFamily, fontSize: typeScale.caption }]}>
        COLOR PALETTE
      </Text>
      <View style={styles.optionsRow}>
        {THEME_OPTIONS.map((option) => {
          const isSelected = themeMode === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => setThemeMode(option.id)}
              style={[
                styles.optionCard,
                {
                  backgroundColor: option.previewBg,
                  borderColor: isSelected ? theme.accent : theme.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              testID={`theme-option-${option.id}`}
            >
              <Text
                style={[
                  styles.optionLabel,
                  {
                    color: option.previewText,
                    fontFamily,
                    fontSize: typeScale.caption,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {option.label}
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
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    letterSpacing: -0.2,
  },
});
