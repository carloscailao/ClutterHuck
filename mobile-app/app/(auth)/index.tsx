import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabaseClient';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user?.id) {
          await supabase.from('profiles').insert([{ auth_uid: data.user.id }]);
        }

        Alert.alert('Welcome!', 'Let’s personalize your experience 🎉');
        router.replace('/(auth)/onboarding/username');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) router.replace('/(tabs)');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert('Skipping Sign-In', 'Going to sample onboarding screen...');
    router.replace('/(auth)/onboarding/username');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Log In'}</Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button mode="contained" onPress={handleAuth} loading={loading} style={styles.button}>
        {isSignUp ? 'Sign Up' : 'Log In'}
      </Button>

      <Button onPress={() => setIsSignUp(!isSignUp)} style={styles.link}>
        {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
      </Button>

      <Button mode="outlined" onPress={handleSkip} style={styles.skip}>
        Skip to Onboarding (Sample)
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { marginBottom: 15 },
  button: { marginBottom: 10 },
  link: { marginBottom: 10 },
  skip: { borderColor: '#888', marginTop: 10 },
});
