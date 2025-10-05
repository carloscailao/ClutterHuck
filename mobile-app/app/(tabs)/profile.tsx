import React, { useState, useEffect } from "react";
import { View, Button, Image, StyleSheet, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabaseClient";
import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

// Hook to get current Supabase user
const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener?.subscription?.unsubscribe();
  }, []);

  return user;
};

export default function ProfileScreen() {
  const user = useUser();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch current avatar
  useEffect(() => {
    if (!user?.id) return;

    const fetchAvatar = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("auth_uid", user.id)
          .single();
        if (error) {
          console.log("Error fetching profile:", error.message);
        } else {
          setAvatar(data?.avatar_url || null);
        }
      } catch (err) {
        console.log("Unexpected error fetching avatar:", err);
      }
    };

    fetchAvatar();
  }, [user]);

  const pickAndUploadImage = async () => {
    if (!user?.id) return;

    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need access to your photos to set your profile picture.");
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets.length) return;

    const fileUri = result.assets[0].uri;
    const fileName = "avatar.png";
    const filePath = `avatars/${user.id}/${fileName}`;

    try {
      setLoading(true);
      console.log("Picked file URI:", fileUri);

      // Convert to blob
      const response = await fetch(fileUri);
      const fileBlob = await response.blob();
      console.log("Blob created");

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, fileBlob, { upsert: true });
      if (uploadError) throw uploadError;
      console.log("Uploaded to Supabase Storage");

      // Get public URL
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl;
      console.log("Public URL:", publicUrl);

      if (!publicUrl) throw new Error("Could not get public URL");

      // Update profiles table
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("auth_uid", user.id);
      if (dbError) throw dbError;

      setAvatar(publicUrl);
      Alert.alert("Success", "Profile picture updated!");
    } catch (err: any) {
      console.log("Error uploading avatar:", err.message);
      Alert.alert("Error", "Could not upload avatar. See console logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : avatar ? (
        <Image source={{ uri: avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.placeholder]} />
      )}
      <Button title="Upload Profile Picture" onPress={pickAndUploadImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  placeholder: {
    backgroundColor: "#ccc",
  },
});
