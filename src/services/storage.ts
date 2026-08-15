import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '../types/note';
import { UserPreferences, defaultPreferences, BackupPayload } from '../types/settings';

const STORAGE_KEYS = {
  ACTIVE_NOTE: '@zeronote:active_note',
  ARCHIVED_NOTES: '@zeronote:archived_notes',
  PREFERENCES: '@zeronote:preferences',
};

export const ONBOARDING_NOTE_CONTENT = `Ø Zero Note

- One active note at a time
- Everything saves automatically
- Pin keeps this note on your lock screen
- Archive saves and clears the canvas
- History searches past archived notes

Tap Ø above for preferences and backup.`;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export class StorageService {
  async getActiveNote(): Promise<Note> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_NOTE);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading active note from storage:', e);
    }
    const defaultNote: Note = {
      id: generateId(),
      content: ONBOARDING_NOTE_CONTENT,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: false,
    };
    await this.saveActiveNote(defaultNote.content, defaultNote.isPinned, defaultNote.id);
    return defaultNote;
  }

  async saveActiveNote(content: string, isPinned = false, id?: string): Promise<Note> {
    const existing = await this.getActiveNoteSafe();
    const note: Note = {
      id: id || existing?.id || generateId(),
      content,
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
      isPinned: isPinned !== undefined ? isPinned : existing?.isPinned || false,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_NOTE, JSON.stringify(note));
    return note;
  }

  private async getActiveNoteSafe(): Promise<Note | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_NOTE);
      if (data) return JSON.parse(data);
    } catch {
      // return null
    }
    return null;
  }

  async archiveActiveNote(): Promise<Note> {
    const active = await this.getActiveNote();
    const archivedNote: Note = {
      ...active,
      archivedAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Only save to archive history if note is not completely blank
    if (archivedNote.content.trim().length > 0) {
      const archivedNotes = await this.getArchivedNotes();
      const updatedList = [archivedNote, ...archivedNotes];
      await AsyncStorage.setItem(STORAGE_KEYS.ARCHIVED_NOTES, JSON.stringify(updatedList));
    }

    // Reset active note to a clean blank note
    const newActive: Note = {
      id: generateId(),
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: active.isPinned,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_NOTE, JSON.stringify(newActive));
    return archivedNote;
  }

  async getArchivedNotes(): Promise<Note[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ARCHIVED_NOTES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading archived notes:', e);
    }
    return [];
  }

  async restoreArchivedNote(noteId: string): Promise<Note | null> {
    const archivedNotes = await this.getArchivedNotes();
    const target = archivedNotes.find((n) => n.id === noteId);
    if (!target) return null;

    // Set target content as active note
    const restoredNote: Note = {
      id: generateId(),
      content: target.content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: target.isPinned || false,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_NOTE, JSON.stringify(restoredNote));
    return restoredNote;
  }

  async deleteArchivedNote(noteId: string): Promise<boolean> {
    const archivedNotes = await this.getArchivedNotes();
    const updatedList = archivedNotes.filter((n) => n.id !== noteId);
    await AsyncStorage.setItem(STORAGE_KEYS.ARCHIVED_NOTES, JSON.stringify(updatedList));
    return true;
  }

  async clearActiveNote(autoArchive = true): Promise<Note> {
    const active = await this.getActiveNote();

    if (autoArchive && active.content.trim().length > 0) {
      const archivedNote: Note = {
        ...active,
        archivedAt: Date.now(),
        updatedAt: Date.now(),
      };
      const archivedNotes = await this.getArchivedNotes();
      await AsyncStorage.setItem(STORAGE_KEYS.ARCHIVED_NOTES, JSON.stringify([archivedNote, ...archivedNotes]));
    }

    const cleared: Note = {
      id: generateId(),
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: active.isPinned,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_NOTE, JSON.stringify(cleared));
    return cleared;
  }

  async reloadOnboardingNote(): Promise<Note> {
    const note: Note = {
      id: generateId(),
      content: ONBOARDING_NOTE_CONTENT,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: false,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_NOTE, JSON.stringify(note));
    return note;
  }

  async getPreferences(): Promise<UserPreferences> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (data) {
        return { ...defaultPreferences, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Error reading preferences:', e);
    }
    return defaultPreferences;
  }

  async savePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.getPreferences();
    const updated = { ...current, ...prefs };
    await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    return updated;
  }

  async exportBackup(): Promise<string> {
    const active = await this.getActiveNote();
    const archived = await this.getArchivedNotes();
    const prefs = await this.getPreferences();

    const payload: BackupPayload = {
      version: 1,
      exportedAt: Date.now(),
      activeNote: active,
      archivedNotes: archived as any,
      preferences: prefs,
    };

    return JSON.stringify(payload, null, 2);
  }

  async importBackup(jsonString: string): Promise<boolean> {
    try {
      const payload: BackupPayload = JSON.parse(jsonString);
      if (!payload.activeNote) return false;

      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_NOTE, JSON.stringify(payload.activeNote));
      if (Array.isArray(payload.archivedNotes)) {
        await AsyncStorage.setItem(STORAGE_KEYS.ARCHIVED_NOTES, JSON.stringify(payload.archivedNotes));
      }
      if (payload.preferences) {
        await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(payload.preferences));
      }
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  }

  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  }
}

export const storageService = new StorageService();
