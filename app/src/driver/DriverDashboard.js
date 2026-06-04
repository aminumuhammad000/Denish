import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const StatCard = ({ iconName, value, label, iconColor = "#FF8C00" }) => (
  <View style={styles.statCard}>
    <View style={styles.statIconContainer}>
      <Ionicons name={iconName} size={18} color={iconColor} />
    </View>
    <View style={styles.statTexts}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

const DriverDashboard = () => {
  const insets = useSafeAreaInsets();
  const [isOnline, setIsOnline] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* --- CUSTOM HEADER --- */}
        <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>BA</Text>
              </View>
              <View>
                <Text style={styles.welcomeBack}>Welcome back</Text>
                <Text style={styles.userName}>Bayo Adeyemi</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* ONLINE TOGGLE BOX */}
          <View style={styles.onlineBox}>
            <View style={styles.onlineLeft}>
              <View style={[styles.powerIconContainer, isOnline && styles.powerIconActive]}>
                <Ionicons name="power" size={28} color={isOnline ? "#059669" : "#94A3B8"} />
              </View>
              <View style={styles.onlineStatusTexts}>
                <Text style={styles.onlineText}>You're {isOnline ? 'online' : 'offline'}</Text>
                <Text style={styles.statusSubtext}>{isOnline ? 'Receiving delivery requests' : 'Go online to start earning'}</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
              thumbColor={'#FFF'}
              ios_backgroundColor="#CBD5E1"
              onValueChange={setIsOnline}
              value={isOnline}
            />
          </View>
        </View>

        <View style={styles.mainContent}>
          {/* TODAY STATS */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Today</Text>
          </View>
          <View style={styles.statsRow}>
            <StatCard iconName="notifications-outline" value="N25,500" label="Earnings" />
            <StatCard iconName="notifications-outline" value="12" label="Trips" />
            <StatCard iconName="notifications-outline" value="47 km" label="Distance" />
          </View>

          {/* ACTIVE DELIVERY */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Active delivery</Text>
          </View>
          <View style={styles.activeDeliveryCard}>
            <View style={styles.deliveryHeader}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>En route to customer</Text>
              </View>
              <Text style={styles.deliveryPrice}>N750</Text>
            </View>

            <View style={styles.addressSection}>
              <View style={styles.timelineContainer}>
                <View style={[styles.timelineDot, { backgroundColor: '#EF4444' }]} />
                <View style={styles.timelineLine} />
                <View style={[styles.timelineDot, { backgroundColor: '#10B981' }]} />
              </View>
              
              <View style={styles.addressInfo}>
                <View style={styles.addressBlock}>
                  <Text style={styles.addressLabel}>PICKUP</Text>
                  <Text style={styles.placeName}>Spice Avenue</Text>
                  <Text style={styles.placeAddress}>9 Street name, Ikoyi</Text>
                </View>
                <View style={[styles.addressBlock, { marginTop: 15 }]}>
                  <Text style={styles.addressLabel}>DROP OFF</Text>
                  <Text style={styles.placeName}>Kola Adeleke</Text>
                  <Text style={styles.placeAddress}>22 Ozumba Mbadiwe, Victoria Island</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.orderId}>Order ORD-005</Text>
              <TouchableOpacity style={styles.continueLink}>
                <Text style={styles.continueLinkText}>Continue</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* NEW (01) */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>New (01)</Text>
            <TouchableOpacity><Text style={styles.viewAll}>View all</Text></TouchableOpacity>
          </View>

          <View style={styles.newRequestCard}>
            <View style={styles.requestMain}>
              <View style={styles.requestLeft}>
                <View style={styles.requestStatusHeader}>
                   <View style={styles.requestDot} />
                   <Text style={styles.requestHeaderText}>New delivery request</Text>
                </View>
                <Text style={styles.requestRestaurant}>Spice Avenue</Text>
                <View style={styles.requestDistanceRow}>
                  <Ionicons name="location-outline" size={14} color="#64748B" />
                  <Text style={styles.requestDistanceText}>4.2 km away from you</Text>
                </View>
                <Text style={styles.requestDropoff}>Drop off: 12 Marina Road, Lagos Island</Text>
              </View>
              <View style={styles.requestRight}>
                <View style={styles.timerRow}>
                  <Ionicons name="time-outline" size={14} color="#FF8C00" />
                  <Text style={styles.timerText}>19s</Text>
                </View>
                <Text style={styles.requestPrice}>N850</Text>
              </View>
            </View>
            <View style={styles.progressBarWrapper}>
              <View style={styles.progressBarActive} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* --- BOTTOM TAB BAR --- */}
      <View style={[styles.bottomTab, { paddingBottom: Math.max(insets.bottom, 10), height: 65 + insets.bottom }]}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home" size={24} color={Colors.primary} />
          <Text style={[styles.tabLabel, { color: Colors.primary }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#64748B" />
          <Text style={styles.tabLabel}>Deliveries</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="wallet-outline" size={24} color="#64748B" />
          <Text style={styles.tabLabel}>Earnings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#64748B" />
          <Text style={styles.tabLabel}>Chats</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerContainer: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    paddingHorizontal: 20,
    paddingBottom: 45,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  welcomeBack: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  userName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineBox: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: -25,
    top: 15,
  },
  onlineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  powerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  powerIconActive: {
    backgroundColor: '#ECFDF5',
  },
  onlineStatusTexts: {
    gap: 2,
  },
  onlineText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  statusSubtext: {
    fontSize: 12,
    color: '#64748B',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  mainContent: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  viewAll: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statTexts: {
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  activeDeliveryCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: '#3B82F6',
    fontSize: 11,
    fontWeight: '600',
  },
  deliveryPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  addressSection: {
    flexDirection: 'row',
    gap: 15,
  },
  timelineContainer: {
    alignItems: 'center',
    width: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  addressInfo: {
    flex: 1,
  },
  addressBlock: {
    gap: 2,
  },
  addressLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  placeName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  placeAddress: {
    fontSize: 12,
    color: '#64748B',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  orderId: {
    fontSize: 12,
    color: '#94A3B8',
  },
  continueLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  continueLinkText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  newRequestCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EEE',
    overflow: 'hidden',
  },
  requestMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  requestLeft: {
    flex: 1,
    gap: 6,
  },
  requestStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  requestDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  requestHeaderText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  requestRestaurant: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  requestDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  requestDistanceText: {
    fontSize: 13,
    color: '#64748B',
  },
  requestDropoff: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  requestRight: {
    alignItems: 'flex-end',
    gap: 15,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 12,
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  requestPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  progressBarWrapper: {
    height: 6,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },
  progressBarActive: {
    height: '100%',
    backgroundColor: Colors.primary,
    width: '60%',
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
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 10,
  },
  tabItem: {
    alignItems: 'center',
    gap: 5,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
});

export default DriverDashboard;
