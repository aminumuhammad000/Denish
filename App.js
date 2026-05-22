import React from 'react';
import { StatusBar } from 'expo-status-bar';
import VendorWelcomeScreen from './src/vendor/VendorWelcomeScreen';

export default function App() {
  return (
    <>
      <VendorWelcomeScreen />
      <StatusBar style="auto" />
    </>
  );
}
