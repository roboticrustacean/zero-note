import { ThemeMode, FontFamilyMode, FontSizeScale } from '../theme/types';

export interface UserPreferences {
  theme: ThemeMode;
  fontFamily: FontFamilyMode;
  fontSize: FontSizeScale;
  lockScreenPinned: boolean;
  hapticsEnabled: boolean;
  showWordCount: boolean;
  autoSaveDelayMs: number;
}

export const defaultPreferences: UserPreferences = {
  theme: 'oled-dark',
  fontFamily: 'mono',
  fontSize: 'standard',
  lockScreenPinned: false,
  hapticsEnabled: true,
  showWordCount: true,
  autoSaveDelayMs: 150,
};

export interface BackupPayload {
  version: number;
  exportedAt: number;
  activeNote: {
    id: string;
    content: string;
    createdAt: number;
    updatedAt: number;
    isPinned: boolean;
  };
  archivedNotes: Array<{
    id: string;
    content: string;
    createdAt: number;
    updatedAt: number;
    archivedAt: number;
    isPinned: boolean;
  }>;
  preferences: UserPreferences;
}
