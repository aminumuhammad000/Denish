export const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_live_Y2xlcmsuZGVuaXNobmcuY29tJA';

export const GOOGLE_CLIENT_IDS = {
  // Configured Google Client ID for Denish OAuth
  webClientId:
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    '908464279039-kmpdd7t43kg6k50ibe5eggeupaulibtm.apps.googleusercontent.com',
  iosClientId:
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
    '908464279039-kmpdd7t43kg6k50ibe5eggeupaulibtm.apps.googleusercontent.com',
  androidClientId:
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
    '908464279039-kmpdd7t43kg6k50ibe5eggeupaulibtm.apps.googleusercontent.com',
};
