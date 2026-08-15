import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { parseMarkdownLines, toggleChecklistLine } from '../utils/markdownParser';
import { ChecklistItem } from './ChecklistItem';

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
  const [isFocused, setIsFocused] = useState(false);

  const parsedLines = useMemo(() => parseMarkdownLines(content), [content]);
  const hasChecklistItems = useMemo(
    () => parsedLines.some((l) => l.type === 'checklist'),
    [parsedLines]
  );

  const handleToggleChecklist = (lineIndex: number) => {
    const updated = toggleChecklistLine(content, lineIndex);
    onChangeContent(updated);
  };

  const handleInsertChecklist = () => {
    const newContent = content.length > 0 ? `${content}\n- [ ] ` : '- [ ] ';
    onChangeContent(newContent);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
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
        {/* Interactive checklist block when viewing */}
        {!isFocused && hasChecklistItems && (
          <View style={styles.checklistSection}>
            {parsedLines
              .filter((l) => l.type === 'checklist')
              .map((line) => (
                <ChecklistItem
                  key={`check-${line.index}`}
                  text={line.text}
                  checked={line.checked || false}
                  onToggle={() => handleToggleChecklist(line.index)}
                  hapticsEnabled={hapticsEnabled}
                />
              ))}
          </View>
        )}

        {/* Full Note TextInput */}
        <TextInput
          ref={inputRef}
          multiline
          autoFocus={content.length === 0}
          value={content}
          onChangeText={onChangeContent}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
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

        {/* Floating subtle + Task shortcut */}
        {isFocused && (
          <TouchableOpacity
            onPress={handleInsertChecklist}
            style={[styles.quickTaskBtn, { borderColor: theme.borderSubtle }]}
            testID="btn-insert-task"
            activeOpacity={0.6}
          >
            <Text style={[styles.quickTaskText, { color: theme.textMuted, fontFamily, fontSize: typeScale.caption }]}>
              + task
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 60,
  },
  checklistSection: {
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    minHeight: 400,
    padding: 0,
    margin: 0,
    letterSpacing: -0.2,
  },
  quickTaskBtn: {
    marginTop: 24,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    borderRadius: 6,
    borderWidth: 1,
  },
  quickTaskText: {
    letterSpacing: 0.5,
  },
});
