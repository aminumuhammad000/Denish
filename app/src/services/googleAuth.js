import { Platform } from 'react-native';
import { GOOGLE_CLIENT_IDS } from '../constants/Config';

let GoogleSignin = null;

if (Platform.OS !== 'web') {
  try {
    // Dynamically require to avoid crash on startup in Expo Go
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
    
    GoogleSignin.configure({
      webClientId: GOOGLE_CLIENT_IDS.webClientId,
      iosClientId: GOOGLE_CLIENT_IDS.iosClientId,
    });
  } catch (error) {
    console.warn('GoogleSignin native module not found. This is expected if running in Expo Go.');
  }
}

export const signInWithGoogle = async () => {
  if (!GoogleSignin) {
    throw new Error('Google Sign-In is not available in Expo Go. Please use a Development Build to use native Google login.');
  }

  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    
    // In newer versions of the library, the data is inside response.data
    const idToken = response.data?.idToken || response.idToken;
    const user = response.data?.user || response.user;

    if (!idToken) {
      throw new Error('Google Sign-In failed: No ID Token returned');
    }

    return {
      token: idToken,
      user,
      isAccessToken: false
    };
  } catch (error) {
    console.error('Google Native Sign-In Error:', error);
    throw error;
  }
};

export const signOutWithGoogle = async () => {
  if (!GoogleSignin) return;
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Google Native Sign-Out Error:', error);
  }
};
