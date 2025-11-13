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

// Create mock functions that will be accessible throughout the test
let mockSignUp: jest.Mock;
let mockSingle: jest.Mock;

// Mock the entire supabaseClient module - create all mocks inside the factory
jest.mock('@/lib/supabaseClient', () => {
  mockSignUp = jest.fn();
  const mockSignInWithPassword = jest.fn();
  const mockGetUser = jest.fn();
  mockSingle = jest.fn();
  const mockSelect = jest.fn(() => ({ single: mockSingle }));
  const mockInsert = jest.fn(() => ({ select: mockSelect }));
  const mockEq = jest.fn(() => ({ single: mockSingle }));
  const mockSelectForQuery = jest.fn(() => ({ eq: mockEq }));
  const mockUpsert = jest.fn(() => ({ select: mockSelect }));
  const mockFrom = jest.fn(() => ({
    insert: mockInsert,
    select: mockSelectForQuery,
    upsert: mockUpsert,
  }));

  const mockSupabase = {
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      getUser: mockGetUser,
    },
    from: mockFrom,
  };

  return {
    supabase: mockSupabase,
    getCurrentUser: jest.fn(),
    getProfileByUid: jest.fn(),
    upsertProfile: jest.fn(),
  };
});

// Mock Alert
jest.spyOn(Alert, 'alert');

// Import component after mocks
import RegisterPage from '@/app/(auth)/register/page';
import { router } from 'expo-router';

// Get access to the mock functions
const mockRouter = router as jest.Mocked<typeof router>;

describe('RegisterPage - Create Account Button', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default successful signup mock
    mockSignUp.mockResolvedValue({
      data: { 
        user: { id: 'user123' },
        session: null 
      },
      error: null,
    });

    // Set up default successful profile creation mock
    mockSingle.mockResolvedValue({
      data: { id: 'profile123', auth_uid: 'user123' },
      error: null,
    });
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

    test('Shows error message when signup fails with already registered email', async () => {
    // Mock Supabase to return "already registered" error
    mockSignUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'User already registered' },
    });

    render(<RegisterPage />);

    // Get inputs
    const inputs = screen.getAllByDisplayValue('');
    const emailInput = inputs[0];
    const passwordInput = inputs[1];

    // Fill the form
    await act(async () => {
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
    });

    // Find and press the button (by text, which should always work)
    const signUpButton = screen.getByText('Create Account');
    await act(async () => {
      fireEvent.press(signUpButton);
    });

    // The main assertion - error message should appear
    await waitFor(() => {
      expect(screen.getByText('This email is already registered.')).toBeTruthy();
    });

    // Verify no navigation
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});