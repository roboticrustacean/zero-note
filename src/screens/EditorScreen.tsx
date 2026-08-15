import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useNotes } from '../context/NotesContext';
import { HeaderBar } from '../components/HeaderBar';
import { Editor } from '../components/Editor';
import { FooterBar } from '../components/FooterBar';

interface EditorScreenProps {
  onOpenSettings: () => void;
  onOpenArchive: () => void;
}

export const EditorScreen: React.FC<EditorScreenProps> = ({
  onOpenSettings,
  onOpenArchive,
}) => {
  const { theme } = useTheme();
  const {
    activeNote,
    stats,
    isLoading,
    updateActiveNoteContent,
    archiveCurrentNote,
    preferences,
  } = useNotes();

  const [isHovered, setIsHovered] = useState(true);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.canvas }]}>
        <View style={styles.center}>
          <ActivityIndicator size="small" color={theme.textMuted} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.canvas }]}
      {...({
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      } as any)}
    >
      <HeaderBar
        onArchive={archiveCurrentNote}
        onOpenSettings={onOpenSettings}
        onOpenArchive={onOpenArchive}
        noteContent={activeNote.content}
        hapticsEnabled={preferences.hapticsEnabled}
        isHovered={isHovered}
      />

      <View style={styles.editorArea}>
        <Editor
          content={activeNote.content}
          onChangeContent={updateActiveNoteContent}
          hapticsEnabled={preferences.hapticsEnabled}
        />
      </View>

      <FooterBar
        stats={stats}
        visible={preferences.showWordCount}
        isHovered={isHovered}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorArea: {
    flex: 1,
  },
});
