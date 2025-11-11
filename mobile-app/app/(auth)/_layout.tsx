// app/(auth)/_layout.tsx
import React from "react";
import { Slot } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Stack } from 'expo-router';


export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="welcome/page" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="register/page" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="name/page" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="avatar/page" 
        options={{ headerShown: false }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
