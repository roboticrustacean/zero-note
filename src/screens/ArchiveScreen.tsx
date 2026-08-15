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
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useNotes } from '../context/NotesContext';
import { ArchiveCard } from '../components/ArchiveCard';

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
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily, fontSize: typeScale.headerTitle }]}>
          Archive History
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} testID="btn-close-archive">
          <Text style={[styles.closeText, { color: theme.textSecondary, fontFamily }]}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { borderBottomColor: theme.borderSubtle }]}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search archived notes..."
          placeholderTextColor={theme.textMuted}
          style={[
            styles.searchInput,
            {
              color: theme.text,
              backgroundColor: theme.card,
              borderColor: theme.border,
              fontFamily,
              fontSize: typeScale.body,
            },
          ]}
          autoCapitalize="none"
          autoCorrect={false}
          testID="input-search-archive"
        />
      </View>

      {/* Notes List */}
      <ScrollView contentContainerStyle={styles.listContent}>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  closeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeText: {
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    letterSpacing: -0.2,
  },
});
