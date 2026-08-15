import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import App from '../App';

describe('Zero Note Root App Integration', () => {
  it('renders root application with unified text editor, Ø branding, and archive', async () => {
    const { findByTestId, getByTestId } = render(<App />);

    const input = await findByTestId('note-editor-input');
    expect(input).toBeTruthy();

    await waitFor(() => {
      expect(getByTestId('app-logo-mark')).toBeTruthy();
      expect(getByTestId('btn-history')).toBeTruthy();
      expect(getByTestId('btn-archive')).toBeTruthy();
    });

    fireEvent.changeText(input, '- [ ] Buy groceries\n[] New task');
    expect(input.props.value).toBe('- [ ] Buy groceries\n- [ ] New task');
  });
});
