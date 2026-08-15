import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Share } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ZeroLogo, SettingsIcon, HistoryIcon, PinIcon, ShareIcon, ArchiveIcon } from './Icons';
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

  const hasContent = noteContent.trim().length > 0;

  return (
    <View style={styles.container}>
      {/* Left side: Iconic Ø logo mark & Archive History drawer */}
      <View style={styles.leftGroup}>
        <View style={styles.logoMarkWrapper} testID="app-logo-mark">
          <ZeroLogo size={20} color={theme.text} strokeWidth={2} />
        </View>

        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            onOpenArchive();
          }}
          style={styles.ghostButton}
          accessibilityLabel="Archived Notes"
          testID="btn-history"
          activeOpacity={0.6}
        >
          <HistoryIcon size={18} color={theme.textMuted} strokeWidth={1.4} />
        </TouchableOpacity>
      </View>

      {/* Right side: Lock Screen Pin, Share, Archive, Settings */}
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

        {hasContent && (
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
        )}

        {/* Mononote Archive Action: Archives current note & clears canvas */}
        <TouchableOpacity
          onPress={() => {
            if (!hasContent) return;
            if (hapticsEnabled) {
              safeHaptics.notification();
            }
            onArchive();
          }}
          style={[
            styles.archiveBadge,
            {
              backgroundColor: hasContent ? theme.card : 'transparent',
              borderColor: hasContent ? theme.border : 'transparent',
              opacity: hasContent ? 1 : 0.4,
            },
          ]}
          disabled={!hasContent}
          accessibilityLabel="Archive note"
          testID="btn-archive"
          activeOpacity={0.7}
        >
          <ArchiveIcon size={14} color={hasContent ? theme.text : theme.textMuted} strokeWidth={1.5} />
          <Text
            style={[
              styles.archiveLabel,
              {
                color: hasContent ? theme.text : theme.textMuted,
                fontFamily,
              },
            ]}
          >
            Archive
          </Text>
        </TouchableOpacity>

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
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 12,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMarkWrapper: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  archiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  archiveLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
});
