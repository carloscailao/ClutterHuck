// app/(tabs)/chat.tsx

import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>
      <Text style={styles.text}>
        Connect and coordinate with peers, organizations, or buyers for donation and recycling drives.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
});
