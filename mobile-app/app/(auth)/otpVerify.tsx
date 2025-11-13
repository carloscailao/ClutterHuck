import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput as RNTextInput,
  Alert,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { supabase } from '@/lib/supabaseClient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OtpVerificationScreen() {
  const { colors, dark } = useTheme();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldown, setCooldown] = useState(120);

  const otpRefs = Array.from({ length: 6 }, () => useRef<RNTextInput>(null));

  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const fade = useRef(new Animated.Value(0)).current;

  // Entry animation (from Sign-in)
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Back navigation (slide right)
  const handleBack = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: SCREEN_WIDTH,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  // cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleOtpChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < otp.length - 1) otpRefs[index + 1]?.current?.focus();

    const code = newOtp.join('');
    if (code.length === 6 && !newOtp.includes('')) verifyOtp(code);
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[index]) return;
      if (index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpRefs[index - 1]?.current?.focus();
      }
    }
  };

  const verifyOtp = async (code: string) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup',
      });

      if (error) {
        setErrorMessage('Invalid or expired OTP. Please try again.');
        return;
      }

      if (data.session) {
        Alert.alert('Verified!', 'Your account has been confirmed.');
        router.replace('/(auth)/name/page');
      }
    } catch (err) {
      setErrorMessage('Something went wrong verifying your OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      Alert.alert('OTP Sent', 'We’ve sent a new verification code to your email.');
      setCooldown(120);
    } catch {
      Alert.alert('Error', 'Could not resend OTP. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  const borderSoft = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const containerBg = dark ? 'rgba(255,255,255,0.02)' : '#ffffff';

  return (
    <Animated.View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          opacity: fade,
          transform: [{ translateX }],
        },
      ]}
    >
      <TouchableOpacity onPress={handleBack} style={styles.topBackButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text + 'CC'} />
      </TouchableOpacity>

      <Text style={[styles.brand, { color: colors.text }]}>ClutterHuck</Text>

      <View style={[styles.formCard, { backgroundColor: containerBg, borderColor: borderSoft }]}>
        <Text style={[styles.title, { color: colors.text }]}>Verify Your Email</Text>
        <Text style={[styles.subtext, { color: colors.text + 'AA' }]}>
          Enter the 6-digit code sent to {email}
        </Text>

        <View style={styles.otpBoxes}>
          {otp.map((digit, index) => (
            <RNTextInput
              key={index}
              ref={otpRefs[index]}
              value={digit}
              onChangeText={(v) => handleOtpChange(v, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              returnKeyType="done"
              style={[
                styles.otpBox,
                {
                  borderColor: dark ? '#bbb' : '#333',
                  backgroundColor: dark ? '#1b1b1b' : '#f6f6f6',
                  color: colors.text,
                },
              ]}
            />
          ))}
        </View>

        {errorMessage ? <Text style={[styles.error, { color: '#cc0000' }]}>{errorMessage}</Text> : null}

        <TouchableOpacity
          onPress={resendOtp}
          style={[
            styles.resendBtn,
            { borderColor: colors.text + '55', opacity: cooldown > 0 ? 0.45 : 1 },
          ]}
          disabled={loading || cooldown > 0}
        >
          <Text style={{ color: colors.text + 'AA' }}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : loading ? 'Resending...' : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  topBackButton: {
    position: 'absolute',
    top: 60,
    left: 25,
    zIndex: 20,
    padding: 6,
    borderRadius: 25,
  },
  brand: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: '800',
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
  },
  title: { 
    fontSize: 22, 
    fontWeight: '700', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  subtext: { 
    fontSize: 13, 
    textAlign: 'center', 
    marginBottom: 20, 
    width: '90%' 
  },
  otpBoxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    flexWrap: 'nowrap',
  },
  otpBox: {
    width: 36,
    height: 44,
    borderRadius: 8,
    borderWidth: 1.25,
    marginHorizontal: 5,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  resendBtn: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 28,
    borderWidth: 1,
    marginTop: 6,
  },
  error: { 
    fontSize: 13, 
    marginTop: 6, 
    marginBottom: 2, 
    textAlign: 'center' 
  },
});