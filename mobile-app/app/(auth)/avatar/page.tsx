import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    useColorScheme,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '@/lib/supabaseClient';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default function SetProfilePicture() {
    const { colors, dark } = useTheme();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Load user and profile
    useEffect(() => {
        (async () => {
            try {
                const {
                    data: { user },
                    error: userError,
                } = await supabase.auth.getUser();

                if (userError) throw userError;
                if (!user) return;

                setUserId(user.id);

                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('avatar_url')
                    .eq('auth_uid', user.id)
                    .single();

                if (profileError && profileError.code !== 'PGRST116') {
                    console.warn('Profile fetch error:', profileError.message);
                } else if (profile?.avatar_url) {
                    setAvatarUrl(profile.avatar_url);
                }
            } catch (error) {
                console.error('Error fetching user/profile:', error);
            }
        })();
    }, []);

    // Pick and upload
    const pickAndUploadImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Photo permissions are required.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled || !result.assets?.length) return;

            const pickedImage = result.assets[0];
            let finalUri = pickedImage.uri;

            const fileInfo = await FileSystem.getInfoAsync(finalUri);
            if (!fileInfo.exists) throw new Error('File not found');
            let fileSize = fileInfo.size ?? 0;

            // Compress large images
            if (fileSize > MAX_FILE_SIZE) {
                let quality = 0.9;
                let width = 1024;
                for (let i = 0; i < 5; i++) {
                    const manipResult = await ImageManipulator.manipulateAsync(
                        finalUri,
                        [{ resize: { width } }],
                        { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
                    );
                    const newFileInfo = await FileSystem.getInfoAsync(manipResult.uri);
                    if (newFileInfo.exists && (newFileInfo.size ?? 0) <= MAX_FILE_SIZE) {
                        finalUri = manipResult.uri;
                        break;
                    }
                    quality = Math.max(quality - 0.2, 0.1);
                    width = Math.floor(width * 0.8);
                }
            }

            setUploading(true);

            const fileExt = 'jpg';
            const fileName = `${userId ?? 'unknown'}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, {
                    uri: finalUri,
                    type: `image/${fileExt}`,
                    name: fileName,
                } as any);

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const publicUrl = publicUrlData?.publicUrl ?? null;
            if (!publicUrl) throw new Error('No public URL returned');

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('auth_uid', userId);

            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            Alert.alert('Success', 'Profile picture uploaded successfully!');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to upload image');
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleNext = () => router.replace('/(tabs)');
    const handleSkip = () => router.replace('/(tabs)');

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.header, { color: colors.text }]}>
                Set your profile picture
            </Text>

            <TouchableOpacity onPress={pickAndUploadImage} disabled={uploading}>
                <View style={[styles.avatar, styles.placeholder]}>
                    {uploading ? (
                        <ActivityIndicator size="large" color={dark ? '#fff' : '#000'} />
                    ) : avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                    ) : (
                        <Text style={styles.placeholderText}>+</Text>
                    )}
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor: dark ? '#fff' : '#000', opacity: uploading ? 0.6 : 1 },
                ]}
                activeOpacity={0.8}
                onPress={avatarUrl ? handleNext : pickAndUploadImage}
                disabled={uploading}
            >
                <Text style={[styles.buttonText, { color: dark ? '#000' : '#fff' }]}>
                    {uploading ? 'Uploading...' : avatarUrl ? 'Next' : 'Upload a photo'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={[styles.skipText, { color: colors.text + '80' }]}>Skip</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 25 },
    avatar: { width: 180, height: 180, borderRadius: 90, marginBottom: 30 },
    header: { fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
    button: { paddingVertical: 16, paddingHorizontal: 60, borderRadius: 50 },
    buttonText: { fontWeight: '700', fontSize: 16, textAlign: 'center' },
    skipButton: { alignSelf: 'center', marginTop: 25 },
    skipText: { fontSize: 13 },
    placeholder: { backgroundColor: '#d9d9d9', justifyContent: 'center', alignItems: 'center' },
    placeholderText: { fontSize: 40, color: '#888' },
});
