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

  // Toggle task status when the text-based [ ] or [x] magic construct is clicked
  const handleToggleTask = (lineIndex: number) => {
    if (hapticsEnabled) {
      safeHaptics.impact();
    }
    // Toggle checkmark and move completed task to bottom of the block
    const updated = toggleChecklistLine(content, lineIndex, true);
    onChangeContent(updated);
  };

  // Smart typing expansion (typing [] or [ ] expands to - [ ])
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
        // Empty task line - remove task prefix to end checklist
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
        {/* Magic Text-Based Checklist View (Text based [ ] / [x] construct buttons) */}
        {!isEditing && hasChecklist ? (
          <TouchableWithoutFeedback onPress={handleCanvasDoubleTap}>
            <View style={styles.interactiveCanvas}>
              {parsedLines.map((line) => {
                if (line.type === 'checklist') {
                  const isChecked = line.checked || false;
                  return (
                    <View key={`line-${line.index}`} style={styles.taskLine}>
                      {/* Literal Dash Separator */}
                      <Text
                        style={[
                          styles.dashPrefix,
                          { color: theme.textMuted, fontFamily, fontSize: typeScale.editor },
                        ]}
                      >
                        -{' '}
                      </Text>

                      {/* Pure Text-Based Magic Bracket Token [ ] / [x] */}
                      <TouchableOpacity
                        onPress={() => handleToggleTask(line.index)}
                        style={[
                          styles.magicBracketBadge,
                          {
                            backgroundColor: isChecked ? theme.cardActive : theme.card,
                            borderColor: isChecked ? theme.textMuted : theme.border,
                          },
                        ]}
                        activeOpacity={0.6}
                        accessibilityLabel={`Toggle task: ${line.text}`}
                        testID={`btn-toggle-task-${line.index}`}
                      >
                        <Text
                          style={[
                            styles.magicBracketText,
                            {
                              color: isChecked ? theme.textMuted : theme.text,
                              fontFamily,
                              fontSize: typeScale.editor * 0.95,
                              fontWeight: isChecked ? '700' : '500',
                            },
                          ]}
                        >
                          {isChecked ? '[x]' : '[ ]'}
                        </Text>
                      </TouchableOpacity>

                      {/* Task Text next to it with dashed / strikethrough styling */}
                      <TouchableOpacity
                        onPress={() => {
                          setIsEditing(true);
                          setTimeout(() => inputRef.current?.focus(), 50);
                        }}
                        style={styles.taskContentWrapper}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.taskText,
                            {
                              color: isChecked ? theme.textMuted : theme.text,
                              fontFamily,
                              fontSize: typeScale.editor,
                              lineHeight: typeScale.editor * 1.7,
                              textDecorationLine: isChecked ? 'line-through' : 'none',
                              opacity: isChecked ? 0.45 : 1,
                            },
                          ]}
                        >
                          {' '}{line.text}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                }

                if (line.type === 'empty') {
                  return (
                    <View
                      key={`line-${line.index}`}
                      style={{ height: typeScale.editor * 1.2 }}
                    />
                  );
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
  taskLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 1,
  },
  dashPrefix: {
    letterSpacing: -0.2,
    opacity: 0.7,
  },
  magicBracketBadge: {
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  magicBracketText: {
    letterSpacing: 0.5,
  },
  taskContentWrapper: {
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
