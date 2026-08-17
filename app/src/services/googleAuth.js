import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_CLIENT_IDS } from '../constants/Config';

// Initialize the Google SDK
GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_IDS.webClientId,
  iosClientId: GOOGLE_CLIENT_IDS.iosClientId,
});

export const signInWithGoogle = async () => {
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
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Google Native Sign-Out Error:', error);
  }
};
