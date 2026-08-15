import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import App from '../App';

describe('Zero Note Root App Integration', () => {
  it('renders root application successfully with Ø logo, floating window, and archive', async () => {
    const { findByPlaceholderText, getByTestId } = render(<App />);

    const input = await findByPlaceholderText('Start writing...');
    expect(input).toBeTruthy();

    await waitFor(() => {
      expect(getByTestId('app-logo-mark')).toBeTruthy();
      expect(getByTestId('btn-history')).toBeTruthy();
      expect(getByTestId('btn-archive')).toBeTruthy();
    });
  });
});
