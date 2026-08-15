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
import { toggleChecklistLine } from '../utils/markdownParser';
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

  // Handle typing transformations (e.g. typing [] -> - [ ])
  const handleChangeText = (text: string) => {
    // Auto-expand [] or [ ] at beginning of line or after space
    if (text.endsWith('[] ') || text.endsWith('[ ] ') || text.includes('\n[] ') || text.includes('\n[ ] ')) {
      const replaced = text
        .replace(/(^|\n)\[\]\s/g, '$1- [ ] ')
        .replace(/(^|\n)\[ \]\s/g, '$1- [ ] ')
        .replace(/(^|\n)\[x\]\s/g, '$1- [x] ');
      if (replaced !== text) {
        if (hapticsEnabled) safeHaptics.impact();
        onChangeContent(replaced);
        return;
      }
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

  // Track cursor position for seamless bracket interactions
  const handleSelectionChange = (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    lastSelectionRef.current = e.nativeEvent.selection;
  };

  // Double-tap anywhere on canvas creates or toggles a task
  const handleCanvasDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected!
      if (hapticsEnabled) {
        safeHaptics.impact();
      }

      // Check if current cursor line is already a task - if so, toggle it
      const cursorPos = lastSelectionRef.current.start;
      const textBeforeCursor = content.substring(0, cursorPos);
      const currentLineIndex = textBeforeCursor.split('\n').length - 1;
      const lines = content.split('\n');
      const currentLine = lines[currentLineIndex] || '';

      if (currentLine.includes('[ ]') || currentLine.includes('[x]')) {
        // Toggle the task and move completed task to bottom of block
        const updated = toggleChecklistLine(content, currentLineIndex, true);
        onChangeContent(updated);
        lastTapRef.current = 0;
        return;
      }

      // Otherwise insert a new task line right at cursor or at end
      const prefix = content.length === 0 || content.endsWith('\n') ? '' : '\n';
      const newContent = `${content}${prefix}- [ ] `;
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
          {/* Always Unified Single Text Surface (Zero Mode-Switching, Zero Jumps) */}
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
