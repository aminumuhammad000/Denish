import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const StatCard = ({ iconName, value, label, iconColor = "#FF8C00" }) => (
  <View style={styles.statCard}>
    <View style={styles.statIconContainer}>
      <Ionicons name={iconName} size={16} color={iconColor} />
    </View>
    <View style={styles.statTexts}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

const CompletedDeliveryCard = ({ name, price, address, details }) => (
  <View style={styles.completedCard}>
    <View style={styles.completedMain}>
      <View style={styles.completedLeft}>
        <Text style={styles.completedName}>{name}</Text>
        <View style={styles.completedAddressRow}>
          <Ionicons name="location-outline" size={14} color="#94A3B8" />
          <Text style={styles.completedAddress}>{address}</Text>
        </View>
        <Text style={styles.completedDetails}>{details}</Text>
      </View>
      <Text style={styles.completedPrice}>{price}</Text>
    </View>
  </View>
);

const DriverDashboard = () => {
  const insets = useSafeAreaInsets();
  const [isOnline, setIsOnline] = useState(true);

  // Mock data for earnings chart
  const earningsData = [
    { day: 'Mon', value: 15 },
    { day: 'Tue', value: 25 },
    { day: 'Wed', value: 30, active: true },
    { day: 'Thu', value: 18 },
    { day: 'Fri', value: 35 },
    { day: 'Sat', value: 28 },
    { day: 'Sun', value: 32 },
  ];

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
                <Ionicons name="power" size={28} color={isOnline ? "#10B981" : "#94A3B8"} />
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
            <StatCard iconName="notifications-outline" value="₦25,500" label="Earnings" />
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
              <Text style={styles.deliveryPrice}>₦750</Text>
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
                <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
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
                <Text style={styles.requestPrice}>₦850</Text>
              </View>
            </View>
            <View style={styles.progressBarWrapper}>
              <View style={[styles.progressBarActive, { width: '55%' }]} />
            </View>

            {/* ACCEPT/DECLINE ACTIONS */}
            <View style={styles.requestActions}>
              <TouchableOpacity style={styles.declineBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
                <Text style={styles.declineText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn}>
                <Ionicons name="checkmark" size={20} color="#FFF" />
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* COMPLETED DELIVERIES */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Completed deliveries</Text>
            <TouchableOpacity><Text style={styles.viewAll}>View all</Text></TouchableOpacity>
          </View>
          
          <View style={styles.completedList}>
            <CompletedDeliveryCard 
              name="Spice Avenue" 
              price="₦750" 
              address="22 Ozumba Mbadiwe, Victoria Island"
              details="ORD-005 | 4 items"
            />
            <CompletedDeliveryCard 
              name="Mbadiwe Axis" 
              price="₦550" 
              address="22 Ozumba Mbadiwe, Victoria Island"
              details="ORD-003 | 2 items"
            />
            <CompletedDeliveryCard 
              name="Ojokwu Avenue" 
              price="₦1,250" 
              address="22 Ozumba Mbadiwe, Victoria Island"
              details="ORD-002 | 4 items"
            />
          </View>

          {/* EARNINGS GRAPH */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Earnings</Text>
            <TouchableOpacity><Text style={styles.viewAll}>View all</Text></TouchableOpacity>
          </View>

          <View style={styles.earningsChartCard}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartPeriod}>Last 7 days</Text>
                <Text style={styles.chartAmount}>₦62,500 earned</Text>
              </View>
              <View style={styles.percentBadge}>
                 <Ionicons name="arrow-up" size={12} color="#10B981" />
                 <Text style={styles.percentText}>+12%</Text>
              </View>
            </View>
            
            <View style={styles.chartContent}>
              <View style={styles.chartYAxis}>
                <Text style={styles.yText}>40k</Text>
                <Text style={styles.yText}>30k</Text>
                <Text style={styles.yText}>20k</Text>
                <Text style={styles.yText}>10k</Text>
                <Text style={styles.yText}>0k</Text>
              </View>
              <View style={styles.chartBarsContainer}>
                {earningsData.map((item, idx) => (
                  <View key={idx} style={styles.barColumn}>
                    <View style={styles.barBackground}>
                      <View style={[
                        styles.barFill, 
                        { height: `${(item.value / 40) * 100}%` },
                        item.active && styles.barFillActive
                      ]} />
                    </View>
                    <Text style={[styles.barLabel, item.active && styles.barLabelActive]}>{item.day}</Text>
                  </View>
                ))}
              </View>
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
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 17,
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
    fontWeight: '700',
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
    marginBottom: 8,
  },
  statTexts: {
    gap: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  activeDeliveryCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineLine: {
    flex: 1,
    width: 1,
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
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  placeName: {
    fontSize: 14,
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
    fontSize: 11,
    color: '#94A3B8',
  },
  continueLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  continueLinkText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  newRequestCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  requestMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  requestLeft: {
    flex: 1,
    gap: 4,
  },
  requestStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  requestDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  requestHeaderText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  requestRestaurant: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  requestDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  requestDistanceText: {
    fontSize: 12,
    color: '#64748B',
  },
  requestDropoff: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  requestRight: {
    alignItems: 'flex-end',
    gap: 12,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 11,
    color: '#FF8C00',
    fontWeight: '700',
  },
  requestPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  progressBarWrapper: {
    height: 5,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },
  progressBarActive: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  requestActions: {
    flexDirection: 'row',
    padding: 15,
    gap: 12,
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
  },
  declineText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
  },
  acceptBtn: {
    flex: 1.5,
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  acceptText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  completedList: {
    gap: 12,
  },
  completedCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    elevation: 1,
  },
  completedMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  completedLeft: {
    flex: 1,
    gap: 5,
  },
  completedName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  completedAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  completedAddress: {
    fontSize: 12,
    color: '#64748B',
    flexShrink: 1,
  },
  completedDetails: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  completedPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
  },
  earningsChartCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  chartPeriod: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  chartAmount: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  percentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 2,
  },
  percentText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: 'bold',
  },
  chartContent: {
    flexDirection: 'row',
    height: 180,
  },
  chartYAxis: {
    justifyContent: 'space-between',
    paddingBottom: 25,
    marginRight: 15,
  },
  yText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  chartBarsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  barBackground: {
    flex: 1,
    width: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
  },
  barFillActive: {
    backgroundColor: Colors.primary,
  },
  barLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  barLabelActive: {
    color: '#1E293B',
    fontWeight: 'bold',
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
