import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

import DriverHomeScreen from './DriverHomeScreen';
import DriverChatListScreen from './DriverChatListScreen';
import DriverDeliveriesScreen from './DriverDeliveriesScreen';
import DriverEarningsScreen from './DriverEarningsScreen';

const Tab = createBottomTabNavigator();

const DriverDashboard = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#AAA',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#F5F5F5',
          height: 65 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 15,
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
          marginBottom: 5
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
            return <Ionicons name={iconName} size={24} color={color} />;
          } else if (route.name === 'Deliveries') {
            return <MaterialCommunityIcons name={focused ? 'truck-delivery' : 'truck-delivery-outline'} size={24} color={color} />;
          } else if (route.name === 'Earnings') {
            iconName = focused ? 'wallet' : 'wallet-outline';
            return <Ionicons name={iconName} size={24} color={color} />;
          } else if (route.name === 'Chats') {
            iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
            return <Ionicons name={iconName} size={24} color={color} />;
          }
          return <Ionicons name="help-outline" size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"       component={DriverHomeScreen} />
      <Tab.Screen name="Deliveries" component={DriverDeliveriesScreen} />
      <Tab.Screen name="Earnings"   component={DriverEarningsScreen} />
      <Tab.Screen name="Chats"      component={DriverChatListScreen} />
    </Tab.Navigator>
  );
};

export default DriverDashboard;
