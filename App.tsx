import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { NotesProvider, useNotes } from './src/context/NotesContext';
import { EditorScreen } from './src/screens/EditorScreen';
import { ArchiveScreen } from './src/screens/ArchiveScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { FluidModal } from './src/components/FluidModal';
import { FloatingWindow } from './src/components/FloatingWindow';
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
    <FloatingWindow>
      <View style={[styles.innerContent, { backgroundColor: theme.canvas }]}>
        <StatusBar style={theme.statusBar} />

        <EditorScreen
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenArchive={() => setIsArchiveOpen(true)}
        />

        {/* Fluid Spring Archive Modal */}
        <FluidModal
          visible={isArchiveOpen}
          onClose={() => setIsArchiveOpen(false)}
          variant="sheet"
        >
          <ArchiveScreen onClose={() => setIsArchiveOpen(false)} />
        </FluidModal>

        {/* Fluid Spring Settings Modal */}
        <FluidModal
          visible={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          variant="sheet"
        >
          <SettingsScreen onClose={() => setIsSettingsOpen(false)} />
        </FluidModal>
      </View>
    </FloatingWindow>
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
  innerContent: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
});
