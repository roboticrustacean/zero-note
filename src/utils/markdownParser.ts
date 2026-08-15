import { NoteStats } from '../types/note';

export type LineType = 'heading' | 'checklist' | 'bullet' | 'paragraph' | 'empty';

export interface ParsedLine {
  index: number;
  type: LineType;
  raw: string;
  text: string;
  checked?: boolean;
  level?: number; // 1, 2, 3 for headings
}

const CHECKLIST_REGEX = /^(\s*[-*]?\s*)\[([ xX])\]\s*(.*)$/;
const HEADING_REGEX = /^(#{1,6})\s+(.*)$/;
const BULLET_REGEX = /^(\s*[-*•])\s+(.*)$/;

export function parseMarkdownLines(text: string): ParsedLine[] {
  if (!text) return [];
  const lines = text.split('\n');

  return lines.map((line, index) => {
    if (line.trim() === '') {
      return { index, type: 'empty', raw: line, text: '' };
    }

    const checklistMatch = line.match(CHECKLIST_REGEX);
    if (checklistMatch) {
      const isChecked = checklistMatch[2].toLowerCase() === 'x';
      const itemText = checklistMatch[3];
      return {
        index,
        type: 'checklist',
        raw: line,
        text: itemText,
        checked: isChecked,
      };
    }

    const headingMatch = line.match(HEADING_REGEX);
    if (headingMatch) {
      return {
        index,
        type: 'heading',
        raw: line,
        text: headingMatch[2],
        level: headingMatch[1].length,
      };
    }

    const bulletMatch = line.match(BULLET_REGEX);
    if (bulletMatch) {
      return {
        index,
        type: 'bullet',
        raw: line,
        text: bulletMatch[2],
      };
    }

    return {
      index,
      type: 'paragraph',
      raw: line,
      text: line,
    };
  });
}

export function toggleChecklistLine(fullText: string, lineIndex: number): string {
  const lines = fullText.split('\n');
  if (lineIndex < 0 || lineIndex >= lines.length) return fullText;

  const targetLine = lines[lineIndex];
  const match = targetLine.match(CHECKLIST_REGEX);
  if (!match) return fullText;

  const isChecked = match[2].toLowerCase() === 'x';
  const prefix = match[1] || '- ';
  const content = match[3];

  const newPrefix = prefix.includes('-') || prefix.includes('*') ? prefix : '- ';
  const newStatus = isChecked ? '[ ]' : '[x]';
  lines[lineIndex] = `${newPrefix.trimEnd()} ${newStatus} ${content}`.trim();

  return lines.join('\n');
}

export function calculateNoteStats(text: string): NoteStats {
  if (!text || text.trim().length === 0) {
    return {
      words: 0,
      chars: 0,
      lines: 0,
      readingTimeSec: 0,
    };
  }

  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter((w) => w.length > 0).length;
  const chars = text.length;
  const lines = text.split('\n').length;
  const readingTimeSec = Math.max(1, Math.round((words / 200) * 60));

  return {
    words,
    chars,
    lines,
    readingTimeSec,
  };
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diffSec = Math.floor((now - timestamp) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
