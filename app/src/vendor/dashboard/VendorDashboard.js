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
          borderTopColor: '#EEE',
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
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
