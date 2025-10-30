// app/(tabs)/index.tsx

import React from 'react';
import { ScrollView, Text, View, StyleSheet, Image } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Image
          source={require('@/assets/images/clutterhuck-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome to ClutterHuck</Text>
        <Text style={styles.subtitle}>
          Responsible Decluttering for a Sustainable Future
        </Text>
      </View>

      {/* Description */}
      <Text style={styles.body}>
        Anchored in the UN Sustainable Development Goal 12 — 
        <Text style={styles.bold}> Responsible Consumption and Production</Text> — 
        ClutterHuck empowers Filipinos to declutter responsibly by connecting
        them with recycling organizations and donation partners.
      </Text>

      {/* Features Section */}
      <View style={styles.features}>
        <Text style={styles.sectionTitle}>What You Can Do</Text>
        <Text style={styles.feature}>• Digitize your clutter inventory</Text>
        <Text style={styles.feature}>• Donate, sell, or auction unused items</Text>
        <Text style={styles.feature}>• Connect with peers and organizations</Text>
      </View>

      {/* Footer / Context */}
      <Text style={styles.footer}>
        Start your sustainable decluttering journey today.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1B5E20',
  },
  subtitle: {
    fontSize: 16,
    color: '#388E3C',
    textAlign: 'center',
    marginTop: 4,
  },
  body: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    marginBottom: 20,
  },
  bold: {
    fontWeight: '600',
  },
  features: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  feature: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  footer: {
    fontSize: 15,
    textAlign: 'center',
    color: '#666',
  },
});
