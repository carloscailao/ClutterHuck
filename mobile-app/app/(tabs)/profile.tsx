import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
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

  // Fetch avatar from Supabase
  useEffect(() => {
    if (!user?.id) return;

    const fetchAvatar = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("auth_uid", user.id)
          .single();

        if (error) console.log("Error fetching profile:", error.message);
        else setAvatar(data?.avatar_url || null);
      } catch (err) {
        console.log("Unexpected error fetching avatar:", err);
      }
    };

    fetchAvatar();
  }, [user]);

  // Pick & upload avatar
  const pickAndUploadImage = async () => {
    if (!user?.id) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow access to your photos to upload an avatar.");
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
    const filePath = `avatars/${user.id}/avatar.png`;

    try {
      setLoading(true);

      const response = await fetch(fileUri);
      const fileBlob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, fileBlob, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) throw new Error("Could not get public URL");

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
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileCard}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <TouchableOpacity onPress={pickAndUploadImage}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.placeholder]}>
                <Text style={styles.placeholderText}>+</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        <Text style={styles.nameText}>
          {user?.user_metadata?.full_name || "Unnamed User"}
        </Text>
        <Text style={styles.emailText}>{user?.email}</Text>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={pickAndUploadImage}
          disabled={loading}
        >
          <Text style={styles.uploadButtonText}>
            {loading ? "Uploading..." : "Change Profile Picture"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Account Info</Text>
        <Text style={styles.infoItem}>
          <Text style={styles.infoLabel}>User ID: </Text>
          {user?.id || "Unknown"}
        </Text>
        <Text style={styles.infoItem}>
          <Text style={styles.infoLabel}>Last Sign-In: </Text>
          {user?.last_sign_in_at
            ? new Date(user.last_sign_in_at).toLocaleString()
            : "Never"}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f8f9fb",
    flexGrow: 1,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  placeholder: {
    backgroundColor: "#d9d9d9",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 40,
    color: "#888",
  },
  nameText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
  },
  emailText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  infoItem: {
    fontSize: 14,
    marginBottom: 6,
    color: "#333",
  },
  infoLabel: {
    fontWeight: "500",
    color: "#777",
  },
});
