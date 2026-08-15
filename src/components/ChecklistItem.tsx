import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { CheckIcon } from './Icons';

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
            borderColor: checked ? theme.accent : theme.textMuted,
            backgroundColor: checked ? theme.accent : 'transparent',
          },
        ]}
      >
        {checked && <CheckIcon size={11} color={theme.accentText} strokeWidth={2.5} />}
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
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 12,
  },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  text: {
    flex: 1,
    lineHeight: 25,
    letterSpacing: -0.2,
  },
});
