import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import SetProfilePicture from '../page';
import { supabase } from '@/lib/supabaseClient';
import { Alert } from 'react-native';
import {useRouter} from "expo-router";



// Mocks
jest.mock('expo-image-picker', () => ({
    launchImageLibraryAsync: jest.fn(),
    requestMediaLibraryPermissionsAsync: jest.fn(),
}));

jest.mock('expo-image-manipulator', () => ({
    manipulateAsync: jest.fn(),
}));

const replaceMock = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock('@/lib/supabaseClient', () => ({
    supabase: {
        auth: {
            getUser: jest.fn(),
            getSession: jest.fn(),
        },
        from: jest.fn(),
        storage: {
            from: jest.fn(() => ({
                upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
                getPublicUrl: jest.fn(() => ({
                    data: { publicUrl: 'https://fakeurl.com/avatar.jpg' },
                })),
            })),
        },
    },
}));

jest.mock('@react-navigation/native', () => ({
    useTheme: () => ({ colors: { background: '#fff', text: '#000' }, dark: false }),
}));


// Setup before each test
const ImagePicker = require('expo-image-picker');

ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'granted' });

beforeEach(() => {
    jest.clearAllMocks();

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'mock-user-id' } },
        error: null,
    });

    (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
        }),
    });
});

describe('SetProfilePicture', () => {
    it('renders correctly', () => {
        const { getByText } = render(<SetProfilePicture />);
        expect(getByText('Upload a photo')).toBeTruthy();
    });

    it('uploads image successfully', async () => {
        const mockImage = {
            canceled: false,
            assets: [{ uri: 'file://mock-photo.jpg' }],
        };

        const { launchImageLibraryAsync } = require('expo-image-picker');
        launchImageLibraryAsync.mockResolvedValue(mockImage);

        const { manipulateAsync } = require('expo-image-manipulator');
        manipulateAsync.mockResolvedValue({ uri: 'file://mock-photo.jpg' });

        const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

        const { getByText } = render(<SetProfilePicture />);
        const button = getByText('Upload a photo');

        await act(async () => {
            fireEvent.press(button);
        });

        await waitFor(() =>
            expect(alertSpy).toHaveBeenCalledWith(
                'Success',
                'Profile picture uploaded successfully!'
            )
        );
    });

    it('handles permission denied gracefully', async () => {
        const { requestMediaLibraryPermissionsAsync } = require('expo-image-picker');
        requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: false });

        const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
        const { getByText } = render(<SetProfilePicture />);
        const button = getByText('Upload a photo');

        await act(async () => {
            fireEvent.press(button);
        });

        await waitFor(() =>
            expect(alertSpy).toHaveBeenCalledWith(
                'Permission Required',
                'Photo permissions are required.'
            )
        );
    });

    beforeEach(() => {
        replaceMock.mockClear();
    });

    it('navigates to tabs when Skip is pressed', async () => {
        const { getByText } = render(<SetProfilePicture />);
        const skipButton = getByText('Skip');

        fireEvent.press(skipButton);

        await waitFor(() => {
            expect(replaceMock).toHaveBeenCalledWith('/(tabs)');
        });
    });
});
