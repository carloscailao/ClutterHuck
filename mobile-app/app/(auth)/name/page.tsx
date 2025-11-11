import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Text, ActivityIndicator } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import { getCurrentUser, getProfileByUid, upsertProfile, supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';

type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

export default function NamePage() {
  const { colors, dark } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Use ReturnType<typeof setTimeout> for cross-environment compatibility
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: userData, error: userErr } = await getCurrentUser();
        if (userErr) throw userErr;
        const uid = userData.user?.id;
        if (!uid) {
          router.replace('./welcome' as const);
          return;
        }

        const { data: profileData, error: profileErr } = await getProfileByUid(uid);
        if (!mounted) return;
        if (profileErr && !/Result contains no rows/i.test(String(profileErr.message ?? profileErr))) {
          console.warn('Profile fetch error', profileErr);
        }
        if (profileData) {
          setFirstName((profileData as any).firstName ?? '');
          setLastName((profileData as any).lastName ?? '');
          setUsername((profileData as any).username ?? '');
          if ((profileData as any).username) setUsernameAvailable(true);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        if (mounted) setInitialLoading(false);
      }
    })();
    return () => {
      mounted = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // username format validator
  const isUsernameFormatValid = (u: string) => /^[a-zA-Z0-9_.-]{3,20}$/.test(u);

  // check username uniqueness (debounced)
  useEffect(() => {
    setUsernameError(null);
    setUsernameAvailable(null);

    const u = username.trim();
    if (!u) return;

    if (!isUsernameFormatValid(u)) {
      setUsernameError('Username must be 3–20 chars: letters, numbers, _, -, .');
      return;
    }

    setUsernameChecking(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await supabase
          .from('profiles')
          .select('auth_uid')
          .eq('username', u)
          .limit(1);

        const dataRows = (res.data as any[]) || [];
        if (res.error) {
          console.warn('Username check error', res.error);
          setUsernameError('Could not verify username. Try again.');
          setUsernameAvailable(null);
        } else {
          if (dataRows.length > 0) {
            const { data: userData } = await getCurrentUser();
            const currentUid = userData.user?.id;
            const ownerUid = dataRows[0].auth_uid;
            if (ownerUid === currentUid) {
              setUsernameAvailable(true);
            } else {
              setUsernameAvailable(false);
              setUsernameError('Username is already taken.');
            }
          } else {
            setUsernameAvailable(true);
          }
        }
      } catch (err) {
        console.error('Username check failed', err);
        setUsernameError('Could not verify username. Try again.');
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username]);

  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    username.trim().length > 0 &&
    isUsernameFormatValid(username.trim()) &&
    usernameAvailable === true;

  const handleNext = async () => {
    setLoading(true);
    try {
      const { data: userData, error: userErr } = await getCurrentUser();
      if (userErr) throw userErr;
      const uid = userData.user?.id;
      if (!uid) {
        Alert.alert('Not signed in', 'Please sign in again.');
        router.replace('./welcome' as const);
        return;
      }

      const payload: ProfileInsert = {
        auth_uid: uid,
        email: userData.user?.email ?? '',
        role: 'user',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        avatar_url: null,
      } as ProfileInsert;

      const { error: upsertErr } = await upsertProfile(payload);
      if (upsertErr) {
        console.error('Profile save failed', upsertErr);
        Alert.alert('Save failed', String(upsertErr.message ?? upsertErr));
        return;
      }

      router.push('/(auth)/avatar/page');
    } catch (err: any) {
      console.error('Unexpected error', err);
      Alert.alert('Error', String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator animating size="large" color={dark ? '#fff' : '#000'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>What should we call you?</Text>
      <Text style={[styles.subtitle, { color: colors.text + 'AA' }]}>
        Provide a display name and username. You can change these later.
      </Text>

      <View style={styles.form}>
        <TextInput
          label="First name"
          testID='firstNameInput'
          value={firstName}
          onChangeText={setFirstName}
          mode="outlined"
          style={styles.input}
          textColor={colors.text}
          outlineColor={dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}
        />
        <Text style={[styles.hint, { color: colors.text + '99' }]}>
          This will be shown to others. Editable after registration.
        </Text>

        <TextInput
          label="Last name"
          testID='lastNameInput'
          value={lastName}
          onChangeText={setLastName}
          mode="outlined"
          style={styles.input}
          textColor={colors.text}
          outlineColor={dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}
        />
        <Text style={[styles.hint, { color: colors.text + '99' }]}>
          This will be shown to others. Editable after registration.
        </Text>

        <TextInput
          label="Username"
          testID='usernameInput'
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          style={styles.input}
          textColor={colors.text}
          outlineColor={dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}
          right={usernameChecking ? <TextInput.Icon icon={() => <ActivityIndicator animating size={16} color={colors.text} />} /> : null}
        />
        <Text 
          testID='usernameCheckLabel'
          style={[styles.hint, { color: usernameError ? '#cc0000' : colors.text + '99' }]}
        >
          {usernameError ?? 'Unique username. Editable after registration.'}
        </Text>

        <TouchableOpacity
          testID='nextButton'
          onPress={handleNext}
          disabled={!isFormValid || loading}
          style={[
            styles.button,
            { backgroundColor: loading ? (dark ? '#666' : '#ccc') : (dark ? '#FFF' : '#000') },
            (!isFormValid || loading) ? { opacity: 0.5 } : null,
          ]}
        >
          {loading ? (
            <ActivityIndicator animating size="small" color={dark ? '#000' : '#fff'} />
          ) : (
            <Text style={[styles.buttonText, { color: dark ? '#000' : '#fff' }]}>Next</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
  form: { borderRadius: 12, padding: 8 },
  input: { marginBottom: 6, backgroundColor: 'transparent' },
  hint: { fontSize: 12, marginBottom: 12 },
  button: { paddingVertical: 14, borderRadius: 50, alignItems: 'center', marginTop: 8 },
  buttonText: { fontWeight: '700', fontSize: 16 },
});