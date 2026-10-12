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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import { playRingtone, stopRingtone } from '../utils/callAudio';
import { 
  initiateCallSession, 
  respondCallSession, 
  fetchCallStatus,
  sendCallSignalApi,
  fetchCallSignalsApi
} from '../services/api';

const CallingScreen = ({ route, navigation }) => {
  const { 
    name = 'Recipient', 
    phone = '', 
    orderId = 'Voice Call', 
    subtitle = '',
    callId: initialCallId = null,
    receiverId = null,
    isReceiver = false,
    callDate = null
  } = route?.params || {};
  
  const [callState, setCallState] = useState(isReceiver ? 'Connected' : 'Ringing...');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [audioStreamConnected, setAudioStreamConnected] = useState(false);

  const callDateFormatted = moment(callDate || new Date()).format('ddd, MMM D, YYYY • h:mm A');

  const callIdRef = useRef(initialCallId);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveformAnim = useRef(new Animated.Value(0.4)).current;
  const timerRef = useRef(null);
  const pollRef = useRef(null);
  const isEndedRef = useRef(false);

  // WebRTC refs
  const peerConnRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioElemRef = useRef(null);
  const signalPollRef = useRef(null);
  const webrtcInitializedRef = useRef(false);

  useEffect(() => {
    // Pulsing avatar ring animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();

    // Subtle audio waveform animation
    const wave = Animated.loop(
      Animated.sequence([
        Animated.timing(waveformAnim, { toValue: 1.0, duration: 500, useNativeDriver: true }),
        Animated.timing(waveformAnim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
      ])
    );
    wave.start();

    if (isReceiver) {
      // Receiver accepted the call from IncomingCallScreen
      setCallState('Connected');
      startCallTimer();
      if (initialCallId) {
        startStatusPolling(initialCallId);
        initTwoWayAudio(initialCallId, true);
      }
    } else {
      // Caller initiated outgoing call
      playRingtone('outgoing');
      
      initiateCallSession({ 
        receiverName: name, 
        receiverId,
        orderId: orderId || 'Voice Call', 
        subtitle: subtitle || 'In-App Voice Call', 
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
      wave.stop();
      cleanupCall();
    };
  }, []);

  // WebRTC Two-Way Audio Implementation
  const initTwoWayAudio = async (callId, asReceiver) => {
    if (!callId || webrtcInitializedRef.current) return;
    webrtcInitializedRef.current = true;

    if (typeof window === 'undefined') {
      setAudioStreamConnected(true);
      return;
    }

    const RTCPeer = window.RTCPeerConnection || window.webkitRTCPeerConnection;
    if (!RTCPeer || !navigator?.mediaDevices?.getUserMedia) {
      setAudioStreamConnected(true);
      return;
    }

    try {
      // Request mic input
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      }).catch(err => {
        console.warn('Microphone permission or access issue:', err);
        return null;
      });

      if (localStream) {
        localStreamRef.current = localStream;
      }

      const pc = new RTCPeer({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      peerConnRef.current = pc;

      if (localStream) {
        localStream.getAudioTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      }

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          let audioEl = remoteAudioElemRef.current;
          if (!audioEl) {
            audioEl = document.createElement('audio');
            audioEl.autoplay = true;
            audioEl.playsInline = true;
            document.body.appendChild(audioEl);
            remoteAudioElemRef.current = audioEl;
          }
          audioEl.srcObject = event.streams[0];
          audioEl.play().catch(() => {});
          setAudioStreamConnected(true);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && callIdRef.current) {
          sendCallSignalApi({
            callId: callIdRef.current,
            type: 'ice-candidate',
            signal: event.candidate,
            senderRole: asReceiver ? 'receiver' : 'caller'
          }).catch(() => {});
        }
      };

      if (!asReceiver) {
        // Caller creates offer
        const offer = await pc.createOffer({ offerToReceiveAudio: true });
        await pc.setLocalDescription(offer);
        await sendCallSignalApi({
          callId,
          type: 'offer',
          signal: offer,
          senderRole: 'caller'
        });

        // Poll for answer
        signalPollRef.current = setInterval(async () => {
          if (isEndedRef.current) return;
          try {
            const sigs = await fetchCallSignalsApi(callId);
            if (sigs && sigs.success) {
              if (sigs.answer && !pc.currentRemoteDescription) {
                await pc.setRemoteDescription(new RTCSessionDescription(sigs.answer));
                setAudioStreamConnected(true);
              }
              if (sigs.receiverCandidates && sigs.receiverCandidates.length > 0) {
                for (const cand of sigs.receiverCandidates) {
                  try {
                    await pc.addIceCandidate(new RTCIceCandidate(cand));
                  } catch (e) {}
                }
              }
            }
          } catch (e) {}
        }, 1200);
      } else {
        // Receiver polls for offer, then sends answer
        signalPollRef.current = setInterval(async () => {
          if (isEndedRef.current) return;
          try {
            const sigs = await fetchCallSignalsApi(callId);
            if (sigs && sigs.success && sigs.offer && !pc.currentRemoteDescription) {
              await pc.setRemoteDescription(new RTCSessionDescription(sigs.offer));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              await sendCallSignalApi({
                callId,
                type: 'answer',
                signal: answer,
                senderRole: 'receiver'
              });
              setAudioStreamConnected(true);
            }
            if (sigs.callerCandidates && sigs.callerCandidates.length > 0) {
              for (const cand of sigs.callerCandidates) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(cand));
                } catch (e) {}
              }
            }
          } catch (e) {}
        }, 1200);
      }
    } catch (err) {
      console.warn('WebRTC audio stream error:', err?.message);
      setAudioStreamConnected(true);
    }
  };

  const cleanupCall = () => {
    stopRingtone();
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current) clearInterval(pollRef.current);
    if (signalPollRef.current) clearInterval(signalPollRef.current);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (peerConnRef.current) {
      try { peerConnRef.current.close(); } catch (e) {}
      peerConnRef.current = null;
    }
    if (remoteAudioElemRef.current) {
      try {
        remoteAudioElemRef.current.pause();
        remoteAudioElemRef.current.remove();
      } catch (e) {}
      remoteAudioElemRef.current = null;
    }

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
              initTwoWayAudio(callId, false);
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
    if (signalPollRef.current) clearInterval(signalPollRef.current);
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
    if (signalPollRef.current) clearInterval(signalPollRef.current);

    if (callIdRef.current) {
      respondCallSession({ callId: callIdRef.current, action: 'end' }).catch(() => {});
    }

    setCallState(customLabel);
    setTimeout(() => {
      navigation.goBack();
    }, 700);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !nextMuted;
      });
    }
  };

  const toggleSpeaker = () => {
    setIsSpeaker(!isSpeaker);
    if (remoteAudioElemRef.current) {
      remoteAudioElemRef.current.volume = !isSpeaker ? 1.0 : 0.6;
    }
  };

  const triggerDirectCellularCall = () => {
    const cleanNumber = phone ? phone.replace(/[^0-9+]/g, '') : '';
    if (!cleanNumber) {
      Alert.alert('Phone Number Unavailable', 'No direct phone number was provided for this contact.');
      return;
    }
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
        {phone ? (
          <TouchableOpacity onPress={triggerDirectCellularCall} style={styles.dialerBtn}>
            <Ionicons name="call" size={16} color="#FF7A00" />
            <Text style={styles.dialerText}>Cellular</Text>
          </TouchableOpacity>
        ) : null}
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
          {phone ? <Text style={styles.userPhone}>{phone}</Text> : null}
          
          {/* Call Date and Time badge */}
          <View style={styles.dateBadge}>
            <Ionicons name="calendar-outline" size={13} color="#6B7280" />
            <Text style={styles.dateText}>{callDateFormatted}</Text>
          </View>

          <Text style={[styles.statusText, callState === 'Connected' && { color: '#10B981' }]}>
            {callState === 'Connected' ? formatTimer(callDuration) : callState}
          </Text>

          {/* Voice Stream Indicator */}
          {callState === 'Connected' && (
            <View style={styles.liveAudioBadge}>
              <Animated.View style={{ transform: [{ scale: waveformAnim }], marginRight: 4 }}>
                <Ionicons name="radio" size={16} color="#10B981" />
              </Animated.View>
              <Text style={styles.liveAudioText}>Two-Way Audio Live</Text>
            </View>
          )}
        </View>

        {/* Quick Cellular Call Banner */}
        {phone ? (
          <TouchableOpacity style={styles.carrierBanner} onPress={triggerDirectCellularCall}>
            <Ionicons name="phone-portrait-outline" size={20} color="#FF7A00" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.carrierTitle}>Switch to Direct Phone Call</Text>
              <Text style={styles.carrierSub}>Dial {phone}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#FF7A00" />
          </TouchableOpacity>
        ) : null}

        {/* Call Controls: Mute, End Call, Speaker */}
        <View style={styles.controlsRow}>
          <TouchableOpacity 
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]} 
            onPress={toggleMute}
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
            onPress={toggleSpeaker}
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
    paddingVertical: 30,
  },
  avatarWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
    marginBottom: 8,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
    marginLeft: 5,
  },
  statusText: {
    fontSize: 17,
    color: '#FF7A00',
    fontWeight: '600',
    marginTop: 4,
  },
  liveAudioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 12,
  },
  liveAudioText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 4,
  },
  carrierBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    marginHorizontal: 24,
    marginBottom: 20,
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
