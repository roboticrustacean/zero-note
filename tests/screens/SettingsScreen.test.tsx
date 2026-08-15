import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingsScreen } from '../../src/screens/SettingsScreen';
import { ThemeProvider } from '../../src/theme/ThemeContext';
import { NotesProvider } from '../../src/context/NotesContext';

describe('SettingsScreen', () => {
  it('renders preferences toggles, backup options, and responds to close button', async () => {
    const onClose = jest.fn();

    const { findByText, getByText, getByTestId } = render(
      <ThemeProvider>
        <NotesProvider>
          <SettingsScreen onClose={onClose} />
        </NotesProvider>
      </ThemeProvider>
    );

    const title = await findByText('Zero Note');
    expect(title).toBeTruthy();
    expect(getByText('Haptic Feedback')).toBeTruthy();
    expect(getByText('Word & Character Counter')).toBeTruthy();
    expect(getByText('Export Backup')).toBeTruthy();

    const closeBtn = getByTestId('btn-close-settings');
    fireEvent.press(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
