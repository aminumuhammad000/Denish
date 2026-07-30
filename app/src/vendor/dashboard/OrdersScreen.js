import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getVendorOrders } from '../../services/api';

// Demo orders shown when no real orders exist
const DEMO_ORDERS = [
  {
    _id: 'd1', orderId: 'ORD-2451', status: 'new',
    customerName: 'Aisha Mohammed', itemsCount: 2,
    items: '2x Jollof Rice & Chicken, 2x Chapman',
    amount: 10000, createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    _id: 'd2', orderId: 'ORD-2451', status: 'new',
    customerName: 'Aisha Mohammed', itemsCount: 2,
    items: '2x Jollof Rice & Chicken, 2x Chapman',
    amount: 10000, createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    _id: 'd3', orderId: 'ORD-2448', status: 'preparing',
    customerName: 'Emeka Obi', itemsCount: 3,
    items: '1x Suya Platter, 2x Puff Puff',
    amount: 5500, createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    _id: 'd4', orderId: 'ORD-2447', status: 'preparing',
    customerName: 'Fatima Bello', itemsCount: 1,
    items: '1x Pepper Soup',
    amount: 3500, createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
  },
  {
    _id: 'd5', orderId: 'ORD-2446', status: 'preparing',
    customerName: 'Chidi Okeke', itemsCount: 2,
    items: '2x Fried Rice',
    amount: 8000, createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    _id: 'd6', orderId: 'ORD-2444', status: 'delivered',
    customerName: 'Ngozi Adeyemi', itemsCount: 4,
    items: '4x Jollof Rice',
    amount: 18000, createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    _id: 'd7', orderId: 'ORD-2443', status: 'delivered',
    customerName: 'Taiwo Hassan', itemsCount: 2,
    items: '2x Suya Platter',
    amount: 7000, createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  },
  {
    _id: 'd8', orderId: 'ORD-2440', status: 'cancelled',
    customerName: 'Kemi Adio', itemsCount: 1,
    items: '1x Pepper Soup',
    amount: 3500, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

const TABS = ['New', 'Active', 'Completed', 'Cancelled'];

const TAB_STATUS_MAP = {
  New:       ['new'],
  Active:    ['preparing', 'ready'],
  Completed: ['delivered'],
  Cancelled: ['cancelled'],
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const OrdersScreen = () => {
  const { width } = useWindowDimensions();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('New');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getVendorOrders();
        const data = response?.data || [];
        setOrders(data.length > 0 ? data : DEMO_ORDERS);
      } catch {
        setOrders(DEMO_ORDERS);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const countForTab = (tab) =>
    orders.filter(o => TAB_STATUS_MAP[tab]?.includes(o.status)).length;

  const filteredOrders = orders.filter(o =>
    TAB_STATUS_MAP[activeTab]?.includes(o.status)
  );

  const handleAccept = (order) => {
    Alert.alert('Order Accepted', `Order ${order.orderId} has been accepted.`);
  };

  const handleReject = (order) => {
    Alert.alert('Reject Order', `Cancel order ${order.orderId}?`, [
      { text: 'No' },
      { text: 'Yes, cancel', style: 'destructive', onPress: () => {} },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Orders</Text>
          <Text style={styles.headerSub}>Manage orders</Text>
        </View>
      </View>

      {/* Tab Filter */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {TABS.map(tab => {
            const count = countForTab(tab);
            const isActive = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, isActive && styles.tabActive]}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
                {count > 0 && (
                  <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeInactive]}>
                    <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filteredOrders.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={40} color="#DDD" />
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} orders</Text>
          </View>
        ) : (
          filteredOrders.map((order, idx) => (
            <View key={order._id || idx} style={styles.orderCard}>
              {/* Order top row */}
                  <View style={styles.orderTopRow}>
                    <View style={[styles.orderTopLeft, { maxWidth: Math.round(width * 0.62) }]}> 
                      <Text style={styles.orderId} numberOfLines={1} ellipsizeMode="tail">{order.orderId}</Text>
                      <Text style={styles.orderTime} numberOfLines={1}>{timeAgo(order.createdAt)}</Text>
                    </View>
                    <Text style={[styles.orderAmount, { maxWidth: Math.round(width * 0.32), textAlign: 'right' }]} numberOfLines={1}>₦{(order.amount || 0).toLocaleString()}</Text>
                  </View>

              {/* Customer & items */}
              <Text style={styles.customerName} numberOfLines={1} ellipsizeMode="tail">{order.customerName} | {order.itemsCount} items</Text>
              <Text style={styles.itemsText} numberOfLines={2} ellipsizeMode="tail">{order.items || `${order.itemsCount} items`}</Text>

              {/* Action buttons */}
              {activeTab === 'New' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.viewDetailsBtn}>
                    <Text style={styles.viewDetailsBtnText}>View details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(order)}>
                    <Ionicons name="close" size={16} color="#E74C3C" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.acceptBtn, { minWidth: 90 }]} onPress={() => handleAccept(order)}>
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              )}
              {activeTab === 'Active' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.viewDetailsBtn}>
                    <Text style={styles.viewDetailsBtnText}>View details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.acceptBtn, { flex: 1 }]}>
                    <Text style={styles.acceptBtnText}>Mark Ready</Text>
                  </TouchableOpacity>
                </View>
              )}
              {(activeTab === 'Completed' || activeTab === 'Cancelled') && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.viewDetailsBtn, { flex: 1 }]}>
                    <Text style={styles.viewDetailsBtnText}>View details</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F4F4' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  headerSub: { fontSize: 11, color: '#AAA', marginTop: 1 },

  // Tabs
  tabsWrapper: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    paddingVertical: 12,
  },
  tabsRow: { paddingHorizontal: 14, gap: 8 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFF',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  tabText: { fontSize: 13, color: '#666', fontWeight: '500' },
  tabTextActive: { color: '#FFF', fontWeight: '700' },
  badge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  badgeInactive: { backgroundColor: '#FF8C00' },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  badgeTextActive: { color: '#FFF' },

  // Scroll
  scroll: { padding: 14, paddingBottom: 100 },

  // Empty state
  empty: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyText: { fontSize: 14, color: '#BBB', fontWeight: '500' },

  // Order Card
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  orderTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderId: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  orderTime: { fontSize: 12, color: '#AAA' },
  orderAmount: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  customerName: { fontSize: 13, color: '#555', marginBottom: 3 },
  itemsText: { fontSize: 12, color: '#AAA', marginBottom: 14 },

  // Buttons
  actionRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  viewDetailsBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewDetailsBtnText: { fontSize: 13, color: '#333', fontWeight: '500' },
  rejectBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FADBD8',
    backgroundColor: '#FEF9F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtn: {
    backgroundColor: '#FF8C00',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  acceptBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});

export default OrdersScreen;
