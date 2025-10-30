// app/(tabs)/listings.tsx

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';

export default function ListingsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Listings</Text>
      <Text style={styles.desc}>
        Discover items listed by other users for donation, sale, or auction.
      </Text>
      <Text style={styles.context}>
        ClutterHuck aims to connect Filipinos with trustworthy recycling organizations
        and donation partners. Here, you can explore available items and opportunities
        to declutter responsibly.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  desc: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
  },
  context: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
});
