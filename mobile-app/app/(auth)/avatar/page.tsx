import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    TouchableOpacity,
    Image,
    useColorScheme,
    Text,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabaseClient';
import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

export default function SetProfilePicture() {
    const { colors, dark } = useTheme();
    const colorScheme = useColorScheme();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        // Get current user
        const getCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                // Load existing avatar if any
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('avatar_url')
                    .eq('auth_uid', user.id)
                    .single();
                
                if (profile?.avatar_url) {
                    setAvatarUrl(profile.avatar_url);
                }
            }
        };
        getCurrentUser();
    }, []);

    const pickAndUploadImage = async () => {
        try {
            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload photos.');
                return;
            }

            // Pick image
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return;
            }

            const pickedImage = result.assets[0];

            // Check file size
            const fileInfo = await FileSystem.getInfoAsync(pickedImage.uri);
            if (fileInfo.exists && fileInfo.size && fileInfo.size > MAX_FILE_SIZE) {
                Alert.alert('File Too Large', 'Please select an image smaller than 2MB.');
                return;
            }

            setUploading(true);

            // Upload to Supabase Storage
            const fileExt = pickedImage.uri.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Create FormData for React Native
            const formData = new FormData();
            formData.append('file', {
                uri: pickedImage.uri,
                type: `image/${fileExt}`,
                name: fileName,
            } as any);

            // Upload using fetch with FormData
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('No active session');
            }

            const uploadResponse = await fetch(
                `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/avatars/${filePath}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: formData,
                }
            );

            if (!uploadResponse.ok) {
                const error = await uploadResponse.json();
                throw new Error(error.message || 'Upload failed');
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update profile with avatar URL
            if (userId) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ avatar_url: publicUrl })
                    .eq('auth_uid', userId);

                if (updateError) {
                    throw updateError;
                }
            }

            setAvatarUrl(publicUrl);
            Alert.alert('Success', 'Profile picture uploaded successfully!');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to upload image');
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleNext = () => {
        router.replace('/(tabs)');
    };

    const handleSkip = () => {
        router.replace('/(tabs)');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <Text style={[styles.header, { color: colors.text }]}>
                Set your profile picture
            </Text>

            {/* Avatar Preview */}
            <TouchableOpacity onPress={pickAndUploadImage} disabled={uploading}>
                <View style={[styles.avatar, styles.placeholder]}>
                    {uploading ? (
                        <ActivityIndicator size="large" color={dark ? '#FFFFFF' : '#000000'} />
                    ) : avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                    ) : (
                        <Text style={styles.placeholderText}>+</Text>
                    )}
                </View>
            </TouchableOpacity>

            {/* Upload Button */}
            <TouchableOpacity
                style={[
                    styles.button,
                    {
                        backgroundColor: dark ? '#FFFFFF' : '#000000',
                        opacity: uploading ? 0.6 : 1,
                    },
                ]}
                activeOpacity={0.8}
                onPress={avatarUrl ? handleNext : pickAndUploadImage}
                disabled={uploading}
            >
                <Text
                    style={[
                        styles.buttonText,
                        { color: dark ? '#000000' : '#FFFFFF' },
                    ]}
                >
                    {uploading ? 'Uploading...' : avatarUrl ? 'Next' : 'Upload a photo'}
                </Text>
            </TouchableOpacity>

            {/* Skip Button */}
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={[styles.skipText, { color: colors.text + '80' }]}>
                    Skip
                </Text>
            </TouchableOpacity>

            {/* File Size Info */}
            <Text style={[styles.infoText, { color: colors.text + '60' }]}>
                Maximum file size: 2MB
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 25,
    },
    avatar: {
        width: 180,
        height: 180,
        borderRadius: 90,
        marginBottom: 30,
    },
    header: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
    },
    button: {
        paddingVertical: 16,
        paddingHorizontal: 60,
        borderRadius: 50,
    },
    buttonText: {
        fontWeight: '700',
        fontSize: 16,
        textAlign: 'center',
    },
    skipButton: {
        alignSelf: 'center',
        marginTop: 25,
    },
    skipText: {
        fontSize: 13,
    },
    placeholder: {
        backgroundColor: '#d9d9d9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 40,
        color: '#888',
    },
    infoText: {
        fontSize: 12,
        marginTop: 10,
        textAlign: 'center',
    },
});