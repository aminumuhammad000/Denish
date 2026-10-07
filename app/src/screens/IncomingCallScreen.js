import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playRingtone, stopRingtone } from '../utils/callAudio';
import { respondCallSession, fetchCallStatus } from '../services/api';

const IncomingCallScreen = ({ route, navigation }) => {
  const { 
    callId = null, 
    callerName = 'Incoming Caller', 
    phone = '08012345678', 
    orderId = 'Delivery Voice Call', 
    subtitle = '' 
  } = route?.params || {};
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pollRef = useRef(null);
  const isHandledRef = useRef(false);

  useEffect(() => {
    // Ringing pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();

    playRingtone('incoming');

    // Poll to detect if the caller hung up before we answered
    if (callId) {
      pollRef.current = setInterval(async () => {
        if (isHandledRef.current) return;
        try {
          const res = await fetchCallStatus(callId);
          if (res && res.success) {
            if (res.status === 'ended' || res.status === 'declined' || res.status === 'missed') {
              handleAutoDismiss();
            }
          }
        } catch (e) {
          // Poll retry
        }
      }, 1500);
    }

    return () => {
      pulse.stop();
      stopRingtone();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [callId]);

  const handleAutoDismiss = () => {
    if (isHandledRef.current) return;
    isHandledRef.current = true;
    stopRingtone();
    if (pollRef.current) clearInterval(pollRef.current);
    navigation.goBack();
  };

  const handleAcceptCall = async () => {
    if (isHandledRef.current) return;
    isHandledRef.current = true;

    stopRingtone();
    if (pollRef.current) clearInterval(pollRef.current);

    if (callId) {
      try {
        await respondCallSession({ callId, action: 'accept' });
      } catch (e) {
        console.error('Accept call error:', e);
      }
    }

    // Navigate to live connected Calling screen as receiver
    navigation.replace('Calling', {
      callId,
      isReceiver: true,
      name: callerName,
      phone,
      orderId,
      subtitle
    });
  };

  const handleDeclineCall = async () => {
    if (isHandledRef.current) return;
    isHandledRef.current = true;

    stopRingtone();
    if (pollRef.current) clearInterval(pollRef.current);

    if (callId) {
      try {
        await respondCallSession({ callId, action: 'decline' });
      } catch (e) {
        console.error('Decline call error:', e);
      }
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{orderId}</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{subtitle || 'Incoming Voice Call'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.avatarGradient}>
              <View style={[styles.gradientLayer, { backgroundColor: '#3DD26A', opacity: 0.85 }]} />
              <View style={[styles.gradientLayer, { backgroundColor: '#FF8C00', opacity: 0.65, top: '30%' }]} />
            </View>
          </Animated.View>

          <Text style={styles.incomingLabel}>INCOMING CALL...</Text>
          <Text style={styles.userName}>{callerName}</Text>
          {phone ? <Text style={styles.phoneText}>{phone}</Text> : null}
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
    marginTop: 2,
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
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  phoneText: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
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
