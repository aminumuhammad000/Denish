import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

import DriverHomeScreen from './DriverHomeScreen';
import DriverChatListScreen from './DriverChatListScreen';
// Placeholders for other screens
const DriverDeliveriesScreen = () => <DriverHomeScreen />; // Temporary
const DriverEarningsScreen = () => <DriverHomeScreen />; // Temporary

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
