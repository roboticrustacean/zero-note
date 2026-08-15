import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Note, NoteStats } from '../types/note';
import { UserPreferences, defaultPreferences } from '../types/settings';
import { storageService } from '../services/storage';
import { calculateNoteStats } from '../utils/markdownParser';

interface NotesContextValue {
  activeNote: Note;
  archivedNotes: Note[];
  preferences: UserPreferences;
  stats: NoteStats;
  isLoading: boolean;
  isSaving: boolean;
  updateActiveNoteContent: (content: string) => void;
  togglePinActiveNote: () => Promise<void>;
  archiveCurrentNote: () => Promise<Note>;
  restoreNote: (noteId: string) => Promise<boolean>;
  deleteNote: (noteId: string) => Promise<void>;
  clearCurrentNote: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  refreshArchivedNotes: () => Promise<void>;
  exportData: () => Promise<string>;
  importData: (json: string) => Promise<boolean>;
}

const NotesContext = createContext<NotesContextValue | undefined>(undefined);

export const NotesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeNote, setActiveNote] = useState<Note>({
    id: 'init',
    content: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isPinned: false,
  });
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Initialize data on mount
  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      try {
        const [note, archived, prefs] = await Promise.all([
          storageService.getActiveNote(),
          storageService.getArchivedNotes(),
          storageService.getPreferences(),
        ]);
        if (isMounted) {
          setActiveNote(note);
          setArchivedNotes(archived);
          setPreferences(prefs);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
        if (isMounted) setIsLoading(false);
      }
    }
    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = calculateNoteStats(activeNote.content);

  // Debounced auto-save on typing
  const updateActiveNoteContent = useCallback(
    (content: string) => {
      setActiveNote((prev) => ({
        ...prev,
        content,
        updatedAt: Date.now(),
      }));

      setIsSaving(true);
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      const timeout = setTimeout(async () => {
        try {
          await storageService.saveActiveNote(content, activeNote.isPinned, activeNote.id);
        } catch (e) {
          console.error('Error auto-saving note:', e);
        } finally {
          setIsSaving(false);
        }
      }, preferences.autoSaveDelayMs || 150);

      setSaveTimeout(timeout);
    },
    [activeNote.id, activeNote.isPinned, preferences.autoSaveDelayMs, saveTimeout]
  );

  const togglePinActiveNote = useCallback(async () => {
    const newPinned = !activeNote.isPinned;
    const updated = await storageService.saveActiveNote(activeNote.content, newPinned, activeNote.id);
    setActiveNote(updated);
  }, [activeNote]);

  const archiveCurrentNote = useCallback(async () => {
    const archived = await storageService.archiveActiveNote();
    const [newActive, refreshedArchived] = await Promise.all([
      storageService.getActiveNote(),
      storageService.getArchivedNotes(),
    ]);
    setActiveNote(newActive);
    setArchivedNotes(refreshedArchived);
    return archived;
  }, []);

  const restoreNote = useCallback(async (noteId: string) => {
    const restored = await storageService.restoreArchivedNote(noteId);
    if (restored) {
      setActiveNote(restored);
      return true;
    }
    return false;
  }, []);

  const deleteNote = useCallback(async (noteId: string) => {
    await storageService.deleteArchivedNote(noteId);
    const refreshed = await storageService.getArchivedNotes();
    setArchivedNotes(refreshed);
  }, []);

  const clearCurrentNote = useCallback(async () => {
    const cleared = await storageService.clearActiveNote();
    setActiveNote(cleared);
  }, []);

  const updatePreferences = useCallback(async (prefs: Partial<UserPreferences>) => {
    const updated = await storageService.savePreferences(prefs);
    setPreferences(updated);
  }, []);

  const refreshArchivedNotes = useCallback(async () => {
    const refreshed = await storageService.getArchivedNotes();
    setArchivedNotes(refreshed);
  }, []);

  const exportData = useCallback(async () => {
    return storageService.exportBackup();
  }, []);

  const importData = useCallback(async (json: string) => {
    const success = await storageService.importBackup(json);
    if (success) {
      const [note, archived, prefs] = await Promise.all([
        storageService.getActiveNote(),
        storageService.getArchivedNotes(),
        storageService.getPreferences(),
      ]);
      setActiveNote(note);
      setArchivedNotes(archived);
      setPreferences(prefs);
      return true;
    }
    return false;
  }, []);

  return (
    <NotesContext.Provider
      value={{
        activeNote,
        archivedNotes,
        preferences,
        stats,
        isLoading,
        isSaving,
        updateActiveNoteContent,
        togglePinActiveNote,
        archiveCurrentNote,
        restoreNote,
        deleteNote,
        clearCurrentNote,
        updatePreferences,
        refreshArchivedNotes,
        exportData,
        importData,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = (): NotesContextValue => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
