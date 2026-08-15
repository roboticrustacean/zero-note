import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import App from '../App';

describe('Zero Note Root App Integration', () => {
  it('renders root application successfully', async () => {
    const { findByPlaceholderText, getByTestId } = render(<App />);

    const input = await findByPlaceholderText('Write your note...');
    expect(input).toBeTruthy();

    await waitFor(() => {
      expect(getByTestId('btn-settings')).toBeTruthy();
      expect(getByTestId('btn-history')).toBeTruthy();
      expect(getByTestId('btn-pin')).toBeTruthy();
      expect(getByTestId('btn-archive')).toBeTruthy();
    });
  });
});
