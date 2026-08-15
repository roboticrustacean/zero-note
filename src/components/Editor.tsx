import React, { useRef } from 'react';
import {
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  TextInputSelectionChangeEventData,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { formatCheckedLinesInText } from '../utils/markdownParser';
import { safeHaptics } from '../utils/haptics';

interface EditorProps {
  content: string;
  onChangeContent: (text: string) => void;
  hapticsEnabled?: boolean;
}

export const Editor: React.FC<EditorProps> = ({
  content,
  onChangeContent,
  hapticsEnabled = true,
}) => {
  const { theme, fontFamily, typeScale } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const lastTapRef = useRef<number>(0);
  const lastSelectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const isTogglingRef = useRef<boolean>(false);

  // Detect if cursor position is on or inside a task bracket [ ] or [x]
  const checkAndToggleBracketAtPos = (pos: number): boolean => {
    if (isTogglingRef.current) return false;

    const lines = content.split('\n');
    let charCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineStart = charCount;
      const lineEnd = lineStart + line.length;

      if (pos >= lineStart && pos <= lineEnd + 1) {
        // Line found
        const match = line.match(/^(\s*[-*]?\s*)\[([ xX])\]\s*(.*)$/);
        if (match) {
          const prefixLen = match[1].length;
          const bracketStart = lineStart + prefixLen; // index of '['
          const bracketEnd = bracketStart + 3; // index after ']' (e.g. '[ ]' or '[x]')

          // If the click/cursor is directly inside or on the [ ] / [x] block
          if (pos >= bracketStart && pos <= bracketEnd) {
            isTogglingRef.current = true;
            if (hapticsEnabled) safeHaptics.impact();

            const isChecked = match[2].toLowerCase() === 'x';
            const prefix = match[1] || '- ';
            let itemText = match[3].trim();

            // Strip any accidental tildes
            if (itemText.startsWith('~~') && itemText.endsWith('~~')) {
              itemText = itemText.substring(2, itemText.length - 2);
            }

            const nextMark = isChecked ? '[ ]' : '[x]';
            const newLine = `${prefix.trimEnd()} ${nextMark} ${itemText}`.trim();

            lines[i] = newLine;
            const updatedContent = lines.join('\n');
            onChangeContent(updatedContent);

            setTimeout(() => {
              isTogglingRef.current = false;
            }, 250);

            return true;
          }
        }
      }
      charCount = lineEnd + 1;
    }
    return false;
  };

  // Handle typing transformations (auto-brackets)
  const handleChangeText = (text: string) => {
    let updated = text;
    // 1. Auto-expand [] or [ ] to - [ ]
    if (
      updated.endsWith('[] ') ||
      updated.endsWith('[ ] ') ||
      updated.includes('\n[] ') ||
      updated.includes('\n[ ] ')
    ) {
      updated = updated
        .replace(/(^|\n)\[\]\s/g, '$1- [ ] ')
        .replace(/(^|\n)\[ \]\s/g, '$1- [ ] ')
        .replace(/(^|\n)\[x\]\s/g, '$1- [x] ');
    }

    // 2. Clean any legacy tildes
    const cleaned = formatCheckedLinesInText(updated);
    if (cleaned !== text) {
      onChangeContent(cleaned);
      return;
    }

    onChangeContent(text);
  };

  // Smart Enter key continuation for tasks
  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Enter') {
      const lines = content.split('\n');
      const lastLine = lines[lines.length - 1];

      if (lastLine === '- [ ] ' || lastLine === '- [x] ') {
        // Empty task line - clean up brackets to stop checklist
        const trimmed = lines.slice(0, -1).join('\n') + '\n';
        onChangeContent(trimmed);
      }
    }
  };

  // Track cursor position and detect clicks on [ ] whitespace
  const handleSelectionChange = (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    const sel = e.nativeEvent.selection;
    lastSelectionRef.current = sel;

    // Check if cursor clicked directly into [ ] or [x]
    if (sel.start === sel.end) {
      checkAndToggleBracketAtPos(sel.start);
    }
  };

  // Double-tap anywhere on canvas ALWAYS creates a new task line [- [ ] ]
  const handleCanvasDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected!
      if (hapticsEnabled) {
        safeHaptics.impact();
      }

      const cursorPos = lastSelectionRef.current.start;
      const before = content.substring(0, cursorPos);
      const after = content.substring(cursorPos);

      // Insert new task at cursor or at end of line
      const needsLeadingNewline = before.length > 0 && !before.endsWith('\n');
      const newTask = `${needsLeadingNewline ? '\n' : ''}- [ ] `;
      const newContent = `${before}${newTask}${after}`;

      onChangeContent(newContent);
      lastTapRef.current = 0;

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      lastTapRef.current = now;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={handleCanvasDoubleTap}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Always 100% Unified Text Surface */}
          <TextInput
            ref={inputRef}
            multiline
            autoFocus={content.length === 0}
            value={content}
            onChangeText={handleChangeText}
            onKeyPress={handleKeyPress}
            onSelectionChange={handleSelectionChange}
            placeholder="Start writing..."
            placeholderTextColor={theme.textMuted}
            style={[
              styles.textInput,
              {
                color: theme.text,
                fontFamily,
                fontSize: typeScale.editor,
                lineHeight: typeScale.editor * 1.7,
                ...(Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : {}),
              },
            ]}
            textAlignVertical="top"
            scrollEnabled={false}
            testID="note-editor-input"
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 40,
  },
  textInput: {
    flex: 1,
    minHeight: 450,
    padding: 0,
    margin: 0,
    letterSpacing: -0.2,
  },
});
