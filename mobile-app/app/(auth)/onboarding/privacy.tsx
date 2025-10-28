import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Checkbox, Button } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';

export default function PrivacyStep() {
  const [prefs, setPrefs] = useState({
    privateProfile: false,
    privateDonations: false,
    allowDMs: false,
  });

  const { colors, dark } = useTheme();

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleFinish = () => {
    router.replace('/(tabs)');
  };

  const buttonBg = dark ? '#fff' : '#000';
  const buttonTextColor = dark ? '#000' : '#fff';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Text style={[styles.header, { color: colors.text }]}>Privacy Preferences</Text>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {[
          { key: 'privateProfile', label: 'Keep my profile private' },
          { key: 'privateDonations', label: 'Keep my donations & activity private' },
          { key: 'allowDMs', label: 'Allow users to send me direct messages' },
        ].map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={styles.option}
            onPress={() => toggle(key as keyof typeof prefs)}
            activeOpacity={0.7}
          >
            <Checkbox
              status={prefs[key as keyof typeof prefs] ? 'checked' : 'unchecked'}
              onPress={() => toggle(key as keyof typeof prefs)}
              color={colors.primary}
            />
            <Text style={[styles.optionText, { color: colors.text }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={handleFinish}
        activeOpacity={0.8}
        style={[
          styles.button,
          {
            backgroundColor: buttonBg,
            alignSelf: 'center',
          },
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            { color: buttonTextColor },
          ]}
        >
          Finish
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
    marginBottom: 25,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 40,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  optionText: {
    fontSize: 16,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    width: '60%',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
