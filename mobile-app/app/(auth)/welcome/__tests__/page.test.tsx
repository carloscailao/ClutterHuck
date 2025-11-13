import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock expo-router for this specific test
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock navigation theme
jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: { background: '#FFFFFF', text: '#000000' },
    dark: false,
  }),
}));

// Import component AFTER mocks
import WelcomePage from '../page';

describe('WelcomePage Navigation Test', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  test('Get Started button navigates to register page', () => {
    const { getByText } = render(<WelcomePage />);
    
    const getStartedButton = getByText('Get Started');
    fireEvent.press(getStartedButton);
    
    expect(mockPush).toHaveBeenCalledWith('/(auth)/register/page');
  });
});