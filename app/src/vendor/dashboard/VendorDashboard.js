import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

import VendorHomeScreen from './VendorHomeScreen';
import OrdersScreen from './OrdersScreen';
import EarningsScreen from './EarningsScreen';
import MenuScreen from './MenuScreen';

const Tab = createBottomTabNavigator();

const VendorDashboard = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#F0F0F0',
          height: 70,
          paddingTop: 8,
          paddingBottom: 20, // Simplified, but I'll use real safe area if possible
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home:     'home-outline',
            Orders:   'cart-outline',
            Earnings: 'wallet-outline',
            Menu:     'restaurant-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
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
