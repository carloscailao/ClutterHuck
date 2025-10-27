import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';

export default function SpaceStep() {
  const [categories, setCategories] = useState<string[]>([]);
  const { colors, dark } = useTheme();

  const items = [
    'Clothing', 'Books', 'Electronics', 'Furniture', 'Toys', 'Kitchenware',
    'Sports', 'Art Supplies', 'Appliances', 'Tools', 'Decor', 'Documents',
    'Collectibles', 'Games', 'Outdoor', 'Other',
  ];

  const toggle = (item: string) =>
    setCategories((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );

  const handleNext = () => {
    router.push('/(auth)/onboarding/donations');
  };

  const isEmpty = categories.length === 0;
  const buttonBg = dark ? '#fff' : '#000';
  const buttonTextColor = dark ? '#000' : '#fff';
  const softBorder = colors.text + '22';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Centered content */}
      <View style={styles.content}>
        <Text style={[styles.header, { color: colors.text }]}>
          What’s in your space?
        </Text>
        <Text style={[styles.subtext, { color: colors.text + 'AA' }]}>
          Start by adding a few things you want to keep track of or consider giving away.
        </Text>

        {/* Category Grid */}
        <View style={styles.grid}>
          {items.map((item) => {
            const isSelected = categories.includes(item);
            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.category,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : softBorder,
                  },
                ]}
                onPress={() => toggle(item)}
              >
                <Text
                  style={{
                    color: isSelected ? colors.background : colors.text,
                    fontWeight: isSelected ? '600' : '400',
                  }}
                >
                  {item} {isSelected ? '✕' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Next / Skip Button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={[
            styles.button,
            {
              backgroundColor: buttonBg,
              opacity: 1,
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

        {/* Helper Text */}
        <Text style={[styles.helperText, { color: colors.text + '99' }]}>
          ...or skip for now and let <Text style={{ fontWeight: '700' }}>ClutterHelp</Text> do it for you later on.
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
    width: '85%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  category: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    margin: 6,
  },
  button: {
    width: '60%',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 10,
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
