// app/(tabs)/inventory.tsx

import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

export default function InventoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Inventory</Text>
      <Text style={styles.text}>
        Digitize your clutter inventory to track items you no longer use — from clothes and books
        to printed materials. Decide later whether to donate, sell, or recycle them.
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
