import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDriverDeliveries, updateOrderStatus } from '../services/api';

// ─── Available Delivery Request Card ──────────────────────────────────────────
const AvailableCard = ({ item, isAccepting, onAccept, onDecline }) => {
  const amount = item.amount || 850;
  return (
    <View style={styles.deliveryCard}>
      {/* Top Header Row */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.badgeAvailable}>
          <View style={styles.dotGreen} />
          <Text style={styles.badgeAvailableText}>New Delivery Request</Text>
        </View>
        <View style={styles.timerPill}>
          <Ionicons name="time-outline" size={13} color="#EA580C" />
          <Text style={styles.timerPillText}>25s</Text>
        </View>
      </View>

      {/* Main Info: Restaurant and Earnings */}
      <View style={styles.mainInfoRow}>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {item.restaurant}
          </Text>
          <View style={styles.distanceRow}>
            <Ionicons name="navigate-outline" size={13} color="#64748B" />
            <Text style={styles.distanceText}>
              {item.distance || '3.5 km'} away from you
            </Text>
          </View>
        </View>
        <View style={styles.earningsBox}>
          <Text style={styles.earningsLabel}>Earnings</Text>
          <Text style={styles.earningsAmount}>₦{amount.toLocaleString()}</Text>
        </View>
      </View>

      {/* Route: Pickup & Dropoff */}
      <View style={styles.routeContainer}>
        {item.pickupAddress ? (
          <View style={styles.routeItem}>
            <View style={styles.routePickupIcon}>
              <Ionicons name="storefront-outline" size={13} color="#EA580C" />
            </View>
            <View style={styles.routeTextCol}>
              <Text style={styles.routeLabelPickup}>PICKUP</Text>
              <Text style={styles.routeAddressText} numberOfLines={1}>
                {item.pickupAddress}
              </Text>
            </View>
          </View>
        ) : null}

        {item.pickupAddress ? <View style={styles.routeDividerLine} /> : null}

        <View style={styles.routeItem}>
          <View style={styles.routeDropoffIcon}>
            <Ionicons name="location" size={13} color="#EF4444" />
          </View>
          <View style={styles.routeTextCol}>
            <Text style={styles.routeLabelDropoff}>DROPOFF</Text>
            <Text style={styles.routeAddressText} numberOfLines={2}>
              {item.dropoffAddress || 'Customer Address'}
            </Text>
          </View>
        </View>
      </View>

      {/* Expiry Progress Bar */}
      <View style={styles.progressBarWrapper}>
        <View style={[styles.progressBarFill, { width: '80%' }]} />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={styles.declineBtn}
          onPress={onDecline}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={18} color="#64748B" />
          <Text style={styles.declineBtnText}>Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.acceptBtn, isAccepting && styles.btnDisabled]}
          onPress={onAccept}
          disabled={isAccepting}
          activeOpacity={0.7}
        >
          {isAccepting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color="#FFF" />
              <Text style={styles.acceptBtnText}>Accept Request</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Active Delivery Card ─────────────────────────────────────────────────────
const ActiveCard = ({ item, onTrack }) => {
  const amount = item.amount || 850;
  return (
    <View style={styles.deliveryCard}>
      {/* Top Header Row */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.badgeActive}>
          <View style={styles.dotBlue} />
          <Text style={styles.badgeActiveText}>
            {item.status || 'En route to customer'}
          </Text>
        </View>
        <View style={styles.earningsBox}>
          <Text style={styles.earningsLabel}>Earnings</Text>
          <Text style={styles.earningsAmountActive}>₦{amount.toLocaleString()}</Text>
        </View>
      </View>

      {/* Restaurant and Customer */}
      <View style={styles.mainInfoRow}>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {item.restaurant}
          </Text>
          <View style={styles.customerRow}>
            <Ionicons name="person-outline" size={13} color="#64748B" />
            <Text style={styles.customerText}>
              Customer: {item.customer || 'Customer'}
            </Text>
          </View>
        </View>
      </View>

      {/* Route: Pickup & Dropoff */}
      <View style={styles.routeContainer}>
        {item.pickupAddress ? (
          <View style={styles.routeItem}>
            <View style={styles.routePickupIcon}>
              <Ionicons name="storefront-outline" size={13} color="#EA580C" />
            </View>
            <View style={styles.routeTextCol}>
              <Text style={styles.routeLabelPickup}>PICKUP</Text>
              <Text style={styles.routeAddressText} numberOfLines={1}>
                {item.pickupAddress}
              </Text>
            </View>
          </View>
        ) : null}

        {item.pickupAddress ? <View style={styles.routeDividerLine} /> : null}

        <View style={styles.routeItem}>
          <View style={styles.routeDropoffIcon}>
            <Ionicons name="location" size={13} color="#EF4444" />
          </View>
          <View style={styles.routeTextCol}>
            <Text style={styles.routeLabelDropoff}>DROPOFF</Text>
            <Text style={styles.routeAddressText} numberOfLines={2}>
              {item.dropoffAddress || 'Customer Address'}
            </Text>
          </View>
        </View>
      </View>

      {/* Live Track Button */}
      <TouchableOpacity
        style={styles.trackDeliveryBtn}
        onPress={onTrack}
        activeOpacity={0.8}
      >
        <View style={styles.trackBtnLeft}>
          <Ionicons name="navigate-circle-outline" size={20} color="#FFF" />
          <Text style={styles.trackDeliveryBtnText}>Live Delivery Tracking</Text>
        </View>
        <Ionicons name="arrow-forward" size={18} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

// ─── Completed Delivery Card ──────────────────────────────────────────────────
const CompletedCard = ({ item }) => {
  const amount = item.amount || 850;
  return (
    <View style={styles.deliveryCard}>
      {/* Top Header Row */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.badgeCompleted}>
          <Ionicons name="checkmark-circle" size={15} color="#059669" />
          <Text style={styles.badgeCompletedText}>Delivered</Text>
        </View>
        <View style={styles.earningsBox}>
          <Text style={styles.earningsLabel}>Earned</Text>
          <Text style={styles.earningsAmountCompleted}>+₦{amount.toLocaleString()}</Text>
        </View>
      </View>

      {/* Restaurant and Customer */}
      <View style={styles.mainInfoRow}>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {item.restaurant}
          </Text>
          <View style={styles.customerRow}>
            <Ionicons name="person-outline" size={13} color="#64748B" />
            <Text style={styles.customerText}>
              Customer: {item.customer || 'Customer'}
            </Text>
          </View>
        </View>
      </View>

      {/* Dropoff Address */}
      {item.dropoffAddress ? (
        <View style={styles.completedDropoffRow}>
          <Ionicons name="location-outline" size={14} color="#64748B" />
          <Text style={styles.completedDropoffText} numberOfLines={2}>
            {item.dropoffAddress}
          </Text>
        </View>
      ) : null}

      {/* Order Meta Footer */}
      <View style={styles.completedFooter}>
        <Text style={styles.orderIdMeta}>
          Order #{item.id || item._id?.slice(-6) || '---'}
        </Text>
        <Text style={styles.orderDateMeta}>{item.date || 'Completed'}</Text>
      </View>
    </View>
  );
};

// ─── Empty State Component ────────────────────────────────────────────────────
const EmptyState = ({ icon, title, subtitle }) => (
  <View style={styles.emptyCard}>
    <View style={styles.emptyIconCircle}>
      <Ionicons name={icon} size={32} color="#94A3B8" />
    </View>
    <Text style={styles.emptyCardTitle}>{title}</Text>
    <Text style={styles.emptyCardSubtitle}>{subtitle}</Text>
  </View>
);

// ─── Main Screen Component ────────────────────────────────────────────────────
const DriverDeliveriesScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Available');
  const [deliveries, setDeliveries] = useState({ available: [], active: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchDeliveries = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getDriverDeliveries();
      if (res && res.success) {
        setDeliveries(res.data || { available: [], active: [], completed: [] });
      }
    } catch (e) {
      console.error('Fetch driver deliveries error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDeliveries();
    }, [fetchDeliveries])
  );

  const onRefresh = useCallback(() => {
    fetchDeliveries(true);
  }, [fetchDeliveries]);

  const handleAcceptOrder = async (orderId) => {
    setAcceptingId(orderId);
    try {
      const acceptedItem = deliveries.available?.find(d => (d._id || d.id) === orderId);
      setDeliveries(prev => ({
        ...prev,
        available: (prev.available || []).filter(d => (d._id || d.id) !== orderId),
        active: acceptedItem ? [{ ...acceptedItem, status: 'En route to customer' }, ...(prev.active || [])] : (prev.active || []),
      }));

      await updateOrderStatus(orderId, 'on the way');
      Alert.alert('Request Accepted! 🚀', 'Order accepted. You are now en route to pick up.', [
        {
          text: 'Start Delivery',
          onPress: () => navigation.navigate('DriverOrderTracking', { orderId }),
        },
      ]);
      fetchDeliveries(true);
    } catch (e) {
      console.error('Accept order error:', e);
      Alert.alert('Error', 'Could not accept request. Please try again.');
      fetchDeliveries(true);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDeclineOrder = async (orderId) => {
    try {
      setDeliveries(prev => ({
        ...prev,
        available: (prev.available || []).filter(d => (d._id || d.id) !== orderId),
      }));
      await updateOrderStatus(orderId, 'cancelled');
      Alert.alert('Request Declined', 'Delivery request declined.');
      fetchDeliveries(true);
    } catch (e) {
      fetchDeliveries(true);
    }
  };

  const tabs = [
    { label: 'Available', count: deliveries.available?.length || 0 },
    { label: 'Active', count: deliveries.active?.length || 0 },
    { label: 'Completed', count: deliveries.completed?.length || 0 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Deliveries</Text>
            <Text style={styles.headerSubtitle}>Manage and track your trips</Text>
          </View>
        </View>

        {/* Segmented Tabs */}
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.label;
              return (
                <TouchableOpacity
                  key={tab.label}
                  onPress={() => setActiveTab(tab.label)}
                  style={[styles.tab, isActive && styles.activeTab]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                    {tab.label}
                  </Text>
                  <View style={[styles.tabBadge, isActive ? styles.tabBadgeActive : styles.tabBadgeInactive]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                      {tab.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Content Body */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
              />
            }
          >
            {activeTab === 'Available' && (
              deliveries.available?.length > 0 ? (
                deliveries.available.map((item) => (
                  <AvailableCard
                    key={item._id || item.id}
                    item={item}
                    isAccepting={acceptingId === (item._id || item.id)}
                    onDecline={() => handleDeclineOrder(item._id || item.id)}
                    onAccept={() => handleAcceptOrder(item._id || item.id)}
                  />
                ))
              ) : (
                <EmptyState
                  icon="bicycle-outline"
                  title="No new delivery requests"
                  subtitle="New delivery requests from nearby vendors will appear here automatically."
                />
              )
            )}

            {activeTab === 'Active' && (
              deliveries.active?.length > 0 ? (
                deliveries.active.map((item) => (
                  <ActiveCard
                    key={item._id || item.id}
                    item={item}
                    onTrack={() => navigation.navigate('DriverOrderTracking', { orderId: item._id || item.id })}
                  />
                ))
              ) : (
                <EmptyState
                  icon="navigate-outline"
                  title="No active deliveries"
                  subtitle="When you accept a delivery request, you can track and complete it here."
                />
              )
            )}

            {activeTab === 'Completed' && (
              deliveries.completed?.length > 0 ? (
                deliveries.completed.map((item) => (
                  <CompletedCard
                    key={item._id || item.id}
                    item={item}
                  />
                ))
              ) : (
                <EmptyState
                  icon="checkmark-circle-outline"
                  title="No completed deliveries yet"
                  subtitle="All your delivered orders and earned payouts will be listed here."
                />
              )
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  screenWrapper: {
    flex: 1,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    marginRight: 14,
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  tabsWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabLabel: {
    color: '#0F172A',
    fontWeight: '700',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: '#EFF6FF',
  },
  tabBadgeInactive: {
    backgroundColor: '#E2E8F0',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBadgeTextActive: {
    color: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // ─── Unified Card Styles ──────────────────────────────────────────────────
  deliveryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeAvailable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  dotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  badgeAvailableText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  timerPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  badgeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  dotBlue: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },
  badgeActiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  badgeCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  badgeCompletedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },

  // Main Info
  mainInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  restaurantInfo: {
    flex: 1,
    marginRight: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    color: '#64748B',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customerText: {
    fontSize: 12,
    color: '#64748B',
  },
  earningsBox: {
    alignItems: 'flex-end',
  },
  earningsLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  earningsAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 1,
  },
  earningsAmountActive: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
    marginTop: 1,
  },
  earningsAmountCompleted: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
    marginTop: 1,
  },

  // Route Container
  routeContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  routePickupIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  routeDropoffIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  routeTextCol: {
    flex: 1,
  },
  routeLabelPickup: {
    fontSize: 9,
    fontWeight: '700',
    color: '#EA580C',
    letterSpacing: 0.6,
  },
  routeLabelDropoff: {
    fontSize: 9,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 0.6,
  },
  routeAddressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
    marginTop: 2,
    lineHeight: 16,
  },
  routeDividerLine: {
    height: 12,
    width: 1,
    backgroundColor: '#CBD5E1',
    marginLeft: 12,
    marginVertical: 4,
  },

  // Progress Bar
  progressBarWrapper: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },

  // Action Buttons
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  declineBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
  },
  declineBtnText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '700',
  },
  acceptBtn: {
    flex: 1.6,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  acceptBtnText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '700',
  },

  // Live Tracking Button
  trackDeliveryBtn: {
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  trackBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackDeliveryBtnText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '700',
  },

  // Completed Extras
  completedDropoffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  completedDropoffText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
  },
  completedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  orderIdMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  orderDateMeta: {
    fontSize: 11,
    color: '#94A3B8',
  },

  // Empty State
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyCardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});

export default DriverDeliveriesScreen;
