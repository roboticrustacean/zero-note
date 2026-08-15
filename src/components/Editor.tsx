import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { parseMarkdownLines, toggleChecklistLine } from '../utils/markdownParser';
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
  const [isEditing, setIsEditing] = useState(false);

  const parsedLines = useMemo(() => parseMarkdownLines(content), [content]);
  const hasChecklist = useMemo(
    () => parsedLines.some((l) => l.type === 'checklist'),
    [parsedLines]
  );

  // Toggle task status when checkbox is tapped
  const handleToggleTask = (lineIndex: number) => {
    if (hapticsEnabled) {
      safeHaptics.impact();
    }
    const updated = toggleChecklistLine(content, lineIndex);
    onChangeContent(updated);
  };

  // Smart typing expansion (e.g. typing [] -> - [ ])
  const handleChangeText = (text: string) => {
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
      const lines = content.split('\n');
      const lastLine = lines[lines.length - 1];

      if (lastLine === '- [ ] ' || lastLine === '- [x] ') {
        // Empty task line - remove task prefix
        const trimmed = lines.slice(0, -1).join('\n') + '\n';
        onChangeContent(trimmed);
      }
    }
  };

  // Double-tap anywhere on canvas creates a new task [- [ ] ]
  const handleCanvasDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (hapticsEnabled) {
        safeHaptics.impact();
      }
      const prefix = content.length === 0 || content.endsWith('\n') ? '' : '\n';
      const newContent = `${content}${prefix}- [ ] `;
      onChangeContent(newContent);
      lastTapRef.current = 0;
      setIsEditing(true);
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
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Interactive checklist view when not actively typing */}
        {!isEditing && hasChecklist ? (
          <TouchableWithoutFeedback onPress={handleCanvasDoubleTap}>
            <View style={styles.interactiveCanvas}>
              {parsedLines.map((line) => {
                if (line.type === 'checklist') {
                  return (
                    <View key={`line-${line.index}`} style={styles.taskRow}>
                      <TouchableOpacity
                        onPress={() => handleToggleTask(line.index)}
                        style={[
                          styles.checkbox,
                          {
                            borderColor: line.checked ? theme.textMuted : theme.text,
                            backgroundColor: line.checked ? theme.cardActive : 'transparent',
                          },
                        ]}
                        activeOpacity={0.6}
                        accessibilityLabel={`Toggle task: ${line.text}`}
                        testID={`btn-toggle-task-${line.index}`}
                      >
                        {line.checked && (
                          <View style={[styles.checkboxInner, { backgroundColor: theme.text }]} />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setIsEditing(true);
                          setTimeout(() => inputRef.current?.focus(), 50);
                        }}
                        style={styles.taskTextWrapper}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.taskText,
                            {
                              color: line.checked ? theme.textMuted : theme.text,
                              fontFamily,
                              fontSize: typeScale.editor,
                              lineHeight: typeScale.editor * 1.7,
                              textDecorationLine: line.checked ? 'line-through' : 'none',
                              opacity: line.checked ? 0.55 : 1,
                            },
                          ]}
                        >
                          {line.text}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                }

                if (line.type === 'empty') {
                  return <View key={`line-${line.index}`} style={{ height: typeScale.editor * 1.2 }} />;
                }

                return (
                  <TouchableOpacity
                    key={`line-${line.index}`}
                    onPress={() => {
                      setIsEditing(true);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.plainText,
                        {
                          color: theme.text,
                          fontFamily,
                          fontSize: typeScale.editor,
                          lineHeight: typeScale.editor * 1.7,
                          fontWeight: line.type === 'heading' ? '700' : '400',
                        },
                      ]}
                    >
                      {line.raw}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <TouchableWithoutFeedback onPress={handleCanvasDoubleTap}>
            <TextInput
              ref={inputRef}
              multiline
              autoFocus={content.length === 0}
              value={content}
              onChangeText={handleChangeText}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
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
          </TouchableWithoutFeedback>
        )}
      </ScrollView>
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
    paddingHorizontal: 26,
    paddingTop: 12,
    paddingBottom: 40,
  },
  interactiveCanvas: {
    flex: 1,
    minHeight: 400,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
    gap: 10,
  },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  checkboxInner: {
    width: 9,
    height: 9,
    borderRadius: 2,
  },
  taskTextWrapper: {
    flex: 1,
  },
  taskText: {
    letterSpacing: -0.2,
  },
  plainText: {
    letterSpacing: -0.2,
    marginVertical: 1,
  },
  textInput: {
    flex: 1,
    minHeight: 400,
    padding: 0,
    margin: 0,
    letterSpacing: -0.2,
  },
});
