import React, { useState, useEffect } from "react";
import { View, Button, Image, StyleSheet, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabaseClient";
import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

// Custom hook to get current Supabase user
const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
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
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("auth_uid", user.id) // use auth_uid
        .single();

      if (error) console.log("Error fetching profile:", error.message);
      else setAvatar(data?.avatar_url || null);
    };

    fetchProfile();
  }, [user]);

  const pickImage = async () => {
    if (!user) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need access to your photos to set your profile picture."
      );
      return;
    }

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

      const response = await fetch(fileUri);
      const fileBlob = await response.blob();

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, fileBlob, { upsert: true });
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      // Save URL to profiles table using auth_uid
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("auth_uid", user.id); // use auth_uid for RLS

      if (dbError) throw dbError;

      setAvatar(publicUrl);
      Alert.alert("Success", "Profile picture updated!");
    } catch (err: any) {
      console.log("Upload error:", err.message);
      Alert.alert("Error", "Could not upload avatar. Please try again.");
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
      <Button title="Upload Profile Picture" onPress={pickImage} />
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
