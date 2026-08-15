import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingsScreen } from '../../src/screens/SettingsScreen';
import { ThemeProvider } from '../../src/theme/ThemeContext';
import { NotesProvider } from '../../src/context/NotesContext';

describe('SettingsScreen', () => {
  it('renders theme and font choices and responds to close button', async () => {
    const onClose = jest.fn();

    const { findByText, getByText, getByTestId } = render(
      <ThemeProvider>
        <NotesProvider>
          <SettingsScreen onClose={onClose} />
        </NotesProvider>
      </ThemeProvider>
    );

    const title = await findByText('Preferences');
    expect(title).toBeTruthy();
    expect(getByText('OLED Dark')).toBeTruthy();
    expect(getByText('Warm Paper')).toBeTruthy();
    expect(getByText('Clean Light')).toBeTruthy();
    expect(getByText('Monospace')).toBeTruthy();
    expect(getByText('Export Backup (JSON)')).toBeTruthy();

    const closeBtn = getByTestId('btn-close-settings');
    fireEvent.press(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
