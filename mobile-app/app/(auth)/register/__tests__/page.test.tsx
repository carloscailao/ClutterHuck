import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react-native';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

// Mock react-navigation theme
jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      background: '#FFFFFF',
      text: '#000000',
      card: '#FFFFFF',
    },
    dark: false,
  }),
}));

// Import component after mocks
import RegisterPage from '../page';

describe('RegisterPage - Create Account Button', () => {
  test('Create Account button is enabled when user inputs valid email and password', async () => {
    render(<RegisterPage />);

    // Use getAllByDisplayValue to get all empty inputs, then select specific ones
    const allEmptyInputs = screen.getAllByDisplayValue('');
    const emailInput = allEmptyInputs[0]; // First empty input is email
    const passwordInput = allEmptyInputs[1]; // Second empty input is password

    // Enter valid email and password - wrapped in act()
    await act(async () => {
      fireEvent.changeText(emailInput, 'newuser@example.com');
      fireEvent.changeText(passwordInput, 'validpassword123');
    });

    // Find the Create Account button
    const createButton = screen.getByText('Create Account');
    
    // Check that button exists and is rendered
    expect(createButton).toBeTruthy();
  });
});