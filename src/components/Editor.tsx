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
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
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

  // Handle typing transformations (e.g. typing [] -> - [ ])
  const handleChangeText = (text: string) => {
    // Check if user just typed '[] ' or '[ ] '
    if (text.endsWith('[] ') || text.endsWith('[ ] ')) {
      const replaced = text
        .replace(/(^|\n)\[\]\s/g, '$1- [ ] ')
        .replace(/(^|\n)\[ \]\s/g, '$1- [ ] ');
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
      // Find current line and check if it's a checklist item
      const lines = content.split('\n');
      const lastLine = lines[lines.length - 1];

      if (lastLine === '- [ ] ' || lastLine === '- [x] ') {
        // Empty task line - user pressed enter again to stop checklist
        const trimmed = lines.slice(0, -1).join('\n') + '\n';
        onChangeContent(trimmed);
      }
    }
  };

  // Double-tap gesture: double tapping anywhere on the canvas inserts a task [- [ ] ]
  const handleCanvasDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected!
      if (hapticsEnabled) {
        safeHaptics.impact();
      }
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
          <TextInput
            ref={inputRef}
            multiline
            autoFocus={content.length === 0}
            value={content}
            onChangeText={handleChangeText}
            onKeyPress={handleKeyPress}
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
    minHeight: 400,
    padding: 0,
    margin: 0,
    letterSpacing: -0.2,
  },
});
