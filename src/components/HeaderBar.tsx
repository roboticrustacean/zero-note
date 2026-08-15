import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ZeroLogo, HistoryIcon, PinIcon, ArchiveIcon } from './Icons';
import { safeHaptics } from '../utils/haptics';

interface HeaderBarProps {
  isPinned: boolean;
  onTogglePin: () => void;
  onArchive: () => void;
  onOpenSettings: () => void;
  onOpenArchive: () => void;
  noteContent: string;
  hapticsEnabled?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  isPinned,
  onTogglePin,
  onArchive,
  onOpenSettings,
  onOpenArchive,
  noteContent,
  hapticsEnabled = true,
}) => {
  const { theme } = useTheme();

  const triggerHaptic = () => {
    if (hapticsEnabled) {
      safeHaptics.impact();
    }
  };

  const hasContent = noteContent.trim().length > 0;

  return (
    <View style={styles.container}>
      {/* Left: Minimal Ø Logo (Tapping opens Settings & Info) */}
      <TouchableOpacity
        onPress={() => {
          triggerHaptic();
          onOpenSettings();
        }}
        style={styles.logoButton}
        accessibilityLabel="Zero Note Settings and Info"
        testID="app-logo-mark"
        activeOpacity={0.6}
      >
        <ZeroLogo size={20} color={theme.text} strokeWidth={2} />
      </TouchableOpacity>

      {/* Right: Only the 3 essential action glyphs: Pin, History, Archive */}
      <View style={styles.rightGroup}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            onTogglePin();
          }}
          style={[
            styles.iconButton,
            isPinned && { backgroundColor: theme.cardActive },
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

        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            onOpenArchive();
          }}
          style={styles.iconButton}
          accessibilityLabel="Archived Notes"
          testID="btn-history"
          activeOpacity={0.6}
        >
          <HistoryIcon size={18} color={theme.textMuted} strokeWidth={1.4} />
        </TouchableOpacity>

        {hasContent && (
          <TouchableOpacity
            onPress={() => {
              if (hapticsEnabled) {
                safeHaptics.notification();
              }
              onArchive();
            }}
            style={[styles.iconButton, { backgroundColor: theme.card }]}
            accessibilityLabel="Archive current note"
            testID="btn-archive"
            activeOpacity={0.6}
          >
            <ArchiveIcon size={17} color={theme.text} strokeWidth={1.4} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  logoButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
