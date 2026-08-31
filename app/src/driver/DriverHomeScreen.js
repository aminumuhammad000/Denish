import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import {
  getDriverProfile,
  getDriverDeliveries,
  getDriverEarnings,
  updateOrderStatus,
  fetchIncomingCall,
} from '../services/api';
import { getAuthSession } from '../services/authStorage';

const StatCard = ({ iconName, value, label, iconColor = "#FF8C00" }) => (
  <View style={styles.statCard}>
    <View style={styles.statIconContainer}>
      <Ionicons name={iconName} size={18} color={iconColor} />
    </View>
    <View style={styles.statTexts}>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
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

const DriverHomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [isOnline, setIsOnline] = useState(true);
  const [profile, setProfile] = useState(null);
  const [deliveries, setDeliveries] = useState({ available: [], active: [], completed: [] });
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);

  React.useEffect(() => {
    let intervalId = null;
    let isSubscribed = true;

    const checkIncomingCalls = async () => {
      try {
        const session = await getAuthSession();
        if (!isSubscribed || !session || !session.user) return;
        const nameToQuery = session.user.name;
        if (!nameToQuery) return;

        const res = await fetchIncomingCall(nameToQuery);
        if (isSubscribed && res.success && res.call) {
          navigation.navigate('IncomingCall', {
            callId: res.call._id,
            callerName: res.call.callerName,
            phone: res.call.phone || '08123456789',
            orderId: res.call.orderId,
            subtitle: res.call.subtitle
          });
        }
      } catch (e) {
        // Silent error
      }
    };

    intervalId = setInterval(checkIncomingCalls, 3000);

    return () => {
      isSubscribed = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [navigation]);

  const fetchDashboardData = useCallback(async (isRef = false) => {
    if (isRef) setRefreshing(true);
    else setLoading(true);

    try {
      const [profRes, delRes, earnRes] = await Promise.allSettled([
        getDriverProfile(),
        getDriverDeliveries(),
        getDriverEarnings(),
      ]);

      if (profRes.status === 'fulfilled' && profRes.value?.success) {
        setProfile(profRes.value.data || profRes.value.driver);
      }

      if (delRes.status === 'fulfilled' && delRes.value?.success) {
        setDeliveries(delRes.value.data || { available: [], active: [], completed: [] });
      }

      if (earnRes.status === 'fulfilled' && earnRes.value?.success) {
        setEarnings(earnRes.value.data);
      }
    } catch (err) {
      console.error('Fetch dashboard error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isSubscribed = true;
      getAuthSession().then(session => {
        if (!isSubscribed) return;
        if (!session || session.role !== 'driver') {
          navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
          return;
        }
        fetchDashboardData();
      });
      return () => { isSubscribed = false; };
    }, [fetchDashboardData, navigation])
  );

  const handleDeclineOrder = async (orderId) => {
    try {
      setDeliveries(prev => ({
        ...prev,
        available: (prev.available || []).filter(o => (o._id || o.id) !== orderId),
      }));
      if (orderId) {
        await updateOrderStatus(orderId, 'cancelled');
      }
      Alert.alert('Request Declined', 'The delivery request has been declined.');
      fetchDashboardData();
    } catch (e) {
      fetchDashboardData();
    }
  };

  const handleAcceptOrder = async (orderId) => {
    setAcceptingId(orderId);
    try {
      const acceptedItem = deliveries.available?.find(o => (o._id || o.id) === orderId);
      setDeliveries(prev => ({
        ...prev,
        available: (prev.available || []).filter(o => (o._id || o.id) !== orderId),
        active: acceptedItem ? [{ ...acceptedItem, status: 'En route to customer' }, ...(prev.active || [])] : (prev.active || []),
      }));
      await updateOrderStatus(orderId, 'on the way');
      Alert.alert('Request Accepted! 🚀', 'Order accepted. You are now en route to pick up.', [
        {
          text: 'Start Delivery',
          onPress: () => navigation.navigate('DriverOrderTracking', { orderId }),
        },
      ]);
      fetchDashboardData();
    } catch (e) {
      Alert.alert('Error', 'Could not accept request. Please try again.');
      fetchDashboardData();
    } finally {
      setAcceptingId(null);
    }
  };

  const activeDelivery = deliveries.active?.[0];
  const newRequest = deliveries.available?.[0];
  const completedList = deliveries.completed || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchDashboardData(true)}
            colors={[Colors.primary]}
            tintColor="#FFF"
          />
        }
      >
        {/* ── TOP HEADER ── */}
        <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
          <View style={styles.webHeaderInner}>
            <View style={styles.headerTop}>
              <View style={styles.userInfo}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('DriverProfile')}
                  style={styles.avatar}
                >
                  {profile?.profilePic ? (
                    <Image source={{ uri: profile.profilePic }} style={styles.avatarImg} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {profile?.name
                        ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase()
                        : 'BA'}
                    </Text>
                  )}
                </TouchableOpacity>
                <View>
                  <Text style={styles.welcomeBack}>Welcome back</Text>
                  <Text style={styles.userName}>{profile?.name || 'Bayo Adeyemi'}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.notifBtn}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons name="notifications-outline" size={24} color="#FFF" />
                <View style={styles.notifBadge} />
              </TouchableOpacity>
            </View>

            {/* ONLINE TOGGLE */}
            <View style={styles.onlineBox}>
              <View style={styles.onlineLeft}>
                <View style={[styles.powerIconContainer, isOnline && styles.powerIconActive]}>
                  <Ionicons name="power" size={28} color={isOnline ? '#10B981' : '#94A3B8'} />
                </View>
                <View style={styles.onlineStatusTexts}>
                  <Text style={styles.onlineText}>You're {isOnline ? 'online' : 'offline'}</Text>
                  <Text style={styles.statusSubtext}>
                    {isOnline ? 'Receiving delivery requests' : 'Go online to start earning'}
                  </Text>
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
        </View>

        {/* ── MAIN CONTENT ── */}
        <View style={styles.mainContent}>
          {/* STATS */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Today</Text>
          </View>
          <View style={styles.statsRow}>
            <StatCard
              iconName="wallet-outline"
              value={`₦${(earnings?.todayEarned || 0).toLocaleString()}`}
              label="Earnings"
            />
            <StatCard
              iconName="car-outline"
              value={String(completedList.length)}
              label="Trips"
            />
            <StatCard
              iconName="location-outline"
              value={`${(completedList.length * 3.5).toFixed(1)} km`}
              label="Distance"
            />
          </View>

          {/* ACTIVE DELIVERY */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Active delivery</Text>
          </View>

          {activeDelivery ? (
            <View style={styles.activeDeliveryCard}>
              <View style={styles.deliveryHeader}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>
                    {activeDelivery.status || 'En route to customer'}
                  </Text>
                </View>
                <Text style={styles.deliveryPrice}>
                  ₦{(activeDelivery.amount || 850).toLocaleString()}
                </Text>
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
                    <Text style={styles.placeName}>{activeDelivery.restaurant}</Text>
                    <Text style={styles.placeAddress}>
                      {activeDelivery.pickupAddress || '15 Admiralty Way, Lekki'}
                    </Text>
                  </View>
                  <View style={[styles.addressBlock, { marginTop: 15 }]}>
                    <Text style={styles.addressLabel}>DROP OFF</Text>
                    <Text style={styles.placeName}>{activeDelivery.customer}</Text>
                    <Text style={styles.placeAddress}>{activeDelivery.dropoffAddress}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.orderId}>
                  Order {activeDelivery.id || activeDelivery._id}
                </Text>
                <TouchableOpacity
                  style={styles.continueLink}
                  onPress={() =>
                    navigation.navigate('DriverOrderTracking', {
                      orderId: activeDelivery._id || activeDelivery.id,
                    })
                  }
                >
                  <Text style={styles.continueLinkText}>Continue</Text>
                  <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-circle-outline" size={38} color="#CBD5E1" />
              <Text style={styles.emptyCardText}>No active delivery in progress</Text>
            </View>
          )}

          {/* NEW REQUESTS */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              New ({deliveries.available?.length < 10 ? `0${deliveries.available?.length || 0}` : deliveries.available?.length})
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Deliveries')}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>

          {newRequest ? (
            <View style={styles.newRequestCard}>
              <View style={styles.requestMain}>
                <View style={styles.requestLeft}>
                  <View style={styles.requestStatusHeader}>
                    <View style={styles.requestDot} />
                    <Text style={styles.requestHeaderText}>New delivery request</Text>
                  </View>
                  <Text style={styles.requestRestaurant}>{newRequest.restaurant}</Text>
                  <View style={styles.requestDistanceRow}>
                    <Ionicons name="location-outline" size={14} color="#64748B" />
                    <Text style={styles.requestDistanceText}>
                      {newRequest.distance || '3.5 km'} away from you
                    </Text>
                  </View>
                  <Text style={styles.requestDropoff}>
                    Drop off: {newRequest.dropoffAddress}
                  </Text>
                </View>
                <View style={styles.requestRight}>
                  <View style={styles.timerRow}>
                    <Ionicons name="time-outline" size={14} color="#FF8C00" />
                    <Text style={styles.timerText}>25s</Text>
                  </View>
                  <Text style={styles.requestPrice}>
                    ₦{(newRequest.amount || 850).toLocaleString()}
                  </Text>
                </View>
              </View>
              <View style={styles.progressBarWrapper}>
                <View style={[styles.progressBarActive, { width: '80%' }]} />
              </View>

              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={styles.declineBtn}
                  onPress={() => handleDeclineOrder(newRequest._id || newRequest.id)}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                  <Text style={styles.declineText}>Decline</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.acceptBtn, acceptingId === newRequest._id && { opacity: 0.6 }]}
                  onPress={() => handleAcceptOrder(newRequest._id || newRequest.id)}
                  disabled={acceptingId === newRequest._id}
                >
                  {acceptingId === newRequest._id ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="#FFF" />
                      <Text style={styles.acceptText}>Accept</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="bicycle-outline" size={38} color="#CBD5E1" />
              <Text style={styles.emptyCardText}>No new delivery requests right now</Text>
            </View>
          )}

          {/* COMPLETED DELIVERIES */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Completed deliveries</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Deliveries')}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.completedList}>
            {completedList.length > 0 ? (
              completedList.slice(0, 3).map((item, idx) => (
                <CompletedDeliveryCard
                  key={item._id || item.id || idx}
                  name={item.restaurant}
                  price={`₦${(item.amount || 850).toLocaleString()}`}
                  address={item.dropoffAddress || 'Customer Address'}
                  details={`Order ${item.id} | ${item.date || 'Today'}`}
                />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="time-outline" size={38} color="#CBD5E1" />
                <Text style={styles.emptyCardText}>No completed deliveries yet</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollContent: { paddingBottom: 110 },
  headerContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  webHeaderInner: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  welcomeBack: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  userName: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  onlineBox: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  onlineLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  powerIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  powerIconActive: { backgroundColor: '#ECFDF5' },
  onlineStatusTexts: { gap: 2 },
  onlineText: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  statusSubtext: { fontSize: 12, color: '#64748B' },

  mainContent: { 
    paddingHorizontal: 20, 
    paddingTop: 20,
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  viewAll: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  statsRow: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTexts: { alignItems: 'center', width: '100%' },
  statValue: { fontSize: 13, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  statLabel: { fontSize: 11, color: '#64748B', textAlign: 'center' },

  // Active delivery card
  activeDeliveryCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusBadgeText: { color: '#10B981', fontSize: 12, fontWeight: '700' },
  deliveryPrice: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },

  addressSection: { flexDirection: 'row', gap: 14 },
  timelineContainer: { alignItems: 'center', paddingTop: 4 },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
  timelineLine: {
    width: 2,
    height: 45,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  addressInfo: { flex: 1 },
  addressBlock: { gap: 2 },
  addressLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '800' },
  placeName: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  placeAddress: { fontSize: 12, color: '#64748B' },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  orderId: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  continueLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  continueLinkText: { fontSize: 14, fontWeight: 'bold', color: Colors.primary },

  // New Request Card
  newRequestCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    backgroundColor: '#FFFDF9',
  },
  requestMain: { flexDirection: 'row', justifyContent: 'space-between' },
  requestLeft: { flex: 1, gap: 4 },
  requestStatusHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  requestDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  requestHeaderText: { fontSize: 12, color: '#10B981', fontWeight: '700' },
  requestRestaurant: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  requestDistanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  requestDistanceText: { fontSize: 12, color: '#64748B' },
  requestDropoff: { fontSize: 12, color: '#64748B', marginTop: 2 },
  requestRight: { alignItems: 'flex-end', gap: 8 },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  timerText: { fontSize: 12, color: '#FF8C00', fontWeight: '700' },
  requestPrice: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },

  progressBarWrapper: {
    height: 4,
    backgroundColor: '#FFE4E6',
    borderRadius: 2,
    marginVertical: 14,
    overflow: 'hidden',
  },
  progressBarActive: { height: '100%', backgroundColor: Colors.primary },

  requestActions: { flexDirection: 'row', gap: 12 },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  declineText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#10B981',
    gap: 6,
  },
  acceptText: { fontSize: 14, fontWeight: '700', color: '#FFF' },

  // Completed
  completedList: { gap: 12 },
  completedCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  completedMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  completedLeft: { flex: 1, gap: 4 },
  completedName: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  completedAddressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  completedAddress: { fontSize: 12, color: '#64748B' },
  completedDetails: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  completedPrice: { fontSize: 15, fontWeight: 'bold', color: Colors.primary },

  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyCardText: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
});

export default DriverHomeScreen;
