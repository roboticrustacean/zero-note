import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useNotes } from '../context/NotesContext';
import { ArchiveCard } from '../components/ArchiveCard';
import { CloseIcon } from '../components/Icons';

interface ArchiveScreenProps {
  onClose: () => void;
}

export const ArchiveScreen: React.FC<ArchiveScreenProps> = ({ onClose }) => {
  const { theme, fontFamily, typeScale } = useTheme();
  const { archivedNotes, restoreNote, deleteNote, activeNote, preferences } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return archivedNotes;
    const q = searchQuery.toLowerCase();
    return archivedNotes.filter((note) => note.content.toLowerCase().includes(q));
  }, [archivedNotes, searchQuery]);

  const handleRestore = (noteId: string) => {
    if (activeNote.content.trim().length > 0) {
      Alert.alert(
        'Replace Active Note?',
        'Restoring will replace the current active note. Do you want to continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: async () => {
              await restoreNote(noteId);
              onClose();
            },
          },
        ]
      );
    } else {
      restoreNote(noteId);
      onClose();
    }
  };

  const handleDelete = (noteId: string) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this archived note permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteNote(noteId),
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.canvas }]}>
      {/* Minimal Header */}
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily, fontSize: typeScale.headerTitle }]}>
          Archive
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} testID="btn-close-archive" activeOpacity={0.6}>
          <CloseIcon size={18} color={theme.textMuted} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      {/* Subtle Search Bar */}
      <View style={[styles.searchContainer, { borderBottomColor: theme.borderSubtle }]}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search archive..."
          placeholderTextColor={theme.textMuted}
          style={[
            styles.searchInput,
            {
              color: theme.text,
              backgroundColor: theme.card,
              borderColor: theme.border,
              fontFamily,
              fontSize: typeScale.body,
              ...(Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : {}),
            },
          ]}
          autoCapitalize="none"
          autoCorrect={false}
          testID="input-search-archive"
        />
      </View>

      {/* Notes List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textMuted, fontFamily, fontSize: typeScale.body }]}>
              {searchQuery ? 'No matching notes found.' : 'No archived notes yet.'}
            </Text>
          </View>
        ) : (
          filteredNotes.map((note) => (
            <ArchiveCard
              key={note.id}
              note={note}
              onRestore={handleRestore}
              onDelete={handleDelete}
              hapticsEnabled={preferences.hapticsEnabled}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  searchInput: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  listContent: {
    padding: 24,
    paddingBottom: 50,
  },
  emptyContainer: {
    paddingVertical: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    letterSpacing: -0.2,
    opacity: 0.6,
  },
});
