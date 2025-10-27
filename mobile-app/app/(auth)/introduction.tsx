import React, { useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: require('@/assets/images/intro/intro1.png'),
    header: 'Welcome!',
    subtitle: "Find purpose in what you keep and give new life to what you dont.",
  },
  {
    id: '2',
    image: require('@/assets/images/intro/intro2.png'),
    header: 'Manage your space',
    subtitle: 'Use AI-powered ClutterHelp to scan, label, and track your items effortlessly.\n\nGet gentle guidance. Not sure where to start? Our smart assistant helps you break things down, one small win at a time.',
  },
  {
    id: '3',
    image: require('@/assets/images/intro/intro3.png'),
    header: 'Let go, give forward',
    subtitle: "Post items you're ready to part with and make them visible to those who need them.\n\nBrows trusted organizations or individuals, and send your items where they'll make a difference.",
  },
  {
    id: '4',
    image: require('@/assets/images/intro/intro4.png'),
    header: 'Clean up, level up!',
    subtitle: 'Upon achieving decluttering tasks, earn badges and display them on your profile!\n\nEarn coupons and vouchers from partner organizations when you donate!',
  },
];

export default function IntroductionPage() {
  const [index, setIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const nextSlide = () => {
    if (index < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      router.replace('/(auth)'); // Go to login/signup
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={slides}
        ref={flatListRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
            <Text style={styles.header}>{item.header}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === index ? '#0A7EA4' : '#D3D3D3' },
            ]}
          />
        ))}
      </View>

      {/* Custom Next button */}
      <TouchableOpacity style={styles.nextButton} onPress={nextSlide}>
        <Text style={styles.nextButtonText}>
          {index === slides.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', // Always white
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  slide: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20 
  },
  image: { 
    width: width * 0.8, 
    height: width * 0.7, 
    marginBottom: 30 
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: '#11181C',
    marginBottom: 10 
  },
  subtitle: { 
    fontSize: 16, 
    textAlign: 'center', 
    color: '#333333' 
  },
  pagination: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginVertical: 20 
  },
  dot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    marginHorizontal: 5 
  },
  nextButton: {
    backgroundColor: '#0A7EA4',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 30,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});
