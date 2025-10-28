import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';

export default function DonationsStep() {
  const [org, setOrg] = useState('');
  const { colors, dark } = useTheme();

  const [filtered, setFiltered] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const organizations = [
    {
      name: 'Goodwill',
      description: "Empowering individuals through job training and donations.",
      logo: require('@/assets/images/orgs/goodwill.png'),
    },
    {
      name: 'Red Cross',
      description: "Providing emergency aid and disaster relief worldwide.",
      logo: require('@/assets/images/orgs/redcross.png'),
    },
    {
      name: 'Habitat for Humanity',
      description: "Building homes and hope for families around the world.",
      logo: require('@/assets/images/orgs/habitat.png'),
    },
    {
      name: 'UNICEF',
      description: "Advocating for children’s rights and global well-being.",
      logo: require('@/assets/images/orgs/unicef.png'),
    },
  ];

  const handleSearch = (text: string) => {
    setOrg(text);
    if (text.trim().length > 0) {
      const results = organizations.filter((o) =>
        o.name.toLowerCase().includes(text.toLowerCase())
      );
      setFiltered(results);
      setShowDropdown(true);
    } else {
      setFiltered([]);
      setShowDropdown(false);
    }
  };

  const selectOrg = (name: string) => {
    setOrg(name);
    setShowDropdown(false);
  };

  const handleNext = () => {
    router.push('/(auth)/onboarding/privacy');
  };

  const isEmpty = !org.trim();
  const buttonBg = dark ? '#fff' : '#000';
  const buttonTextColor = dark ? '#000' : '#fff';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header + Description */}
        <Text style={[styles.header, { color: colors.text }]}>
          Have you donated to organizations before?
        </Text>
        <Text style={[styles.subtext, { color: colors.text + 'AA' }]}>
          If you've donated to or interacted with any of our partnered organizations before, find and connect with them again.
        </Text>

        {/* Search Input */}
        <TextInput
          placeholder="Search or type organization name"
          value={org}
          onChangeText={handleSearch}
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.card,
            },
          ]}
          placeholderTextColor={colors.text + '80'}
        />

        {/* Dynamic italic helper */}
        <Text style={[styles.helperItalic, { color: colors.text + 'AA' }]}>
          This helps us suggest similar organizations and keep you in the loop with updates from the ones you recognize.
        </Text>

        {/* Dropdown Results */}
        {showDropdown && (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.name}
            style={[styles.dropdown, { backgroundColor: colors.card }]}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => selectOrg(item.name)}
              >
                <Image source={item.logo} style={styles.logo} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.orgName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text
                    style={[styles.orgDesc, { color: colors.text + '99' }]}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Next / Skip Button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={[
            styles.button,
            {
              backgroundColor: buttonBg,
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              { color: buttonTextColor },
            ]}
          >
            {isEmpty ? 'Skip' : 'Next'}
          </Text>
        </TouchableOpacity>

        {/* Bottom Helper */}
        <Text style={[styles.helperText, { color: colors.text + '99' }]}>
          ...or skip for now and let{' '}
          <Text style={{ fontWeight: '700' }}>ClutterHelp</Text> suggest organizations later.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  subtext: {
    fontSize: 14,
    textAlign: 'left',
    marginBottom: 25,
    lineHeight: 20,
    alignSelf: 'flex-start',
  },
  input: {
    borderWidth: 1,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    fontSize: 16,
    marginBottom: 8,
  },
  helperItalic: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'left',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  dropdown: {
    width: '100%',
    borderRadius: 16,
    marginBottom: 25,
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  orgName: {
    fontSize: 16,
    fontWeight: '600',
  },
  orgDesc: {
    fontSize: 13,
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
  helperText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
    width: '80%',
    lineHeight: 18,
  },
});
