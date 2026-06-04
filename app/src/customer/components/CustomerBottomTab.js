import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';

const CustomerBottomTab = ({ activeTab, navigation }) => {
  const insets = useSafeAreaInsets();
  const { cartItems } = useCart();
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const tabs = [
    { id: 'Home', label: 'Home', icon: 'home-outline', activeIcon: 'home', type: 'ionicons' },
    { id: 'Orders', label: 'Orders', icon: 'shopping-outline', activeIcon: 'shopping', type: 'material' },
    { id: 'Chats', label: 'Chats', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses', type: 'ionicons' },
    { id: 'Profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person', type: 'ionicons' },
  ];

  const handlePress = (tabId) => {
    const routeMap = {
      Home: 'CustomerHome',
      Orders: 'CustomerOrders',
      Chats: 'ChatList',
      Profile: 'CustomerProfile'
    };
    if (activeTab !== tabId) {
      navigation.navigate(routeMap[tabId]);
    }
  };

  return (
    <View style={[styles.bottomTab, { paddingBottom: Math.max(insets.bottom, 10), height: 60 + insets.bottom }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.type === 'ionicons' ? Ionicons : MaterialCommunityIcons;
        const iconName = isActive ? tab.activeIcon : tab.icon;

        return (
          <TouchableOpacity 
            key={tab.id} 
            style={styles.tabItem} 
            onPress={() => handlePress(tab.id)}
          >
            <View>
              <IconComponent 
                name={iconName} 
                size={24} 
                color={isActive ? Colors.primary : '#999'} 
              />
              {tab.id === 'Orders' && cartItemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartItemCount}</Text>
                </View>
              )}
              {tab.id === 'Chats' && false && ( // Placeholder for real unread chat count
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, { color: isActive ? Colors.primary : '#999' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomTab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: 5,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#FF5252',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  }
});

export default CustomerBottomTab;
