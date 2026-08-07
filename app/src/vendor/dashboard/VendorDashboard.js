import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

import VendorHomeScreen from './VendorHomeScreen';
import OrdersScreen from './OrdersScreen';
import EarningsScreen from './EarningsScreen';
import MenuScreen from './MenuScreen';

const Tab = createBottomTabNavigator();

const VendorDashboard = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FF8C00',
        tabBarInactiveTintColor: '#AAA',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#F5F5F5',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
          ...(Platform.OS === 'web' && {
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 0,
            width: '100%',
            maxWidth: 650,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
          }),
        },
        tabBarLabelStyle: { 
          fontSize: 11, 
          fontWeight: '600',
          marginTop: -5,
          marginBottom: 5
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home:     focused ? 'home' : 'home-outline',
            Orders:   focused ? 'cart' : 'cart-outline',
            Earnings: focused ? 'wallet' : 'wallet-outline',
            Menu:     focused ? 'restaurant' : 'restaurant-outline',
          };
          const iconName = icons[route.name] || 'help-outline';
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"     component={VendorHomeScreen} />
      <Tab.Screen name="Orders"   component={OrdersScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Menu"     component={MenuScreen} />
    </Tab.Navigator>
  );
};

export default VendorDashboard;
