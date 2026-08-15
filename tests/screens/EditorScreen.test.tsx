import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EditorScreen } from '../../src/screens/EditorScreen';
import { ThemeProvider } from '../../src/theme/ThemeContext';
import { NotesProvider } from '../../src/context/NotesContext';

describe('EditorScreen', () => {
  it('renders editor with Ø branding, history, archive, and interactive checklist', async () => {
    const onOpenSettings = jest.fn();
    const onOpenArchive = jest.fn();

    const { findByText, getByTestId } = render(
      <ThemeProvider>
        <NotesProvider>
          <EditorScreen onOpenSettings={onOpenSettings} onOpenArchive={onOpenArchive} />
        </NotesProvider>
      </ThemeProvider>
    );

    const taskText = await findByText(/Double tap canvas to create a task/i);
    expect(taskText).toBeTruthy();

    // Test toggle task checkbox
    const taskCheckbox = getByTestId('btn-toggle-task-2');
    fireEvent.press(taskCheckbox);

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
