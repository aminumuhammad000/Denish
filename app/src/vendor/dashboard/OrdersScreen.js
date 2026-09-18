import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, useWindowDimensions, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getVendorOrders, updateVendorOrderStatus } from '../../services/api';

const TABS = ['New', 'Active', 'Completed', 'Cancelled'];

const TAB_STATUS_MAP = {
  New:       ['new', 'pending'],
  Active:    ['preparing', 'ready'],
  Completed: ['delivered'],
  Cancelled: ['cancelled'],
};

function formatItemsText(items, itemsCount) {
  if (typeof items === 'string') return items;
  if (Array.isArray(items) && items.length > 0) {
    return items
      .map(i => {
        if (!i) return '';
        if (typeof i === 'string') return i;
        const qty = i.quantity || 1;
        const name = i.name || 'Item';
        return `${qty}x ${name}`;
      })
      .filter(Boolean)
      .join(', ');
  }
  return itemsCount ? `${itemsCount} items` : 'Order items';
}

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

  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await getVendorOrders();
      const data = response?.data || [];
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const countForTab = (tab) =>
    orders.filter(o => TAB_STATUS_MAP[tab]?.includes(o.status)).length;

  const filteredOrders = orders.filter(o =>
    TAB_STATUS_MAP[activeTab]?.includes(o.status)
  );

  const handleAccept = async (order) => {
    try {
      await updateVendorOrderStatus(order._id || order.id || order.orderId, 'preparing');
      Alert.alert('Order Accepted 🍳', `Order ${order.orderId} is now marked as Preparing!`);
      fetchOrders();
    } catch (e) {
      Alert.alert('Error', 'Could not update order status.');
    }
  };

  const handleMarkReady = async (order) => {
    try {
      await updateVendorOrderStatus(order._id || order.id || order.orderId, 'ready');
      Alert.alert('Order Ready! 🚴‍♂️', `Order ${order.orderId} marked as Ready for Pickup.`);
      fetchOrders();
    } catch (e) {
      Alert.alert('Error', 'Could not update order status.');
    }
  };

  const handleReject = (order) => {
    Alert.alert('Reject Order', `Cancel order ${order.orderId}?`, [
      { text: 'No' },
      { 
        text: 'Yes, cancel', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await updateVendorOrderStatus(order._id || order.id || order.orderId, 'cancelled');
            fetchOrders();
          } catch (e) {}
        } 
      },
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
            <Text style={styles.emptySubText}>Your dashboard is connected to the server. Orders will show once they arrive.</Text>
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
              <Text style={styles.customerName} numberOfLines={1} ellipsizeMode="tail">
                {order.customerName || 'Customer'} | {Array.isArray(order.items) ? order.items.length : (order.itemsCount || 1)} items
              </Text>
              <Text style={styles.itemsText} numberOfLines={2} ellipsizeMode="tail">
                {formatItemsText(order.itemsSummary || order.items, order.itemsCount)}
              </Text>

              {/* Action buttons */}
              {activeTab === 'New' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.viewDetailsBtn} onPress={() => setSelectedOrder(order)}>
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
                  <TouchableOpacity style={styles.viewDetailsBtn} onPress={() => setSelectedOrder(order)}>
                    <Text style={styles.viewDetailsBtnText}>View details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.acceptBtn, { flex: 1 }]} onPress={() => handleMarkReady(order)}>
                    <Text style={styles.acceptBtnText}>Mark Ready</Text>
                  </TouchableOpacity>
                </View>
              )}
              {(activeTab === 'Completed' || activeTab === 'Cancelled') && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.viewDetailsBtn, { flex: 1 }]} onPress={() => setSelectedOrder(order)}>
                    <Text style={styles.viewDetailsBtnText}>View details</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Order Details Modal */}
      <Modal
        visible={!!selectedOrder}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Order {selectedOrder?.orderId}</Text>
                <Text style={styles.modalSub}>{selectedOrder?.createdAt ? timeAgo(selectedOrder.createdAt) : ''}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedOrder(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionLabel}>CUSTOMER</Text>
                <Text style={styles.modalCustomerName}>{selectedOrder?.customerName || 'Customer'}</Text>
                {!!selectedOrder?.customerPhone && (
                  <Text style={styles.modalDetailText}>📞 {selectedOrder.customerPhone}</Text>
                )}
                <Text style={styles.modalDetailText}>📍 {selectedOrder?.deliveryAddress || 'Standard Delivery'}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionLabel}>ORDER ITEMS</Text>
                {Array.isArray(selectedOrder?.items) && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, idx) => (
                    <View key={item._id || idx} style={styles.modalItemRow}>
                      <Text style={styles.modalItemName}>{item.quantity || 1}x {item.name || 'Item'}</Text>
                      <Text style={styles.modalItemPrice}>₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.modalDetailText}>{formatItemsText(selectedOrder?.itemsSummary || selectedOrder?.items, selectedOrder?.itemsCount)}</Text>
                )}
              </View>

              <View style={styles.modalTotalRow}>
                <Text style={styles.modalTotalLabel}>Total Amount</Text>
                <Text style={styles.modalTotalValue}>₦{(selectedOrder?.amount || selectedOrder?.total || 0).toLocaleString()}</Text>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.modalDoneBtn} onPress={() => setSelectedOrder(null)}>
              <Text style={styles.modalDoneBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  scroll: { padding: 14, paddingBottom: 110 },

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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  modalSub: { fontSize: 12, color: '#888', marginTop: 2 },
  modalCloseBtn: { padding: 4 },
  modalSection: {
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  modalCustomerName: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 4 },
  modalDetailText: { fontSize: 13, color: '#555', marginTop: 2 },
  modalItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemName: { fontSize: 14, color: '#333', fontWeight: '500' },
  modalItemPrice: { fontSize: 14, color: '#111', fontWeight: '600' },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    marginTop: 6,
  },
  modalTotalLabel: { fontSize: 15, fontWeight: '600', color: '#333' },
  modalTotalValue: { fontSize: 18, fontWeight: '800', color: '#FF8C00' },
  modalDoneBtn: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  modalDoneBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});

export default OrdersScreen;
