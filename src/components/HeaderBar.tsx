import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Share } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';

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
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // ignore
      }
    }
  };

  return (
    <View style={[styles.container, { borderBottomColor: theme.borderSubtle }]}>
      {/* Left side: Settings & Archive History */}
      <View style={styles.leftGroup}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            onOpenSettings();
          }}
          style={styles.iconButton}
          accessibilityLabel="Settings"
          testID="btn-settings"
        >
          <Text style={[styles.iconText, { color: theme.textSecondary, fontFamily }]}>⚙</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            onOpenArchive();
          }}
          style={styles.iconButton}
          accessibilityLabel="Archive History"
          testID="btn-history"
        >
          <Text style={[styles.iconText, { color: theme.textSecondary, fontFamily }]}>◫</Text>
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
            style={styles.iconButton}
            accessibilityLabel="Share note"
            testID="btn-share"
          >
            <Text style={[styles.iconText, { color: theme.textSecondary, fontFamily }]}>↗</Text>
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
        >
          <Text
            style={[
              styles.pinIcon,
              {
                color: isPinned ? theme.accent : theme.textMuted,
                fontFamily,
              },
            ]}
          >
            {isPinned ? '📌' : '📍'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (hapticsEnabled) {
              try {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch {
                // ignore
              }
            }
            onArchive();
          }}
          style={[styles.archiveButton, { borderColor: theme.border }]}
          accessibilityLabel="Archive current note"
          testID="btn-archive"
        >
          <Text style={[styles.archiveText, { color: theme.text, fontFamily }]}>Archive</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  iconText: {
    fontSize: 18,
  },
  pinButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pinIcon: {
    fontSize: 15,
  },
  archiveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  archiveText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
});
