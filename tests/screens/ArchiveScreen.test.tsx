import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { ArchiveScreen } from '../../src/screens/ArchiveScreen';
import { ThemeProvider } from '../../src/theme/ThemeContext';
import { NotesProvider } from '../../src/context/NotesContext';

describe('ArchiveScreen', () => {
  it('renders search input and responds to close button', async () => {
    const onClose = jest.fn();

    const { findByPlaceholderText, getByTestId, getByText } = render(
      <ThemeProvider>
        <NotesProvider>
          <ArchiveScreen onClose={onClose} />
        </NotesProvider>
      </ThemeProvider>
    );

    const input = await findByPlaceholderText('Search archived notes...');
    expect(input).toBeTruthy();
    expect(getByText('Archive History')).toBeTruthy();

    const closeBtn = getByTestId('btn-close-archive');
    fireEvent.press(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
