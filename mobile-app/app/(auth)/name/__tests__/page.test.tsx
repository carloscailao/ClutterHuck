import React from 'react';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react-native';

jest.useFakeTimers();

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({ colors: { background: '#fff', text: '#000' }, dark: false }),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('@/lib/supabaseClient', () => ({
  getCurrentUser: jest.fn(),
  getProfileByUid: jest.fn(),
  upsertProfile: jest.fn(),
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ data: [], error: null }),
  },
}));

import NamePage from '@/app/(auth)/name/page';
import { router } from 'expo-router';

describe('NamePage', () => {
  it('enables Next button when user inputs first name, last name, and a unique username (3–20 chars)', async () => {
    // supabase functions
    const { getCurrentUser, getProfileByUid, upsertProfile, supabase } = require('@/lib/supabaseClient');

    // mock initial user + profile load
    getCurrentUser.mockResolvedValueOnce({ data: { user: { id: 'uid123', email: 'a@b.com' } }, error: null });
    getProfileByUid.mockResolvedValueOnce({ data: null, error: { message: 'Result contains no rows' } });
    upsertProfile.mockResolvedValueOnce({ error: null });

    render(<NamePage />);

    // wait for initial loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByTestId('ActivityIndicator')).not.toBeTruthy();
    });

    // get input fields
    const firstNameInput = await screen.findByTestId('firstNameInput');
    const lastNameInput = await screen.findByTestId('lastNameInput');
    const usernameInput = await screen.findByTestId('usernameInput');
    
    // fill input fields
    fireEvent.changeText(firstNameInput, 'John');
    fireEvent.changeText(lastNameInput, 'Doe');
    fireEvent.changeText(usernameInput, 'john_doe');

    // wait for debounce username check to resolve
    await waitFor(() => expect(supabase.limit).toHaveBeenCalled());

    // check if next button is enabled
    const nextButton = screen.getByTestId('nextButton');
    await waitFor(() => {
      const isDisabled = nextButton.props.accessibilityState?.disabled;
      expect(isDisabled).not.toBe(true);
    });
  });

  it('routes to Set Avatar page when Next button is enabled', async () => {
    // supabase functions
    const { getCurrentUser, getProfileByUid, upsertProfile, supabase } = require('@/lib/supabaseClient');

    // mock initial user + profile load
    getCurrentUser.mockResolvedValue({ data: { user: { id: 'uid123', email: 'a@b.com' } }, error: null });
    getProfileByUid.mockResolvedValue({ data: null, error: { message: 'Result contains no rows' } });
    upsertProfile.mockResolvedValue({ error: null });

    render(<NamePage />);

    // Wait for initial loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByTestId('ActivityIndicator')).not.toBeTruthy();
    });

    // get input fields
    const firstNameInput = await screen.findByTestId('firstNameInput');
    const lastNameInput = await screen.findByTestId('lastNameInput');
    const usernameInput = await screen.findByTestId('usernameInput');

    // fill input fields
    fireEvent.changeText(firstNameInput, 'John');
    fireEvent.changeText(lastNameInput, 'Doe');
    fireEvent.changeText(usernameInput, 'john_doe');

    // wait for debounce username check to resolve
    await waitFor(() => expect(supabase.limit).toHaveBeenCalled(), { timeout: 1500 });

    // check if button is enabled
    const nextButton = screen.getByTestId('nextButton');
    await waitFor(() => {
      const isDisabled = nextButton.props.accessibilityState?.disabled;
      expect(isDisabled).not.toBe(true);
    });

    // button press event
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(upsertProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          auth_uid: 'uid123',
          firstName: 'John',
          lastName: 'Doe',
          username: 'john_doe',
          role: 'user',
        }),
      );
    }, { timeout: 2000 });

    // check if router push
    expect(router.push).toHaveBeenCalledWith('/(auth)/avatar/page');
  });

  it('disables Next button when one or more input fields are blank', async () => {
    const { getCurrentUser, getProfileByUid } = require('@/lib/supabaseClient');

    // mock user and empty profile
    getCurrentUser.mockResolvedValue({ data: { user: { id: 'uid123', email: 'a@b.com' } }, error: null });
    getProfileByUid.mockResolvedValue({ data: null, error: { message: 'Result contains no rows' } });

    render(<NamePage />);

    // get components
    const firstNameInput = await screen.findByTestId('firstNameInput');
    const lastNameInput = await screen.findByTestId('lastNameInput');
    const usernameInput = await screen.findByTestId('usernameInput');
    const nextButton = screen.getByTestId('nextButton');

    // Case 1: all fields blank (initial state)
    await waitFor(() => {
      const isDisabled = nextButton.props.accessibilityState?.disabled;
      expect(isDisabled).toBe(true);
    });

    // Case 2: only first name filled
    fireEvent.changeText(firstNameInput, 'John');
    await waitFor(() => {
      const isDisabled = nextButton.props.accessibilityState?.disabled;
      expect(isDisabled).toBe(true);
    });

    // Case 4: first + last filled, username blank
    fireEvent.changeText(lastNameInput, 'Doe');
    await waitFor(() => {
      const isDisabled = nextButton.props.accessibilityState?.disabled;
      expect(isDisabled).toBe(true);
    });

    // Case 5: First + username filled, last name blank
    fireEvent.changeText(firstNameInput, 'John');
    fireEvent.changeText(lastNameInput, ''); // clear last name
    fireEvent.changeText(usernameInput, 'johndoe');

    await waitFor(() => {
      const isDisabled = nextButton.props.accessibilityState?.disabled;
      expect(isDisabled).toBe(true);
    });

    // Case 6: Last + username filled, first name blank
    fireEvent.changeText(firstNameInput, ''); // clear first name
    fireEvent.changeText(lastNameInput, 'Doe');
    await waitFor(() => {
      const isDisabled = nextButton.props.accessibilityState?.disabled;
      expect(isDisabled).toBe(true);
    });

    // Final Check: all filled + button enabled (sanity check)
    fireEvent.changeText(firstNameInput, 'John');
    await waitFor(() => {
      const isDisabled = nextButton.props.accessibilityState?.disabled;
      expect(isDisabled).not.toBe(true);
    });
  });

  it('disables Next button with an error message with inputs fewer than 3 characters for the username', async () => {
    const { getCurrentUser, getProfileByUid } = require('@/lib/supabaseClient');

    getCurrentUser.mockResolvedValue({ data: { user: { id: 'uid123', email: 'a@b.com' } }, error: null });
    getProfileByUid.mockResolvedValue({ data: null, error: { message: 'Result contains no rows' } });
    
    render(<NamePage />);

    // wait for initial loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByTestId('ActivityIndicator')).not.toBeTruthy();
    });

    // Case 1: All field blank
    const nextButton = screen.getByTestId('nextButton');
    await waitFor(() => {
      const isDisabled = nextButton.props.accessibilityState?.disabled;
      expect(isDisabled).toBe(true);
    });

    // Case 2: Only first name filled
    fireEvent.changeText(screen.getByTestId('firstNameInput'), 'John');
    await waitFor(() => {
      const isDisabled = nextButton.props.accessibilityState?.disabled;
      expect(isDisabled).toBe(true);
    });

    // Case 3: First + Last filled, username blank
    fireEvent.changeText(screen.getByTestId('lastNameInput'), 'Doe');
    await waitFor(() => {
      const isDisabled = nextButton.props.accessibilityState?.disabled;
      expect(isDisabled).toBe(true);
    });

    // Case 4: All filled but username too short (less than 3 characters)
    fireEvent.changeText(screen.getByTestId('usernameInput'), 'jo');
    await waitFor(() => {
      const isDisabled = nextButton.props.accessibilityState?.disabled;
      expect(isDisabled).toBe(true);
    });

    expect(screen.getByText('Username must be 3–20 chars: letters, numbers, _, -, .')).toBeTruthy();

    // Final Check: All filled + button enabled (sanity check)
    fireEvent.changeText(screen.getByTestId('usernameInput'), 'johndoe');

    // Advance timer for username debounce
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // check if button enabled
    await waitFor(() => {
      const isDisabled = nextButton.props.accessibilityState?.disabled;
      expect(isDisabled).not.toBe(true);
    });
  });

  it('disables Next button when user inputs already registered username', async () => {
    const { getCurrentUser, getProfileByUid, upsertProfile, supabase } = require('@/lib/supabaseClient');

    getCurrentUser.mockResolvedValue({ data: { user: { id: 'uid123', email: 'a@b.com' } }, error: null });
    getProfileByUid.mockResolvedValue({ data: null, error: { message: 'Result contains no rows' } });
    upsertProfile.mockResolvedValue({ error: null });

    // mock supabase to return a profile with a different user ID (username taken)
    supabase.limit.mockResolvedValue({
      data: [{ auth_uid: 'other-user-id' }],
      error: null,
    });

    render(<NamePage />);

    // wait for initial loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByTestId('ActivityIndicator')).not.toBeTruthy();
    });

    // get input fields
    const firstNameInput = await screen.findByTestId('firstNameInput');
    const lastNameInput = await screen.findByTestId('lastNameInput');
    const usernameInput = await screen.findByTestId('usernameInput');

    // fill input fields
    fireEvent.changeText(firstNameInput, 'John');
    fireEvent.changeText(lastNameInput, 'Doe');
    fireEvent.changeText(usernameInput, 'takenuser');

    // advance debounce timer
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // wait for debounce username check to resolve
    await waitFor(() => expect(supabase.limit).toHaveBeenCalled(), { timeout: 1500 });
    
    // check if button enabled
    const nextButton = screen.getByTestId('nextButton');
    await waitFor(() => {
      const isDisabled = nextButton.props.accessibilityState?.disabled;
      expect(isDisabled).toBe(true);
    });

    // check for error text
    expect(screen.getByText('Username is already taken.')).toBeTruthy();
  });
});
