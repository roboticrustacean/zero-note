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

  // Handle typing transformations (auto-brackets and auto-dashed strikethrough)
  const handleChangeText = (text: string) => {
    // 1. Auto-expand [] or [ ] to - [ ]
    let updated = text;
    if (updated.endsWith('[] ') || updated.endsWith('[ ] ') || updated.includes('\n[] ') || updated.includes('\n[ ] ')) {
      updated = updated
        .replace(/(^|\n)\[\]\s/g, '$1- [ ] ')
        .replace(/(^|\n)\[ \]\s/g, '$1- [ ] ')
        .replace(/(^|\n)\[x\]\s/g, '$1- [x] ');
    }

    // 2. Auto-format dashed strikethrough (~~text~~) when [x] is marked or unmarked
    const formatted = formatCheckedLinesInText(updated);
    if (formatted !== text) {
      if (hapticsEnabled) safeHaptics.impact();
      onChangeContent(formatted);
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

  // Track cursor position
  const handleSelectionChange = (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    lastSelectionRef.current = e.nativeEvent.selection;
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
