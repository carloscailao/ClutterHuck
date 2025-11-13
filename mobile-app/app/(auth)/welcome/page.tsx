// app/(auth)/welcome/page.tsx
import React, { useRef, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function WelcomePage() {
  const router = useRouter();
  const { colors, dark } = useTheme();
  const colorScheme = useColorScheme();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    router.push('/(auth)/register/page');
  };

  return (
    <View style={[styles.container, { backgroundColor: dark ? colors.background : '#FFFFFF' }]}>
      <Text style={[styles.brand, { color: colors.text }]}>ClutterHuck</Text>

      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Image
          source={require("../../../assets/images/clutterhuck-logo.png")}
          style={styles.image}
          resizeMode="contain"
          testID =" logo-image"
        />
        <Text style={[styles.headerText, { color: colors.text }]}>Welcome to ClutterHuck</Text>
        <Text style={[styles.subtext, { color: dark ? '#AAAAAA' : '#555555' }]}>
          Responsible Decluttering for a Sustainable Future
        </Text>
      </Animated.View>

      <View style={styles.textContainer}>
        <Text style={[styles.body, { color: colors.text }]}>
          Anchored in the UN Sustainable Development Goal 12 —{" "}
          <Text style={styles.bold}>Responsible Consumption and Production</Text> —{" "}
          ClutterHuck empowers Filipinos to declutter responsibly by connecting
          them with recycling organizations and donation partners.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: dark ? '#FFFFFF' : '#000000' }]}
        onPress={handleGetStarted}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, { color: dark ? '#000000' : '#FFFFFF' }]}>
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
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  image: {
    width: width * 0.6, // smaller and more proportional
    height: height * 0.25, // reduced height for better dark mode layout
    marginBottom: 16,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    paddingHorizontal: 20,
    width: '100%',
  },
  body: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 50,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
});
