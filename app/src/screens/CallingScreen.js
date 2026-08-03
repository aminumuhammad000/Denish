import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { initiateCallSession, respondCallSession } from '../services/api';

const CallingScreen = ({ route, navigation }) => {
  const { name = 'Temmy Store', phone = '09123882672', orderId = 'Order ORD-005', subtitle = '3.5 km | ₦750' } = route?.params || {};
  
  const [callState, setCallState] = useState('Ringing...'); // 'Ringing...', '00:01', 'Ended'
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const soundRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Pulsing avatar ring animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    // Play ringing sound until answered
    playRingtoneSound();
    
    // Save call session to MongoDB and poll for acceptance
    let currentCallId = null;
    initiateCallSession({ receiverName: name, orderId, subtitle })
      .then(res => {
        if (res.success && res.call?._id) {
          currentCallId = res.call._id;
          pollCallStatus(currentCallId);
        }
      })
      .catch(console.error);

    return () => {
      stopRingtoneSound();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const pollCallStatus = (callId) => {
    // Keep ringing until receiver explicitly accepts call session in backend
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`http://192.168.1.85:3000/api/customer/call/status/${callId}`);
        const data = await res.json();
        if (data.success && data.status === 'accepted') {
          clearInterval(pollInterval);
          stopRingtoneSound();
          setCallState('Connected');
          startCallTimer();
        } else if (data.success && (data.status === 'declined' || data.status === 'ended')) {
          clearInterval(pollInterval);
          stopRingtoneSound();
          setCallState('Call Declined');
          setTimeout(() => navigation.goBack(), 1000);
        }
      } catch (e) {
        // Continue ringing
      }
    }, 2000);
  };

  const playRingtoneSound = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: 1, // InterruptionModeIOS.DoNotMix
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1, // InterruptionModeAndroid.DoNotMix
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
      console.log('Ringtone audio play error:', e);
    }
  };

  const stopRingtoneSound = async () => {
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

  const startCallTimer = () => {
    let seconds = 0;
    timerRef.current = setInterval(() => {
      seconds += 1;
      setCallDuration(seconds);
    }, 1000);
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleEndCall = () => {
    stopRingtoneSound();
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState('Call Ended');
    setTimeout(() => {
      navigation.goBack();
    }, 800);
  };

  const triggerDirectCellularCall = () => {
    const cleanNumber = phone ? phone.replace(/[^0-9+]/g, '') : '09123882672';
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      Alert.alert('Calling', `Dialing ${cleanNumber}`);
    });
  };

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
        <TouchableOpacity onPress={triggerDirectCellularCall} style={styles.dialerBtn}>
          <Ionicons name="call-outline" size={22} color="#FF7A00" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.avatarGradient}>
            <View style={[styles.gradientLayer, { backgroundColor: '#FF8C00', opacity: 0.8 }]} />
            <View style={[styles.gradientLayer, { backgroundColor: '#10B981', opacity: 0.6, top: '30%' }]} />
          </View>
        </Animated.View>

        <Text style={styles.userName}>{name}</Text>
        <Text style={[styles.statusText, callState === 'Connected' && { color: '#10B981' }]}>
          {callState === 'Connected' ? formatTimer(callDuration) : callState}
        </Text>
      </View>

      {/* Call Controls: Mute, Speaker, End Call */}
      <View style={styles.controlsRow}>
        <TouchableOpacity 
          style={[styles.controlBtn, isMuted && styles.controlBtnActive]} 
          onPress={() => setIsMuted(!isMuted)}
        >
          <Ionicons name={isMuted ? "mic-off" : "mic"} size={26} color={isMuted ? "#FFF" : "#333"} />
          <Text style={[styles.controlText, isMuted && { color: '#FFF' }]}>{isMuted ? 'Muted' : 'Mute'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.declineBtn}
          onPress={handleEndCall}
        >
          <Ionicons name="call" size={32} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]} 
          onPress={() => setIsSpeaker(!isSpeaker)}
        >
          <Ionicons name={isSpeaker ? "volume-high" : "volume-medium-outline"} size={26} color={isSpeaker ? "#FFF" : "#333"} />
          <Text style={[styles.controlText, isSpeaker && { color: '#FFF' }]}>{isSpeaker ? 'Speaker On' : 'Speaker'}</Text>
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
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  controlBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnActive: {
    backgroundColor: '#FF7A00',
  },
  controlText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 4,
  },
  dialerBtn: {
    padding: 8,
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  }
});

export default CallingScreen;
