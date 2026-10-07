import { Platform } from 'react-native';

let expoAudioModule = null;
try {
  expoAudioModule = require('expo-audio');
} catch (e) {
  // Graceful fallback if native module is not present in environment
}

let activePlayer = null;

/**
 * Plays outgoing or incoming call ringtone safely using expo-audio.
 * Guaranteed to manage player lifecycle without audio leaks.
 */
export const playRingtone = async (type = 'incoming') => {
  await stopRingtone();

  if (!expoAudioModule) return null;
  try {
    if (expoAudioModule.setAudioModeAsync) {
      await expoAudioModule.setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'doNotMix',
        shouldRouteThroughEarpiece: false,
      }).catch(() => {});
    }

    if (expoAudioModule.createAudioPlayer) {
      // Free public tone URL
      const soundUri = type === 'outgoing'
        ? 'https://cdn.freesound.org/previews/536/536420_11861866-lq.mp3'
        : 'https://cdn.freesound.org/previews/536/536420_11861866-lq.mp3';

      const player = expoAudioModule.createAudioPlayer({ uri: soundUri });
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
