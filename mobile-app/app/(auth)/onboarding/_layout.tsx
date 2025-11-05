import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Stack, useSegments } from 'expo-router';
import { useTheme } from '@react-navigation/native';

const steps = ['username', 'displayname', 'space', 'donations', 'privacy'];

export default function OnboardingLayout() {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  // detect route part
  const segments = useSegments();
  const lastSegment = segments[segments.length - 1];

  useEffect(() => {
    const index = steps.indexOf(lastSegment as string);
    if (index >= 0) setCurrentIndex(index);
  }, [lastSegment]);

  // animate progress on index change
  useEffect(() => {
    Animated.timing(progress, {
      toValue: (currentIndex + 1) / steps.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress Bar */}
      <View style={styles.progressBarWrapper}>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: colors.border, opacity: 0.3 },
          ]}
        />
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Stack Screens */}
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressBarWrapper: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    zIndex: 10,
  },
  progressTrack: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
