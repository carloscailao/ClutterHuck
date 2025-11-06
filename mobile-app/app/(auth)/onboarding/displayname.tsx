import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';

type AuthStatus = 'idle' | 'saving';

export default function DisplayNameStep() {
  const [displayName, setDisplayName] = useState<string>('');
  const [status, setStatus] = useState<AuthStatus>('idle');
  const { colors, dark } = useTheme();

  const isNameValid: boolean = displayName.trim().length >= 2;

  const handleNext = async () => {
    if (!isNameValid) {
        Alert.alert('Invalid Input', 'Please enter a name with at least 2 characters.');
        return;
    }
    
    setStatus('saving');
    
    try {
        // MOCK API CALL: Replace with updateDisplayName(userId, displayName.trim()) when integrating Supabase
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log(`Frontend Mock Save: Display Name "${displayName.trim()}" set.`);

       router.replace('/(tabs)');

    } catch (e) {
        Alert.alert('Transition Error', 'Failed to navigate to the next step.');
    } finally {
        setStatus('idle');
    }
  };

  const isDisabled = !isNameValid || status === 'saving';
  const buttonColor = dark ? '#fff' : '#000';
  const fadedColor = dark ? '#ffffff44' : '#00000033';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>What should we call you?</Text>
      <Text style={[styles.subtext, { color: colors.text + 'AA' }]}>
        This display name will be visible to others in ClutterHuck.
      </Text>

      {/* INPUT FIELD WITH VISIBILITY ADJUSTMENTS */}
      <View style={[
          styles.inputWrapper, 
          { 
              borderColor: colors.border, 
              // Add a slight background color to ensure the field area is visible
              backgroundColor: dark ? colors.text + '10' : colors.text + '05', 
              ...Platform.select({ web: { maxWidth: 400, alignSelf: 'center' } }) 
          }
      ]}>
        <TextInput
          placeholder="Enter your display name"
          value={displayName}
          onChangeText={setDisplayName}
          style={[
              styles.input, 
              { 
                  color: colors.text,
                  // Ensure a minimum height if padding fails
                  minHeight: 20 
              }
          ]}
          placeholderTextColor={colors.text + '80'}
          autoCapitalize="words" 
          autoCorrect={false}
        />
      </View>

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
        {status === 'saving' ? (
          <ActivityIndicator color={dark ? '#000' : '#fff'} />
        ) : (
          <Text
            style={[
              styles.buttonText,
              {
                color: dark ? (isDisabled ? '#ffffff99' : '#000') : (isDisabled ? '#00000066' : '#fff'),
              },
            ]}
          >
            Continue
          </Text>
        )}
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
    height: 50, 
  },
  button: {
    alignSelf: 'center',
    width: '60%',
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});