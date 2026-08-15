export interface Note {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  archivedAt?: number;
  isPinned: boolean;
}

export interface NoteStats {
  words: number;
  chars: number;
  lines: number;
  readingTimeSec: number;
}
