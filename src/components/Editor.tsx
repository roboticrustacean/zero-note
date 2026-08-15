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
      >
        {/* If user is not actively editing and there are checklist items, show interactive checkboxes at top */}
        {!isFocused && hasChecklistItems && (
          <View style={[styles.checklistOverlay, { borderBottomColor: theme.borderSubtle }]}>
            <View style={styles.checklistHeader}>
              <Text style={[styles.sectionLabel, { color: theme.textMuted, fontFamily, fontSize: typeScale.caption }]}>
                INTERACTIVE TASKS
              </Text>
              <TouchableOpacity onPress={() => inputRef.current?.focus()} style={styles.editButton}>
                <Text style={[styles.editButtonText, { color: theme.textSecondary, fontFamily, fontSize: typeScale.caption }]}>
                  Edit Raw
                </Text>
              </TouchableOpacity>
            </View>
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
          placeholder="Write your note..."
          placeholderTextColor={theme.textMuted}
          style={[
            styles.textInput,
            {
              color: theme.text,
              fontFamily,
              fontSize: typeScale.editor,
              lineHeight: typeScale.editor * 1.6,
              ...(Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : {}),
            },
          ]}
          textAlignVertical="top"
          scrollEnabled={false}
          testID="note-editor-input"
        />

        {/* Quick Insert Checklist button at bottom when typing */}
        {content.length > 0 && isFocused && (
          <TouchableOpacity
            onPress={handleInsertChecklist}
            style={[styles.quickTaskBtn, { borderColor: theme.borderSubtle }]}
            testID="btn-insert-task"
          >
            <Text style={[styles.quickTaskText, { color: theme.textSecondary, fontFamily, fontSize: typeScale.caption }]}>
              + Add task item
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  checklistOverlay: {
    paddingBottom: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionLabel: {
    letterSpacing: 1,
    fontWeight: '600',
  },
  editButton: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  editButtonText: {
    textDecorationLine: 'underline',
  },
  textInput: {
    flex: 1,
    minHeight: 300,
    padding: 0,
    margin: 0,
  },
  quickTaskBtn: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 6,
  },
  quickTaskText: {
    letterSpacing: -0.2,
  },
});
