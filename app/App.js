import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import VendorWelcomeScreen    from './src/vendor/VendorWelcomeScreen';
import RoleSelectionScreen    from './src/RoleSelectionScreen';
import VendorLoginScreen      from './src/vendor/VendorLoginScreen';
import SignupScreen            from './src/vendor/SignupScreen';
import BusinessInfoScreen      from './src/vendor/BusinessInfoScreen';
import OpeningHoursScreen      from './src/vendor/OpeningHoursScreen';
import ProfilePicturesScreen   from './src/vendor/ProfilePicturesScreen';
import PayoutAccountScreen     from './src/vendor/PayoutAccountScreen';
import ReviewSubmitScreen      from './src/vendor/ReviewSubmitScreen';
import ForgotPasswordScreen    from './src/vendor/ForgotPasswordScreen';
import VendorDashboard         from './src/vendor/dashboard/VendorDashboard';
import ItemFormScreen         from './src/vendor/dashboard/ItemFormScreen';
import RequestPayoutScreen    from './src/vendor/dashboard/RequestPayoutScreen';
import VendorProfileScreen    from './src/vendor/dashboard/VendorProfileScreen';
import VendorEditProfileScreen from './src/vendor/dashboard/VendorEditProfileScreen';

// Customer Screens
import CustomerLoginScreen from './src/customer/LoginScreen';
import CustomerWelcomeScreen from './src/customer/CustomerWelcomeScreen';
import CustomerHomeScreen from './src/customer/CustomerHomeScreen';
import CustomerRestaurantScreen from './src/customer/CustomerRestaurantScreen';
import CustomerProfileScreen from './src/customer/CustomerProfileScreen';
import ChatListScreen from './src/customer/ChatListScreen';
import ChatDetailScreen from './src/customer/ChatDetailScreen';
import CheckoutScreen from './src/customer/CheckoutScreen';
import CustomerSignupScreen from './src/customer/SignupScreen';

// Driver Screens
import DriverWelcomeScreen from './src/driver/DriverWelcomeScreen';
import DriverLoginScreen from './src/driver/DriverLoginScreen';
import DriverSignupScreen from './src/driver/SignupScreen';
import DriverStep1Personal from './src/driver/onboarding/DriverStep1Personal';
import DriverStep2Vehicle from './src/driver/onboarding/DriverStep2Vehicle';
import DriverStep3Payout from './src/driver/onboarding/DriverStep3Payout';
import DriverStep4Docs from './src/driver/onboarding/DriverStep4Docs';
import DriverStep5Review from './src/driver/onboarding/DriverStep5Review';
import DriverDashboard from './src/driver/DriverDashboard';

// Context
import { CartProvider } from './src/context/CartContext';
import { OnboardingProvider } from './src/context/OnboardingContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <OnboardingProvider>
        <CartProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="RoleSelection">
              <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
              
              {/* ── Onboarding ── */}
              <Stack.Screen name="Welcome" component={VendorWelcomeScreen} />
              <Stack.Screen name="Login" component={VendorLoginScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              
              {/* ── 5-step registration ── */}
              <Stack.Screen name="Step1" component={BusinessInfoScreen} />
              <Stack.Screen name="Step2" component={OpeningHoursScreen} />
              <Stack.Screen name="Step3" component={ProfilePicturesScreen} />
              <Stack.Screen name="Step4" component={PayoutAccountScreen} />
              <Stack.Screen name="Step5" component={ReviewSubmitScreen} />
              
              {/* ── Vendor App ── */}
              <Stack.Screen name="Dashboard" component={VendorDashboard} />
              <Stack.Screen name="ItemForm" component={ItemFormScreen} />
              <Stack.Screen name="RequestPayout" component={RequestPayoutScreen} />
              <Stack.Screen name="VendorProfile" component={VendorProfileScreen} />
              <Stack.Screen name="VendorEditProfile" component={VendorEditProfileScreen} />
              
              {/* ── Customer App ── */}
              <Stack.Screen name="CustomerWelcome" component={CustomerWelcomeScreen} />
              <Stack.Screen name="CustomerSignup" component={CustomerSignupScreen} />
              <Stack.Screen name="CustomerLogin" component={CustomerLoginScreen} />
              <Stack.Screen name="CustomerHome" component={CustomerHomeScreen} />
              <Stack.Screen name="CustomerRestaurant" component={CustomerRestaurantScreen} />
              <Stack.Screen name="CustomerProfile" component={CustomerProfileScreen} />
              <Stack.Screen name="ChatList" component={ChatListScreen} />
              <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
              <Stack.Screen name="Checkout" component={CheckoutScreen} />
  
              {/* ── Driver App ── */}
              <Stack.Screen name="DriverWelcome" component={DriverWelcomeScreen} />
              <Stack.Screen name="DriverSignup" component={DriverSignupScreen} />
              <Stack.Screen name="DriverStep1Personal" component={DriverStep1Personal} />
              <Stack.Screen name="DriverStep2Vehicle" component={DriverStep2Vehicle} />
              <Stack.Screen name="DriverStep3Payout" component={DriverStep3Payout} />
              <Stack.Screen name="DriverStep4Docs" component={DriverStep4Docs} />
              <Stack.Screen name="DriverStep5Review" component={DriverStep5Review} />
              <Stack.Screen name="DriverLogin" component={DriverLoginScreen} />
              <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
            </Stack.Navigator>
          </NavigationContainer>
        </CartProvider>
      </OnboardingProvider>
    </SafeAreaProvider>
  );
}
