import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import { playRingtone, stopRingtone } from '../utils/callAudio';
import { initiateCallSession, respondCallSession, fetchCallStatus } from '../services/api';

const CallingScreen = ({ route, navigation }) => {
  const { 
    name = 'Recipient', 
    phone = '08012345678', 
    orderId = 'Connecting Call...', 
    subtitle = '',
    callId: initialCallId = null,
    receiverId = null,
    isReceiver = false
  } = route?.params || {};
  
  const [callState, setCallState] = useState(isReceiver ? 'Connected' : 'Ringing...');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  const callIdRef = useRef(initialCallId);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);
  const pollRef = useRef(null);
  const isEndedRef = useRef(false);

  useEffect(() => {
    // Pulsing avatar ring animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();

    if (isReceiver) {
      // Receiver accepted the call from IncomingCallScreen
      setCallState('Connected');
      startCallTimer();
      if (initialCallId) {
        startStatusPolling(initialCallId);
      }
    } else {
      // Caller initiated outgoing call
      playRingtone('outgoing');
      
      initiateCallSession({ 
        receiverName: name, 
        receiverId,
        orderId, 
        subtitle, 
        phone 
      })
        .then(res => {
          if (res && res.success && res.call?._id) {
            callIdRef.current = res.call._id;
            startStatusPolling(res.call._id);
          }
        })
        .catch(err => {
          console.error('Call initiation error:', err);
        });

      // Auto-timeout after 45 seconds of ringing
      const autoTimeout = setTimeout(() => {
        if (callState === 'Ringing...' && !isEndedRef.current) {
          handleEndCall('No Answer');
        }
      }, 45000);

      return () => clearTimeout(autoTimeout);
    }

    return () => {
      pulse.stop();
      cleanupCall();
    };
  }, []);

  const cleanupCall = () => {
    stopRingtone();
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current) clearInterval(pollRef.current);

    if (callIdRef.current && !isEndedRef.current) {
      isEndedRef.current = true;
      respondCallSession({ callId: callIdRef.current, action: 'end' }).catch(() => {});
    }
  };

  const startStatusPolling = (callId) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      if (isEndedRef.current) return;
      try {
        const data = await fetchCallStatus(callId);
        if (data && data.success) {
          if (data.status === 'accepted') {
            if (callState !== 'Connected') {
              stopRingtone();
              setCallState('Connected');
              startCallTimer();
            }
          } else if (data.status === 'declined') {
            handleCallTerminated('Call Declined');
          } else if (data.status === 'ended' || data.status === 'missed') {
            handleCallTerminated('Call Ended');
          }
        }
      } catch (e) {
        // Polling retry
      }
    }, 1500);
  };

  const handleCallTerminated = (label) => {
    if (isEndedRef.current) return;
    isEndedRef.current = true;
    stopRingtone();
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current) clearInterval(pollRef.current);
    setCallState(label);
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };

  const startCallTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
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

  const handleEndCall = (customLabel = 'Call Ended') => {
    if (isEndedRef.current) return;
    isEndedRef.current = true;

    stopRingtone();
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current) clearInterval(pollRef.current);

    if (callIdRef.current) {
      respondCallSession({ callId: callIdRef.current, action: 'end' }).catch(() => {});
    }

    setCallState(customLabel);
    setTimeout(() => {
      navigation.goBack();
    }, 700);
  };

  const triggerDirectCellularCall = () => {
    const cleanNumber = phone ? phone.replace(/[^0-9+]/g, '') : '08012345678';
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      Alert.alert('Phone Call', `Dialing ${cleanNumber}`);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handleEndCall('Call Ended')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{orderId}</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{subtitle || 'In-App Voice Call'}</Text>
        </View>
        <TouchableOpacity onPress={triggerDirectCellularCall} style={styles.dialerBtn}>
          <Ionicons name="call" size={18} color="#FF7A00" />
          <Text style={styles.dialerText}>Cellular</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.avatarGradient}>
              <View style={[styles.gradientLayer, { backgroundColor: '#FF8C00', opacity: 0.85 }]} />
              <View style={[styles.gradientLayer, { backgroundColor: '#10B981', opacity: 0.65, top: '30%' }]} />
            </View>
          </Animated.View>

          <Text style={styles.userName}>{name}</Text>
          <Text style={[styles.statusText, callState === 'Connected' && { color: '#10B981' }]}>
            {callState === 'Connected' ? formatTimer(callDuration) : callState}
          </Text>

          {/* Voice Indicator */}
          {callState === 'Connected' && (
            <View style={styles.liveAudioBadge}>
              <Ionicons name="radio" size={16} color="#10B981" />
              <Text style={styles.liveAudioText}>In-App Audio Connected</Text>
            </View>
          )}
        </View>

        {/* Quick Cellular Call Banner */}
        <TouchableOpacity style={styles.carrierBanner} onPress={triggerDirectCellularCall}>
          <Ionicons name="phone-portrait-outline" size={20} color="#FF7A00" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.carrierTitle}>Switch to Direct Phone Call</Text>
            <Text style={styles.carrierSub}>Dial {phone || 'Carrier Number'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#FF7A00" />
        </TouchableOpacity>

        {/* Call Controls: Mute, End Call, Speaker */}
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
            onPress={() => handleEndCall('Call Ended')}
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
  backBtn: {
    padding: 5,
    marginRight: 10,
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
    paddingVertical: 40,
  },
  avatarWrapper: {
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: 'hidden',
    marginBottom: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
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
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 17,
    color: '#FF7A00',
    fontWeight: '600',
  },
  liveAudioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 15,
  },
  liveAudioText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 6,
  },
  carrierBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    marginHorizontal: 24,
    marginBottom: 25,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  carrierTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9A3412',
  },
  carrierSub: {
    fontSize: 11,
    color: '#C2410C',
    marginTop: 2,
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
    paddingBottom: 40,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  dialerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF7A00',
    marginLeft: 4,
  }
});

export default CallingScreen;
