import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

const NotificationItem = ({ icon, color, title, message, time, isUnread }) => (
  <TouchableOpacity style={[styles.notificationCard, isUnread && styles.unreadCard]}>
    <View style={[styles.iconBg, { backgroundColor: color }]}>
       <Ionicons name={icon} size={20} color="#FFF" />
    </View>
    <View style={styles.content}>
       <View style={styles.topRow}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.time}>{time}</Text>
       </View>
       <Text style={styles.message} numberOfLines={2}>{message}</Text>
    </View>
    {isUnread && <View style={styles.unreadDot} />}
  </TouchableOpacity>
);

const NotificationsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');

  const notifications = [
    {
      id: '1',
      title: 'New Order Received',
      message: 'You have a new order #ORD-2451 from Aisha Mohammed.',
      time: '2 min ago',
      icon: 'cart-outline',
      color: '#FF8C00',
      type: 'Order',
      isUnread: true
    },
    {
      id: '2',
      title: 'Payment Successful',
      message: 'Withdrawal of ₦25,000 to GTBank was successful.',
      time: '1 hour ago',
      icon: 'wallet-outline',
      color: '#10B981',
      type: 'System',
      isUnread: true
    },
    {
      id: '3',
      title: 'Promo Discovered',
      message: 'Get 20% off on your next subscription. Limited time offer!',
      time: '5 hours ago',
      icon: 'gift-outline',
      color: '#EF4444',
      type: 'Promo',
      isUnread: false
    },
    {
      id: '4',
      title: 'System Update',
      message: 'We have updated our terms of service. Please review them.',
      time: 'Yesterday',
      icon: 'settings-outline',
      color: '#3B82F6',
      type: 'System',
      isUnread: false
    }
  ];

  const filteredNotifications = activeTab === 'All' 
    ? notifications 
    : notifications.filter(n => n.type === activeTab);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.markReadBtn}>
           <Text style={styles.markReadText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {['All', 'Order', 'System'].map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'Order' ? 'Orders' : tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(item => (
            <NotificationItem key={item.id} {...item} />
          ))
        ) : (
          <View style={styles.emptyState}>
             <View style={styles.emptyIconBg}>
                <Ionicons name="notifications-off-outline" size={60} color="#CBD5E1" />
             </View>
             <Text style={styles.emptyTitle}>No notifications yet</Text>
             <Text style={styles.emptySub}>We will notify you when something important happens.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  markReadBtn: {
    paddingVertical: 5,
  },
  markReadText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  notificationCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
  },
  unreadCard: {
    borderColor: 'rgba(255, 140, 0, 0.2)',
    backgroundColor: '#FFFBF5',
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  time: {
    fontSize: 11,
    color: '#94A3B8',
  },
  message: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  unreadDot: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});

export default NotificationsScreen;
