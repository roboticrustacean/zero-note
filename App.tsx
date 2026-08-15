import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { NotesProvider, useNotes } from './src/context/NotesContext';
import { EditorScreen } from './src/screens/EditorScreen';
import { ArchiveScreen } from './src/screens/ArchiveScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { notificationService } from './src/services/notificationService';

const MainApp: React.FC = () => {
  const { theme } = useTheme();
  const { activeNote } = useNotes();
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync active note to lock screen notification whenever it changes
  useEffect(() => {
    notificationService.updateLockScreenNotification(activeNote.content, activeNote.isPinned);
  }, [activeNote.content, activeNote.isPinned]);

  return (
    <View style={[styles.root, { backgroundColor: theme.canvas }]}>
      <StatusBar style={theme.statusBar} />

      <EditorScreen
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenArchive={() => setIsArchiveOpen(true)}
      />

      {/* Archive Modal */}
      <Modal
        visible={isArchiveOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsArchiveOpen(false)}
      >
        <ArchiveScreen onClose={() => setIsArchiveOpen(false)} />
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={isSettingsOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsSettingsOpen(false)}
      >
        <SettingsScreen onClose={() => setIsSettingsOpen(false)} />
      </Modal>
    </View>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <NotesProvider>
        <MainApp />
      </NotesProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
