import React, { useRef } from 'react';
import {
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface EditorProps {
  content: string;
  onChangeContent: (text: string) => void;
  hapticsEnabled?: boolean;
}

export const Editor: React.FC<EditorProps> = ({
  content,
  onChangeContent,
}) => {
  const { theme, fontFamily, typeScale } = useTheme();
  const inputRef = useRef<TextInput>(null);

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
        <TextInput
          ref={inputRef}
          multiline
          autoFocus={content.length === 0}
          value={content}
          onChangeText={onChangeContent}
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
  textInput: {
    flex: 1,
    minHeight: 400,
    padding: 0,
    margin: 0,
    letterSpacing: -0.2,
  },
});
