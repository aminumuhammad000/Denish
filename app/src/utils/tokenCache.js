import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const tokenCache = {
  async getToken(key) {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key);
        }
        return null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.error('tokenCache getToken error:', err);
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
        return;
      }
      return await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error('tokenCache saveToken error:', err);
    }
  },
  async clearToken(key) {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
        return;
      }
      return await SecureStore.deleteItemAsync(key);
    } catch (err) {
      console.error('tokenCache clearToken error:', err);
    }
  },
};
