import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Share, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ZeroLogo, SettingsIcon, PinIcon, ShareIcon, TrashIcon } from './Icons';
import { safeHaptics } from '../utils/haptics';

interface HeaderBarProps {
  isPinned: boolean;
  onTogglePin: () => void;
  onClearNote: () => void;
  onOpenSettings: () => void;
  noteContent: string;
  hapticsEnabled?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  isPinned,
  onTogglePin,
  onClearNote,
  onOpenSettings,
  noteContent,
  hapticsEnabled = true,
}) => {
  const { theme, fontFamily } = useTheme();

  const handleShare = async () => {
    if (!noteContent || noteContent.trim().length === 0) return;
    try {
      await Share.share({
        message: noteContent,
        title: 'Zero Note',
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const handleClear = () => {
    if (!noteContent || noteContent.trim().length === 0) return;
    triggerHaptic();
    Alert.alert('Clear Note', 'Are you sure you want to clear your current note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: onClearNote,
      },
    ]);
  };

  const triggerHaptic = () => {
    if (hapticsEnabled) {
      safeHaptics.impact();
    }
  };

  return (
    <View style={styles.container}>
      {/* Left side: Iconic Ø logo mark & app branding */}
      <View style={styles.leftGroup}>
        <View style={styles.logoMarkWrapper} testID="app-logo-mark">
          <ZeroLogo size={20} color={theme.text} strokeWidth={2} />
        </View>
        <Text style={[styles.brandTitle, { color: theme.text, fontFamily }]}>
          Zero Note
        </Text>
      </View>

      {/* Right side: Lock Screen Pin, Share, Clear, Settings */}
      <View style={styles.rightGroup}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            onTogglePin();
          }}
          style={[
            styles.iconButton,
            isPinned && { backgroundColor: theme.cardActive, borderColor: theme.border },
          ]}
          accessibilityLabel="Pin note to lock screen"
          testID="btn-pin"
          activeOpacity={0.6}
        >
          <PinIcon
            size={18}
            color={isPinned ? theme.accent : theme.textMuted}
            strokeWidth={1.4}
            filled={isPinned}
          />
        </TouchableOpacity>

        {noteContent.trim().length > 0 && (
          <>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic();
                handleShare();
              }}
              style={styles.iconButton}
              accessibilityLabel="Share note"
              testID="btn-share"
              activeOpacity={0.6}
            >
              <ShareIcon size={18} color={theme.textMuted} strokeWidth={1.4} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClear}
              style={styles.iconButton}
              accessibilityLabel="Clear note"
              testID="btn-clear"
              activeOpacity={0.6}
            >
              <TrashIcon size={17} color={theme.textMuted} strokeWidth={1.4} />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            onOpenSettings();
          }}
          style={styles.iconButton}
          accessibilityLabel="Settings"
          testID="btn-settings"
          activeOpacity={0.6}
        >
          <SettingsIcon size={19} color={theme.textMuted} strokeWidth={1.4} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    paddingTop: 20,
    paddingBottom: 16,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMarkWrapper: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.3,
    opacity: 0.85,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
});
