import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';

export default function UsernameStep() {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const { colors, dark } = useTheme();

  // Simulate username availability check
  useEffect(() => {
    if (!username.trim()) {
      setStatus('idle');
      return;
    }

    setStatus('checking');
    const timeout = setTimeout(() => {
      // Mock logic: usernames containing "a" are taken
      if (username.toLowerCase().includes('a')) setStatus('taken');
      else setStatus('available');
    }, 1000);

    return () => clearTimeout(timeout);
  }, [username]);

  const handleNext = () => {
    if (status === 'available') {
      router.push('/(auth)/onboarding/displayname');
    }
  };

  const isDisabled = !username.trim() || status !== 'available';
  const buttonColor = dark ? '#fff' : '#000';
  const fadedColor = dark ? '#ffffff44' : '#00000033';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Text style={[styles.header, { color: colors.text }]}>What would you like us to call you?</Text>
      <Text style={[styles.subtext, { color: colors.text + 'AA' }]}>
        This name helps personalize your experience — it doesn’t have to be your real one.
      </Text>

      {/* Input Field with Status Icon */}
      <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
        <TextInput
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.text + '80'}
        />

        <View style={styles.statusIcon}>
          {status === 'checking' && <ActivityIndicator size="small" color={colors.primary} />}
          {status === 'taken' && <Text style={{ color: 'red', fontSize: 18 }}>✕</Text>}
          {status === 'available' && <Text style={{ color: 'green', fontSize: 18 }}>✓</Text>}
        </View>
      </View>

      {/* Next Button */}
      <TouchableOpacity
        onPress={handleNext}
        disabled={isDisabled}
        style={[
          styles.button,
          {
            backgroundColor: isDisabled ? fadedColor : buttonColor,
          },
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: dark ? (isDisabled ? '#ffffff99' : '#000') : (isDisabled ? '#00000066' : '#fff'),
            },
          ]}
        >
          Next
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputWrapper: {
    position: 'relative',
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  input: {
    fontSize: 16,
    paddingVertical: 14,
  },
  statusIcon: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  button: {
    alignSelf: 'center',
    width: '60%',
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
