import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

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
      <View style={styles.slide}>
        <Image
          source={item.image}
          style={styles.image}
          resizeMode="contain"
        />
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
        contentContainerStyle={{ height: height * 0.75 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        renderItem={({ item }) => <Slide item={item} />}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
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
          
          {currentSlideIndex < SLIDES.length - 1 && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={skip}
              style={styles.skipBtn}
            >
              <Text style={styles.skipBtnText}>Skip</Text>
            </TouchableOpacity>
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
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
  },
  textContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  footer: {
    height: height * 0.25,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  indicator: {
    height: 4,
    width: 20,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 3,
    borderRadius: 2,
  },
  activeIndicator: {
    backgroundColor: Colors.primary,
    width: 30,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  btn: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  skipBtn: {
    alignItems: 'center',
  },
  skipBtnText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default OnboardingScreen;
