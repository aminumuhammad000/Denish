import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  StatusBar,
  Linking,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { respondCallSession } from '../services/api';

const IncomingCallScreen = ({ route, navigation }) => {
  const { 
    callId = '1', 
    callerName = 'Mama\'s Kitchen Driver', 
    phone = '09123882672', 
    orderId = 'Order ORD-005', 
    subtitle = '3.5 km | ₦750' 
  } = route?.params || {};
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const soundRef = useRef(null);

  useEffect(() => {
    // Ringing pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    playIncomingRingtone();

    return () => {
      stopRingtone();
    };
  }, []);

  const playIncomingRingtone = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: 1,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1,
        playThroughEarpieceAndroid: false
      });
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://cdn.freesound.org/previews/536/536420_11861866-lq.mp3' },
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );
      soundRef.current = sound;
      await sound.setVolumeAsync(1.0);
      await sound.playAsync();
    } catch (e) {
      console.log('Incoming ringtone error:', e);
    }
  };

  const stopRingtone = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (e) {
      console.log('Stop ringtone error:', e);
    }
  };

  const handleAcceptCall = async () => {
    stopRingtone();
    try {
      await respondCallSession({ callId, action: 'accept' });
    } catch(e) {}

    // Navigate to active call screen with live connected state
    navigation.replace('Calling', {
      name: callerName,
      phone,
      orderId,
      subtitle
    });
  };

  const handleDeclineCall = async () => {
    stopRingtone();
    try {
      await respondCallSession({ callId, action: 'decline' });
    } catch(e) {}
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{orderId}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.avatarGradient}>
              <View style={[styles.gradientLayer, { backgroundColor: '#3DD26A', opacity: 0.8 }]} />
              <View style={[styles.gradientLayer, { backgroundColor: '#FF8C00', opacity: 0.6, top: '30%' }]} />
            </View>
          </Animated.View>

          <Text style={styles.incomingLabel}>INCOMING CALL...</Text>
          <Text style={styles.userName}>{callerName}</Text>
        </View>

        {/* Accept & Decline Buttons */}
        <View style={styles.controlsRow}>
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity 
              style={styles.declineBtn}
              onPress={handleDeclineCall}
            >
              <Ionicons name="call" size={32} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>
            <Text style={styles.btnLabel}>Decline</Text>
          </View>

          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity 
              style={styles.acceptBtn}
              onPress={handleAcceptCall}
            >
              <Ionicons name="call" size={32} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.btnLabel}>Accept</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
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
    paddingBottom: 60,
  },
  avatarWrapper: {
    width: 240,
    height: 240,
    borderRadius: 120,
    overflow: 'hidden',
    marginBottom: 35,
    elevation: 10,
    shadowColor: '#3DD26A',
    shadowOpacity: 0.25,
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
  incomingLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3DD26A',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingBottom: 60,
    paddingHorizontal: 30,
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
  acceptBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3DD26A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3DD26A',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  btnLabel: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  }
});

export default IncomingCallScreen;
