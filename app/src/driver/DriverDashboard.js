import React from 'react';
import {StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useSafeAreaInsets , SafeAreaView} from 'react-native-safe-area-context';

const DriverDashboard = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* --- ORANGE HEADER --- */}
        <View style={styles.headerBackground}>
          <SafeAreaView>
            <View style={styles.headerTop}>
              <View style={styles.profileRow}>
                <View style={styles.profilePicPlaceholder}>
                  <Ionicons name="person" size={24} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.greetingText}>Driver Portal</Text>
                  <Text style={styles.userName}>Online</Text>
                </View>
              </View>
              <View style={styles.headerIcons}>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="notifications-outline" size={24} color="#FFF" />
                  <View style={styles.badge}><Text style={styles.badgeText}>1</Text></View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Today's Pay</Text>
                <Text style={styles.statValue}>₦0.00</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Completed</Text>
                <Text style={styles.statValue}>0</Text>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <View style={styles.emptyState}>
            <Ionicons name="bicycle-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No active orders</Text>
            <Text style={styles.emptySubtitle}>We'll notify you when a new delivery is available near you.</Text>
          </View>
        </View>
      </ScrollView>

      {/* --- BOTTOM TAB BAR --- */}
      <View style={[styles.bottomTab, { paddingBottom: Math.max(insets.bottom, 10), height: 60 + insets.bottom }]}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="flash-outline" size={24} color={Colors.primary} />
          <Text style={[styles.tabLabel, { color: Colors.primary }]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <MaterialCommunityIcons name="history" size={24} color="#999" />
          <Text style={styles.tabLabel}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="wallet-outline" size={24} color="#999" />
          <Text style={styles.tabLabel}>Earnings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person-outline" size={24} color="#999" />
          <Text style={styles.tabLabel}>Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerBackground: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 25,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 25,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profilePicPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  userName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  iconBtn: {
    padding: 2,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  bottomTab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 10,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
  },
});

export default DriverDashboard;
