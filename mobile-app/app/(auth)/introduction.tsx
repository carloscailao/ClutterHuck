import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function IntroductionPage() {
  const { colors, dark } = useTheme();
  const colorScheme = useColorScheme();

  const handleGetStarted = () => {
    router.replace('/(auth)');
  };

  const imageSource = dark
    ? require('@/assets/images/intro/introDark.png')
    : require('@/assets/images/intro/introLight.png');

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: dark ? colors.background : '#FFFFFF', // ✅ pure white in light mode
        },
      ]}
    >
      {/* Top App Name */}
      <Text style={[styles.brand, { color: colors.text }]}>ClutterHuck</Text>

      {/* Illustration */}
      <Image source={imageSource} style={styles.image} resizeMode="contain" />

      {/* Header + Subtext */}
      <View style={styles.textContainer}>
        <Text style={[styles.header, { color: colors.text }]}>
          Declutter with Purpose
        </Text>
        <Text
          style={[
            styles.subtext,
            { color: colors.text + 'CC' },
          ]}
        >
          Turn unused items into opportunities — for you and others. Simplify
          your space, track what matters, and make giving back effortless.
        </Text>
      </View>

      {/* Button */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: dark ? '#FFFFFF' : '#000000',
          },
        ]}
        onPress={handleGetStarted}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.buttonText,
            { color: dark ? '#000000' : '#FFFFFF' },
          ]}
        >
          Get Started
        </Text>
      </TouchableOpacity>
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
  brand: {
    fontSize: 22,
    fontWeight: '800',
    position: 'absolute',
    top: 60,
  },
  image: {
    width: width * 0.8,
    height: height * 0.35,
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    paddingHorizontal: 20,
    width: '100%',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
  },
  subtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
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
});
