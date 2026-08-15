import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EditorScreen } from '../../src/screens/EditorScreen';
import { ThemeProvider } from '../../src/theme/ThemeContext';
import { NotesProvider } from '../../src/context/NotesContext';

describe('EditorScreen', () => {
  it('renders unified editor with Ø branding, history, archive, and direct text input', async () => {
    const onOpenSettings = jest.fn();
    const onOpenArchive = jest.fn();

    const { findByTestId, getByTestId } = render(
      <ThemeProvider>
        <NotesProvider>
          <EditorScreen onOpenSettings={onOpenSettings} onOpenArchive={onOpenArchive} />
        </NotesProvider>
      </ThemeProvider>
    );

    const input = await findByTestId('note-editor-input');
    expect(input).toBeTruthy();

    fireEvent.changeText(input, 'Focus on one note');
    expect(input.props.value).toBe('Focus on one note');

    // Test settings via logo button
    const logoBtn = getByTestId('app-logo-mark');
    fireEvent.press(logoBtn);
    expect(onOpenSettings).toHaveBeenCalled();

    // Test archive history button
    const historyBtn = getByTestId('btn-history');
    fireEvent.press(historyBtn);
    expect(onOpenArchive).toHaveBeenCalled();
  });
});
