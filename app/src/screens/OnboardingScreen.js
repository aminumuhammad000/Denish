import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../constants/Colors';

const SLIDES = [
  {
    id: '1',
    title: 'Discover Delicious Food',
    description: 'Browse thousands of dishes and raw foods from top local vendors near you.',
    image: require('../../assets/onboarding/food.png'),
    buttonLabel: 'Next',
  },
  {
    id: '2',
    title: 'Fast and Reliable Delivery',
    description: 'Get your food delivered in 30 minutes or less with real-time tracking.',
    image: require('../../assets/onboarding/delivery.png'),
    buttonLabel: 'Next',
  },
  {
    id: '3',
    title: 'Easy and Secure Payment',
    description: 'Pay your way - cards, wallet, or cash on delivery.',
    image: require('../../assets/onboarding/payment.png'),
    buttonLabel: 'Get Started',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const ref = useRef();

  const updateCurrentSlideIndex = (e) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex < SLIDES.length) {
      const offset = nextSlideIndex * width;
      ref?.current.scrollToOffset({ offset });
      setCurrentSlideIndex(nextSlideIndex);
    } else {
      navigation.replace('RoleSelection');
    }
  };

  const skip = () => {
    navigation.replace('RoleSelection');
  };

  const Slide = ({ item }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={[styles.image, { width: Math.min(width * 0.8, 320), height: Math.max(180, Math.min(height * 0.35, 300)) }]}
            resizeMode="contain"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={ref}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        data={SLIDES}
        style={{ flex: 1 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        renderItem={({ item }) => <Slide item={item} />}
        keyExtractor={(item) => item.id}
      />

      <View style={[styles.footer, { minHeight: 140 }]}>
        {/* Pagination Indicator */}
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlideIndex === index && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={goToNextSlide}
            style={styles.btn}
          >
            <Text style={styles.btnText}>
              {currentSlideIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
          
          {currentSlideIndex < SLIDES.length - 1 ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={skip}
              style={styles.skipBtn}
            >
              <Text style={styles.skipBtnText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.skipBtn, { opacity: 0 }]} pointerEvents="none">
              <Text style={styles.skipBtnText}>Skip</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  image: {
    // Width and height are set dynamically
  },
  textContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 15,
  },
  footer: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 24,
  },
  indicator: {
    height: 8,
    width: 8,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
    borderRadius: 4,
  },
  activeIndicator: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  btn: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 20,
  },
  skipBtnText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OnboardingScreen;

