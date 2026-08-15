import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Share } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { SettingsIcon, HistoryIcon, PinIcon, ShareIcon, ArchiveIcon } from './Icons';
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

  const triggerHaptic = () => {
    if (hapticsEnabled) {
      safeHaptics.impact();
    }
  };

  return (
    <View style={styles.container}>
      {/* Left side: Subtle ghost icons for Settings & History */}
      <View style={styles.leftGroup}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            onOpenSettings();
          }}
          style={styles.ghostButton}
          accessibilityLabel="Settings"
          testID="btn-settings"
          activeOpacity={0.6}
        >
          <SettingsIcon size={19} color={theme.textMuted} strokeWidth={1.4} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            onOpenArchive();
          }}
          style={styles.ghostButton}
          accessibilityLabel="Archive History"
          testID="btn-history"
          activeOpacity={0.6}
        >
          <HistoryIcon size={19} color={theme.textMuted} strokeWidth={1.4} />
        </TouchableOpacity>
      </View>

      {/* Right side: Share, Lock Screen Pin, Archive */}
      <View style={styles.rightGroup}>
        {noteContent.trim().length > 0 && (
          <TouchableOpacity
            onPress={() => {
              triggerHaptic();
              handleShare();
            }}
            style={styles.ghostButton}
            accessibilityLabel="Share note"
            testID="btn-share"
            activeOpacity={0.6}
          >
            <ShareIcon size={18} color={theme.textMuted} strokeWidth={1.4} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            onTogglePin();
          }}
          style={[
            styles.pinButton,
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

        <TouchableOpacity
          onPress={() => {
            if (hapticsEnabled) {
              safeHaptics.notification();
            }
            onArchive();
          }}
          style={[
            styles.archiveBadge,
            {
              backgroundColor: noteContent.trim().length > 0 ? theme.card : 'transparent',
              borderColor: noteContent.trim().length > 0 ? theme.border : 'transparent',
            },
          ]}
          accessibilityLabel="Archive current note"
          testID="btn-archive"
          activeOpacity={0.7}
        >
          <ArchiveIcon size={15} color={noteContent.trim().length > 0 ? theme.text : theme.textMuted} strokeWidth={1.5} />
          <Text
            style={[
              styles.archiveLabel,
              {
                color: noteContent.trim().length > 0 ? theme.text : theme.textMuted,
                fontFamily,
              },
            ]}
          >
            Archive
          </Text>
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
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 14,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ghostButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  pinButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  archiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  archiveLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
});
