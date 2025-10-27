import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';

interface OnboardingScreenProps {
  children: React.ReactNode;
  onNext?: () => void;
  nextLabel?: string;
  disabled?: boolean;
}

export default function OnboardingScreen({
  children,
  onNext,
  nextLabel = 'Next',
  disabled = false,
}: OnboardingScreenProps) {
  const { colors } = useTheme();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Content Section */}
      <View style={styles.content}>{children}</View>

      {/* Fixed Button Section */}
      {onNext && (
        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <Button
            mode="contained"
            onPress={onNext}
            disabled={disabled}
            style={[styles.button, { backgroundColor: colors.primary }]}
            labelStyle={{ color: colors.background, fontWeight: '600' }}
          >
            {nextLabel}
          </Button>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  footer: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    paddingTop: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  button: {
    borderRadius: 12,
    minWidth: 180,
  },
});
