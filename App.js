import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import VendorWelcomeScreen from './src/vendor/VendorWelcomeScreen';
import SignupScreen from './src/vendor/SignupScreen';
import BusinessInfoScreen from './src/vendor/BusinessInfoScreen';
import OpeningHoursScreen from './src/vendor/OpeningHoursScreen';
import ProfilePicturesScreen from './src/vendor/ProfilePicturesScreen';
import PayoutAccountScreen from './src/vendor/PayoutAccountScreen';
import ReviewSubmitScreen from './src/vendor/ReviewSubmitScreen';
import SuccessScreen from './src/vendor/SuccessScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={VendorWelcomeScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Step1" component={BusinessInfoScreen} />
        <Stack.Screen name="Step2" component={OpeningHoursScreen} />
        <Stack.Screen name="Step3" component={ProfilePicturesScreen} />
        <Stack.Screen name="Step4" component={PayoutAccountScreen} />
        <Stack.Screen name="Step5" component={ReviewSubmitScreen} />
        <Stack.Screen name="Success" component={SuccessScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
