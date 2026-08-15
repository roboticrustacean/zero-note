import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import App from '../App';

describe('Zero Note Root App Integration', () => {
  it('renders root application successfully with Ø logo, interactive checklist, and archive', async () => {
    const { findByText, getByTestId } = render(<App />);

    const guideText = await findByText(/Double tap canvas to create a task/i);
    expect(guideText).toBeTruthy();

    await waitFor(() => {
      expect(getByTestId('app-logo-mark')).toBeTruthy();
      expect(getByTestId('btn-history')).toBeTruthy();
      expect(getByTestId('btn-archive')).toBeTruthy();
      expect(getByTestId('btn-toggle-task-2')).toBeTruthy();
    });

    // Test toggle task checkbox
    fireEvent.press(getByTestId('btn-toggle-task-2'));
  });
});
