import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sound } from 'expo-av/build/Audio/Sound';

const RINGING_SOUND_URL = 'https://www.soundjay.com/phone/phone-calling-1.mp3';

const CallingScreen = ({ route, navigation }) => {
  const { name = 'Kolawole Adeleke', orderId = 'Order ORD-005', subtitle = '3.5 km | ₦750' } = route?.params || {};
  
  const pulseAnim = new Animated.Value(1);
  const soundRef = React.useRef(null);

  useEffect(() => {
    // Pulse Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Play Sound
    const playSound = async () => {
      try {
        const { sound } = await Sound.createAsync(
          { uri: RINGING_SOUND_URL },
          { shouldPlay: true, isLooping: true }
        );
        soundRef.current = sound;
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    };

    playSound();

    // Cleanup
    return () => {
      if (soundRef.current) {
        soundRef.current.stopAsync();
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{orderId}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Animated Gradient Avatar Placeholder */}
        <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.avatarGradient}>
             {/* Large blurry gradient circle simulation */}
             <View style={[styles.gradientLayer, { backgroundColor: '#FF8C00', opacity: 0.8 }]} />
             <View style={[styles.gradientLayer, { backgroundColor: '#10B981', opacity: 0.6, top: '30%' }]} />
          </View>
        </Animated.View>

        <Text style={styles.userName}>{name}</Text>
        <Text style={styles.statusText}>calling...</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.declineBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="call" size={32} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    padding: 5,
    marginRight: 15,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  avatarWrapper: {
    width: 250,
    height: 250,
    borderRadius: 125,
    overflow: 'hidden',
    marginBottom: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  avatarGradient: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  gradientLayer: {
    position: 'absolute',
    width: '200%',
    height: '200%',
    borderRadius: 500,
    left: '-50%',
    top: '-50%',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  declineBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
});

export default CallingScreen;
