import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../theme/ThemeContext';
import { Note } from '../types/note';
import { calculateNoteStats, formatTimeAgo } from '../utils/markdownParser';
import { RestoreIcon, CopyIcon, TrashIcon } from './Icons';
import { safeHaptics } from '../utils/haptics';

interface ArchiveCardProps {
  note: Note;
  onRestore: (noteId: string) => void;
  onDelete: (noteId: string) => void;
  hapticsEnabled?: boolean;
}

export const ArchiveCard: React.FC<ArchiveCardProps> = ({
  note,
  onRestore,
  onDelete,
  hapticsEnabled = true,
}) => {
  const { theme, fontFamily, typeScale } = useTheme();
  const stats = calculateNoteStats(note.content);

  const lines = note.content.split('\n').filter((l) => l.trim().length > 0);
  const title = lines.length > 0 ? lines[0].replace(/^[#\-*•\[\]\s]+/, '') : 'Empty note';
  const preview = lines.length > 1 ? lines.slice(1, 3).join(' · ') : '';

  const triggerHaptic = () => {
    if (hapticsEnabled) {
      safeHaptics.impact();
    }
  };

  const handleCopy = async () => {
    triggerHaptic();
    await Clipboard.setStringAsync(note.content);
    Alert.alert('Copied', 'Note copied to clipboard');
  };

  const handleRestore = () => {
    triggerHaptic();
    onRestore(note.id);
  };

  const handleDelete = () => {
    triggerHaptic();
    onDelete(note.id);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
      testID={`archive-card-${note.id}`}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.timeText, { color: theme.textMuted, fontFamily, fontSize: typeScale.caption }]}>
          {formatTimeAgo(note.archivedAt || note.updatedAt)}  ·  {stats.words} words
        </Text>
      </View>

      <Text
        style={[
          styles.titleText,
          {
            color: theme.text,
            fontFamily,
            fontSize: typeScale.body,
          },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>

      {preview.length > 0 && (
        <Text
          style={[
            styles.previewText,
            {
              color: theme.textMuted,
              fontFamily,
              fontSize: typeScale.caption,
            },
          ]}
          numberOfLines={2}
        >
          {preview}
        </Text>
      )}

      <View style={[styles.cardFooter, { borderTopColor: theme.borderSubtle }]}>
        <TouchableOpacity
          onPress={handleRestore}
          style={[styles.restoreBtn, { borderColor: theme.border, backgroundColor: theme.cardActive }]}
          testID={`btn-restore-${note.id}`}
          activeOpacity={0.7}
        >
          <RestoreIcon size={14} color={theme.text} strokeWidth={1.5} />
          <Text style={[styles.restoreBtnText, { color: theme.text, fontFamily, fontSize: typeScale.caption }]}>
            Restore
          </Text>
        </TouchableOpacity>

        <View style={styles.rightActions}>
          <TouchableOpacity
            onPress={handleCopy}
            style={styles.iconBtn}
            testID={`btn-copy-${note.id}`}
            accessibilityLabel="Copy note"
            activeOpacity={0.6}
          >
            <CopyIcon size={16} color={theme.textMuted} strokeWidth={1.4} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            style={styles.iconBtn}
            testID={`btn-delete-${note.id}`}
            accessibilityLabel="Delete note"
            activeOpacity={0.6}
          >
            <TrashIcon size={16} color="#E06C75" strokeWidth={1.4} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    marginBottom: 6,
  },
  timeText: {
    letterSpacing: 0.2,
  },
  titleText: {
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  previewText: {
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    marginTop: 4,
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  restoreBtnText: {
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 6,
  },
});
