import React from 'react';
import { render, fireEvent, screen, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock expo-router - define mockPush inside the mock factory
jest.mock('expo-router', () => {
  const mockPush = jest.fn();
  return {
    router: {
      push: mockPush,
      replace: jest.fn(),
    },
    useRouter: () => ({
      push: mockPush,
      replace: jest.fn(),
    }),
  };
});

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

// Mock Supabase for successful signup
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: jest.fn().mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null,
      }),
    },
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'profile123' },
        error: null,
      }),
    })),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Import component after mocks - Fix the import path
import RegisterPage from '@/app/(auth)/register/page';
// Import the mocked router to access mockPush
import { router } from 'expo-router';

// Get access to the mock function
const mockRouter = router as jest.Mocked<typeof router>;

describe('RegisterPage - Create Account Button', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  test('Routes to name page when user successfully creates account', async () => {
    render(<RegisterPage />);

    // Get inputs
    const allEmptyInputs = screen.getAllByDisplayValue('');
    const emailInput = allEmptyInputs[0];
    const passwordInput = allEmptyInputs[1];

    // Enter valid credentials
    await act(async () => {
      fireEvent.changeText(emailInput, 'newuser@example.com');
      fireEvent.changeText(passwordInput, 'validpassword123');
    });

    // Press the Create Account button
    const createButton = screen.getByText('Create Account');
    
    await act(async () => {
      fireEvent.press(createButton);
    });

    // Wait for navigation to be called
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: '/(auth)/name/page',
        params: { email: 'newuser@example.com' }
      });
    }, { timeout: 3000 });
  });

  test('Sign Up button is disabled when user leaves input fields blank', async () => {
    render(<RegisterPage />);

    // Find the actual TouchableOpacity button using testID
    const createButton = screen.getByTestId('create-account-button');
    
    // Check that button is disabled (has reduced opacity)
    expect(createButton.props.style).toEqual(
      expect.objectContaining({
        opacity: 0.4
      })
    );

    // Test with only email filled
    const allEmptyInputs = screen.getAllByDisplayValue('');
    const emailInput = allEmptyInputs[0];
    
    await act(async () => {
      fireEvent.changeText(emailInput, 'test@example.com');
    });

    // Button should still be disabled (password is empty)
    expect(createButton.props.style).toEqual(
      expect.objectContaining({
        opacity: 0.4
      })
    );

    // Test with only password filled (clear email first)
    const passwordInput = allEmptyInputs[1];
    
    await act(async () => {
      fireEvent.changeText(emailInput, ''); // Clear email
      fireEvent.changeText(passwordInput, 'password123');
    });

    // Button should still be disabled (email is empty)
    expect(createButton.props.style).toEqual(
      expect.objectContaining({
        opacity: 0.4
      })
    );
  });

  test('Sign Up button is disabled when user inputs invalid email format', async () => {
    render(<RegisterPage />);

    // Get inputs
    const allEmptyInputs = screen.getAllByDisplayValue('');
    const emailInput = allEmptyInputs[0];
    const passwordInput = allEmptyInputs[1];

    // Enter invalid email (doesn't end in .com) and valid password
    await act(async () => {
      fireEvent.changeText(emailInput, 'invalid@email');
      fireEvent.changeText(passwordInput, 'validpassword123');
    });

    // Find the button
    const createButton = screen.getByTestId('create-account-button');
    
    // Check that button is disabled (has reduced opacity)
    expect(createButton.props.style).toEqual(
      expect.objectContaining({
        opacity: 0.4
      })
    );

    // Test with email that doesn't have proper domain extension
    await act(async () => {
      fireEvent.changeText(emailInput, 'user@domain.co');
    });

    // Button should still be disabled (invalid email format)
    expect(createButton.props.style).toEqual(
      expect.objectContaining({
        opacity: 0.4
      })
    );

    // Test with completely invalid email format
    await act(async () => {
      fireEvent.changeText(emailInput, 'notanemail');
    });

    // Button should still be disabled
    expect(createButton.props.style).toEqual(
      expect.objectContaining({
        opacity: 0.4
      })
    );
  });

    test('Sign Up button shows error message when user inputs invalid password', async () => {
    render(<RegisterPage />);

    // Get inputs
    const allEmptyInputs = screen.getAllByDisplayValue('');
    const emailInput = allEmptyInputs[0];
    const passwordInput = allEmptyInputs[1];

    // Enter valid email and invalid password
    await act(async () => {
      fireEvent.changeText(emailInput, 'valid@example.com');
      fireEvent.changeText(passwordInput, '123'); // Only 3 characters
    });

    // Check that error message appears
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters long.')).toBeTruthy();
    });

    // Check that button is still disabled
    const createButton = screen.getByTestId('create-account-button');
    expect(createButton.props.style.opacity).toBe(0.4);
  });
});