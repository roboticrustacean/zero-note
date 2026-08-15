import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { NotesProvider, useNotes } from './src/context/NotesContext';
import { EditorScreen } from './src/screens/EditorScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { FluidModal } from './src/components/FluidModal';
import { notificationService } from './src/services/notificationService';

const MainApp: React.FC = () => {
  const { theme } = useTheme();
  const { activeNote } = useNotes();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync active note to lock screen notification whenever it changes
  useEffect(() => {
    notificationService.updateLockScreenNotification(activeNote.content, activeNote.isPinned);
  }, [activeNote.content, activeNote.isPinned]);

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.canvas }]}>
      <View
        style={[
          styles.innerFrame,
          {
            backgroundColor: theme.canvas,
            borderColor: theme.borderSubtle,
          },
        ]}
      >
        <StatusBar style={theme.statusBar} />

        <EditorScreen onOpenSettings={() => setIsSettingsOpen(true)} />

        {/* Fluid Spring Settings Modal */}
        <FluidModal
          visible={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          variant="sheet"
        >
          <SettingsScreen onClose={() => setIsSettingsOpen(false)} />
        </FluidModal>
      </View>
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
  outerContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerFrame: {
    flex: 1,
    height: '100%',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 520 : undefined,
    borderLeftWidth: Platform.OS === 'web' ? 1 : 0,
    borderRightWidth: Platform.OS === 'web' ? 1 : 0,
  },
});
