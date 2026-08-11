import { Platform } from 'react-native';

const STORAGE_KEY = 'denish_user_session';
let memoryStore = null;

export const setAuthSession = async (sessionData) => {
  try {
    const value = JSON.stringify(sessionData);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, value);
    }
    memoryStore = sessionData;
  } catch (e) {
    console.error('Error saving auth session:', e);
  }
};

export const getAuthSession = async () => {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
    return memoryStore;
  } catch (e) {
    console.error('Error reading auth session:', e);
    return memoryStore;
  }
};

export const clearAuthSession = async () => {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    memoryStore = null;
  } catch (e) {
    console.error('Error clearing auth session:', e);
    memoryStore = null;
  }
};
