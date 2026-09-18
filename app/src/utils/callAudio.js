let expoAudioModule = null;
try {
  expoAudioModule = require('expo-audio');
} catch (e) {
  console.warn('expo-audio module could not be loaded:', e?.message);
}

/**
 * Plays the incoming/outgoing ringtone safely using expo-audio.
 * Returns the audio player instance, or null if audio playback failed.
 */
export const playRingtone = async () => {
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
      const player = expoAudioModule.createAudioPlayer({
        uri: 'https://cdn.freesound.org/previews/536/536420_11861866-lq.mp3',
      });
      player.loop = true;
      player.volume = 1.0;
      player.play();
      return player;
    }
  } catch (err) {
    console.warn('Error playing ringtone via expo-audio:', err?.message);
  }
  return null;
};

/**
 * Stops and cleans up the ringtone audio player.
 */
export const stopRingtone = async (player) => {
  if (!player) return;
  try {
    if (typeof player.pause === 'function') player.pause();
    if (typeof player.remove === 'function') player.remove();
  } catch (err) {
    console.warn('Error stopping ringtone:', err?.message);
  }
};
