import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';

interface ChecklistItemProps {
  text: string;
  checked: boolean;
  onToggle: () => void;
  hapticsEnabled?: boolean;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  text,
  checked,
  onToggle,
  hapticsEnabled = true,
}) => {
  const { theme, fontFamily, typeScale } = useTheme();

  const handlePress = () => {
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // ignore on unsupported platforms
      }
    }
    onToggle();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={styles.container}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      testID="checklist-item"
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: checked ? theme.textMuted : theme.text,
            backgroundColor: checked ? theme.textMuted : 'transparent',
          },
        ]}
      >
        {checked && <Text style={[styles.checkmark, { color: theme.canvas }]}>✓</Text>}
      </View>
      <Text
        style={[
          styles.text,
          {
            color: checked ? theme.strikeThrough : theme.text,
            fontFamily,
            fontSize: typeScale.editor,
            textDecorationLine: checked ? 'line-through' : 'none',
          },
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkmark: {
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  text: {
    flex: 1,
    lineHeight: 24,
  },
});
