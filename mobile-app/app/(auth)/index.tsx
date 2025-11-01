import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabaseClient';
import { useTheme } from '@react-navigation/native';

export default function AuthScreen() {
  const { colors, dark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [invalidCred, setInvalidCred] = useState(false);
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);

  // Animation
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateSwitch = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSignUp((prev) => !prev);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Reset error messages when typing
  useEffect(() => {
    if (errorMessage) setErrorMessage('');
    if (invalidCred) setInvalidCred(false);
  }, [email, password]);

  // Password validation
  useEffect(() => {
    if (isSignUp) {
      if (password.length === 0) setPasswordValid(null);
      else setPasswordValid(password.length >= 6);
    }
  }, [password, isSignUp]);

  // Auth Handler
  const handleAuth = async () => {
    setLoading(true);
    setErrorMessage('');
    setInvalidCred(false);

    try {
      if (isSignUp) {
        if (!passwordValid) {
          setErrorMessage('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }

        // Sign-Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          console.error('Sign-up Error:', error);
          if (error.message.includes('already registered'))
            setErrorMessage('This email is already registered.');
          else setErrorMessage(error.message);
          return;
        }

        if (data.user?.id) {
          console.log('User created:', data.user);
          await supabase.from('profiles').insert([{ auth_uid: data.user.id }]);
        }

        // OTP Page
        Alert.alert(
          'Verification Required',
          'We sent a verification code to your email. Please enter it to continue.'
        );

        router.push({
          pathname: '/(auth)/otpVerify',
          params: { email },
        });
      } else {
        // Log In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Sign-in Error:', error);
          if (error.message.toLowerCase().includes('invalid')) {
            setErrorMessage('Incorrect email or password.');
            setInvalidCred(true);
          } else setErrorMessage(error.message);
          return;
        }

        if (data.session) {
          console.log('Sign-in successful:', data.session);
          router.replace('/(tabs)');
        }
      }
    } catch (err) {
      console.error('Unexpected Error:', err);
      setErrorMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert('Skipping Sign-In', 'Going to sample onboarding screen...');
    router.replace('/(auth)/onboarding/username');
  };

  // Validation
  const isInvalidEmail = email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isEmpty = !email.trim() || !password.trim();
  const isDisabled = isSignUp
    ? isEmpty || isInvalidEmail || !passwordValid
    : isEmpty || invalidCred;

  // Theme Colors
  const buttonBg = dark ? '#FFF' : '#000';
  const buttonTextColor = dark ? '#000' : '#FFF';
  const borderSoft = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const containerBg = dark ? 'rgba(255,255,255,0.03)' : '#fafafa';
  const fadedText = dark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)';
  const focusColor = dark ? '#FFF' : '#000';
  const passwordErrorColor = dark ? '#ff7a7a' : '#cc0000';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.brand, { color: colors.text }]}>ClutterHuck</Text>

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          width: '100%',
        }}
      >
        <View style={styles.contentWrapper}>
          <Text style={[styles.title, { color: colors.text }]}>
            {isSignUp ? 'Create an Account' : 'Log in'}
          </Text>
          <Text style={[styles.subtext, { color: colors.text + 'AA' }]}>
            {isSignUp
              ? 'Join us to start decluttering with purpose.'
              : 'Continue your ClutterHuck journey.'}
          </Text>

          <View
            style={[
              styles.formCard,
              { backgroundColor: containerBg, borderColor: borderSoft },
            ]}
          >
            {/* Email Text Input */}
            <TextInput
              label="  Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              textColor={colors.text}
              placeholderTextColor={colors.text + '80'}
              mode="outlined"
              outlineColor={borderSoft}
              activeOutlineColor={focusColor}
              selectionColor={focusColor}
              cursorColor={focusColor}
              theme={{
                roundness: 50,
                colors: {
                  primary: focusColor,
                  outline: borderSoft,
                  text: colors.text,
                  placeholder: colors.text + '88',
                  background: colors.card,
                },
              }}
            />

            {/* Password Text Input */}
            <View style={{ position: 'relative' }}>
              <TextInput
                label="  Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                textColor={colors.text}
                placeholderTextColor={colors.text + '80'}
                mode="outlined"
                outlineColor={borderSoft}
                activeOutlineColor={focusColor}
                selectionColor={focusColor}
                cursorColor={focusColor}
                right={
                  isSignUp && password.length > 0 ? (
                    <TextInput.Icon
                      icon={() => (
                        <Ionicons
                          name={
                            passwordValid
                              ? 'checkmark-circle'
                              : 'close-circle'
                          }
                          size={20}
                          color={
                            passwordValid
                              ? dark
                                ? '#7CFC7C'
                                : '#28a745'
                              : passwordErrorColor
                          }
                        />
                      )}
                    />
                  ) : null
                }
                theme={{
                  roundness: 50,
                  colors: {
                    primary: focusColor,
                    outline: borderSoft,
                    text: colors.text,
                    placeholder: colors.text + '88',
                    background: colors.card,
                  },
                }}
              />
              {isSignUp && password.length > 0 && !passwordValid && (
                <Text
                  style={[styles.passwordHint, { color: passwordErrorColor }]}
                >
                  Password must be at least 6 characters long.
                </Text>
              )}
            </View>

            {errorMessage ? (
              <Text style={[styles.error, { color: 'red' }]}>{errorMessage}</Text>
            ) : null}

            {/* Main Button */}
            <TouchableOpacity
              onPress={handleAuth}
              activeOpacity={0.8}
              disabled={isDisabled || loading}
              style={[
                styles.button,
                { backgroundColor: buttonBg, opacity: isDisabled ? 0.4 : 1 },
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: isDisabled ? fadedText : buttonTextColor },
                ]}
              >
                {loading
                  ? 'Loading...'
                  : isSignUp
                    ? 'Create Account'
                    : 'Log In'}
              </Text>
            </TouchableOpacity>

            {/* Switching */}
            <View style={styles.switchContainer}>
              {isSignUp ? (
                <Text style={[styles.switchText, { color: fadedText }]}>
                  Already have an account?{' '}
                  <Text
                    style={[
                      styles.linkText,
                      { color: colors.text, textDecorationLine: 'underline' },
                    ]}
                    onPress={animateSwitch}
                  >
                    Log In
                  </Text>
                </Text>
              ) : (
                <Text style={[styles.switchText, { color: fadedText }]}>
                  New to ClutterHuck?{' '}
                  <Text
                    style={[
                      styles.linkText,
                      { color: colors.text, textDecorationLine: 'underline' },
                    ]}
                    onPress={animateSwitch}
                  >
                    Create an Account
                  </Text>
                </Text>
              )}
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Skip to Onboarding */}
      <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
        <Text style={[styles.skipText, { color: colors.text + '88' }]}>
          Skip to Onboarding (Sample)
        </Text>
      </TouchableOpacity>

      {/* View OTP Page */}
      <TouchableOpacity
        onPress={() => router.push({ pathname: '/(auth)/otpVerify', params: { email } })}
        style={styles.skipButton}
      >
        <Text style={[styles.skipText, { color: colors.text + '88' }]}>
          View OTP Page (Sample)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25
  },
  brand: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    fontSize: 22,
    fontWeight: '800',
  },
  contentWrapper: {
    justifyContent: 'center',
    flexGrow: 1,
    marginTop: 60
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  subtext: { 
    fontSize: 14, 
    textAlign: 'center', 
    marginBottom: 30 
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  input: { 
    borderRadius: 50, 
    marginBottom: 15 
  },
  passwordHint: { 
    fontSize: 12, 
    marginTop: -10, 
    marginLeft: 15, 
    marginBottom: 8 
  },
  button: { 
    paddingVertical: 16, 
    borderRadius: 50, 
    alignItems: 'center', 
    marginTop: 10 
  },
  buttonText: { 
    fontWeight: '700', 
    fontSize: 16 
  },
  error: { 
    fontSize: 13, 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  switchContainer: { 
    alignItems: 'center', 
    marginTop: 20 
  },
  switchText: { 
    fontSize: 14 
  },
  linkText: { 
    fontWeight: '600' 
  },
  skipButton: { 
    alignSelf: 'center', 
    marginTop: 25 
  },
  skipText: { 
    fontSize: 13 
  },
});
