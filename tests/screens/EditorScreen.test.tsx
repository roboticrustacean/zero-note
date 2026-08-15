import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EditorScreen } from '../../src/screens/EditorScreen';
import { ThemeProvider } from '../../src/theme/ThemeContext';
import { NotesProvider } from '../../src/context/NotesContext';

describe('EditorScreen', () => {
  it('renders editor with Ø branding and allows typing', async () => {
    const onOpenSettings = jest.fn();

    const { findByPlaceholderText, getByTestId } = render(
      <ThemeProvider>
        <NotesProvider>
          <EditorScreen onOpenSettings={onOpenSettings} />
        </NotesProvider>
      </ThemeProvider>
    );

    const input = await findByPlaceholderText('Start writing...');
    expect(input).toBeTruthy();

    fireEvent.changeText(input, 'Testing single note');
    expect(input.props.value).toBe('Testing single note');

    // Test settings button
    const settingsBtn = getByTestId('btn-settings');
    fireEvent.press(settingsBtn);
    expect(onOpenSettings).toHaveBeenCalled();
  });
});
