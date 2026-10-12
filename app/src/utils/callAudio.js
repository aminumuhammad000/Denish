import { Platform } from 'react-native';

let expoAudioModule = null;
try {
  expoAudioModule = require('expo-audio');
} catch (e) {
  // Graceful fallback if native module is not present in environment
}

let activePlayer = null;
let webAudioCtx = null;
let webToneInterval = null;

const startWebRingtone = (type) => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    
    if (!webAudioCtx || webAudioCtx.state === 'closed') {
      webAudioCtx = new AudioContextClass();
    }
    if (webAudioCtx.state === 'suspended') {
      webAudioCtx.resume().catch(() => {});
    }

    const playToneBurst = () => {
      if (!webAudioCtx || webAudioCtx.state === 'closed') return;
      const now = webAudioCtx.currentTime;

      if (type === 'outgoing') {
        // Standard telephone ringback tone: 440 Hz + 480 Hz for 1.5 seconds
        const osc1 = webAudioCtx.createOscillator();
        const osc2 = webAudioCtx.createOscillator();
        const gain = webAudioCtx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(480, now);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.setValueAtTime(0.18, now + 1.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(webAudioCtx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.5);
        osc2.stop(now + 1.5);
      } else {
        // Incoming call chime: D5 (587Hz) + A5 (880Hz) + D6 (1174Hz)
        const notes = [587.33, 880, 1174.66];
        [0, 0.5].forEach((burstOffset) => {
          notes.forEach((freq, idx) => {
            const osc = webAudioCtx.createOscillator();
            const gain = webAudioCtx.createGain();
            const startT = now + burstOffset + idx * 0.08;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startT);

            gain.gain.setValueAtTime(0.2, startT);
            gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.4);

            osc.connect(gain);
            gain.connect(webAudioCtx.destination);

            osc.start(startT);
            osc.stop(startT + 0.4);
          });
        });
      }
    };

    playToneBurst();
    const intervalMs = type === 'outgoing' ? 3500 : 2500;
    webToneInterval = setInterval(playToneBurst, intervalMs);
  } catch (err) {
    console.warn('Web Audio synthesis error:', err?.message);
  }
};

const stopWebRingtone = () => {
  if (webToneInterval) {
    clearInterval(webToneInterval);
    webToneInterval = null;
  }
  if (webAudioCtx && webAudioCtx.state !== 'closed') {
    try {
      webAudioCtx.close().catch(() => {});
    } catch (e) {}
    webAudioCtx = null;
  }
};

/**
 * Plays outgoing or incoming call ringtone safely.
 * Uses bundled offline audio assets on native, and Web Audio API tone synthesis on web.
 */
export const playRingtone = async (type = 'incoming') => {
  await stopRingtone();

  if (Platform.OS === 'web') {
    startWebRingtone(type);
    return { type: 'web_synth' };
  }

  if (!expoAudioModule) {
    return null;
  }

  try {
    if (expoAudioModule.setAudioModeAsync) {
      await expoAudioModule.setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'doNotMix',
        shouldRouteThroughEarpiece: false,
      }).catch(() => {});
    }

    if (expoAudioModule.createAudioPlayer) {
      const soundAsset = type === 'outgoing'
        ? require('../../assets/sounds/ringtone_outgoing.wav')
        : require('../../assets/sounds/ringtone_incoming.wav');

      const player = expoAudioModule.createAudioPlayer(soundAsset);
      player.loop = true;
      player.volume = 1.0;
      player.play();
      activePlayer = player;
      return player;
    }
  } catch (err) {
    console.warn('Error playing ringtone via expo-audio:', err?.message);
  }
  return null;
};

/**
 * Stops and cleans up any active ringtone audio player.
 */
export const stopRingtone = async (playerInstance = null) => {
  stopWebRingtone();

  const target = playerInstance || activePlayer;
  if (!target) return;
  try {
    if (typeof target.pause === 'function') target.pause();
    if (typeof target.remove === 'function') target.remove();
  } catch (err) {
    // Silent catch
  }
  if (target === activePlayer) {
    activePlayer = null;
  }
};
