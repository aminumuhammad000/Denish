import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Modal, FlatList, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getCustomerOrders } from '../services/api';
import { Colors } from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomerBottomTab from './components/CustomerBottomTab';

const { width, height } = Dimensions.get('window');

const StatusBadge = ({ status }) => {
  let bgColor = '#FFF7ED';
  let textColor = '#EA580C';
  let label = status || 'Active';

  if (status?.toLowerCase() === 'delivered') {
    bgColor = '#F0FDF4';
    textColor = '#16A34A';
  } else if (status?.toLowerCase() === 'cancelled') {
    bgColor = '#FEF2F2';
    textColor = '#DC2626';
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
      <Text style={[styles.statusTabText, { color: textColor }]}>
        {label.charAt(0).toUpperCase() + label.slice(1)}
      </Text>
    </View>
  );
};

const CustomerOrdersScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('All');
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const tabs = ['All', 'Active', 'Delivered', 'Cancelled'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getCustomerOrders();
      if (res.success) {
        setOrders(res.data);
        setFilteredOrders(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'All') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => 
        (activeTab === 'Active' && (o.status === 'pending' || o.status === 'preparing' || o.status === 'ready')) ||
        (o.status?.toLowerCase() === activeTab.toLowerCase())
      ));
    }
  }, [activeTab, orders]);

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity style={styles.orderCard} onPress={() => openOrderDetails(item)}>
      <Image 
        source={{ uri: item.vendorId?.logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200' }} 
        style={styles.vendorImg} 
      />
      <View style={styles.orderInfo}>
        <View style={styles.orderHeader}>
          <Text style={styles.vendorName}>{item.vendorId?.businessName || 'Mama\'s Kitchen'}</Text>
          <StatusBadge status={item.status === 'pending' ? 'Active' : item.status} />
        </View>
        <Text style={styles.orderItems} numberOfLines={1}>
          {item.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
        </Text>
        <View style={styles.orderFooter}>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}, {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text style={styles.orderAmount}>₦{(item.totalAmount || item.total || 0).toLocaleString()}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 5 }} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your orders</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {tabs.map(tab => {
            const count = tab === 'All' ? orders.length : orders.filter(o => 
              (tab === 'Active' && (o.status === 'pending' || o.status === 'preparing' || o.status === 'ready')) ||
              (o.status?.toLowerCase() === tab.toLowerCase())
            ).length;
            
            return (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                <View style={[styles.tabBadge, activeTab === tab ? styles.activeTabBadge : styles.inactiveTabBadge]}>
                  <Text style={[styles.tabBadgeText, activeTab === tab && styles.activeTabBadgeText]}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={80} color="#EEE" />
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          }
        />
      )}

      {/* Order Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>

            <Text style={styles.modalOrderId}>ORD-{selectedOrder?._id?.slice(-4).toUpperCase() || '7241'}</Text>
            <Text style={styles.modalDate}>
              {selectedOrder && new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}, {selectedOrder && new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>

            <View style={styles.modalVendorRow}>
              <Image 
                source={{ uri: selectedOrder?.vendorId?.logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200' }} 
                style={styles.modalVendorImg} 
              />
              <View>
                <Text style={styles.modalVendorName}>{selectedOrder?.vendorId?.businessName || 'Mama\'s Kitchen'}</Text>
                <Text style={styles.modalStatusText}>
                  {selectedOrder?.status === 'pending' ? 'Active' : selectedOrder?.status}
                </Text>
              </View>
            </View>

            <Text style={styles.modalSectionTitle}>Order Items</Text>
            <View style={styles.itemsList}>
              {selectedOrder?.items?.map((item, idx) => (
                <View key={idx} style={styles.modalItemRow}>
                  <Text style={styles.modalItemText}>{item.name} x {item.quantity}</Text>
                  <Text style={styles.modalItemPrice}>₦{(item.price * item.quantity).toLocaleString()}</Text>
                </View>
              ))}
              <View style={styles.modalTotalRow}>
                <Text style={styles.modalTotalLabel}>Total</Text>
                <Text style={styles.modalTotalPrice}>₦{(selectedOrder?.totalAmount || selectedOrder?.total || 0).toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.modalInfoBox}>
              <Text style={styles.modalInfoLabel}>Delivering to: <Text style={styles.modalInfoValue}>{selectedOrder?.deliveryAddress || selectedOrder?.address || 'No address'}</Text></Text>
              <Text style={styles.modalInfoLabel}>Payment: <Text style={styles.modalInfoValue}>Visa ---- 4242</Text></Text>
            </View>

            <TouchableOpacity 
              style={styles.trackBtn} 
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('TrackOrder', { orderId: selectedOrder?._id || selectedOrder?.orderId });
              }}
            >
              <Text style={styles.trackBtnText}>Track order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Bottom Tab Bar */}
      <CustomerBottomTab activeTab="Orders" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 60 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  backBtn: { padding: 4 },
  tabsContainer: { borderBottomWidth: 1, borderColor: '#F0F0F0', paddingVertical: 10 },
  tabsScroll: { paddingHorizontal: 16, gap: 10 },
  tab: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    gap: 6
  },
  activeTab: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE' },
  tabText: { fontSize: 13, color: '#666', fontWeight: '600' },
  activeTabText: { color: '#333' },
  tabBadge: { 
    width: 18, 
    height: 18, 
    borderRadius: 9, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  activeTabBadge: { backgroundColor: Colors.primary },
  inactiveTabBadge: { backgroundColor: '#DDD' },
  tabBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#666' },
  activeTabBadgeText: { color: '#FFF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  orderCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 12, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  vendorImg: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#EEE' },
  orderInfo: { flex: 1, marginLeft: 12 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  vendorName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  orderItems: { fontSize: 12, color: '#999', marginBottom: 8 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderDate: { fontSize: 11, color: '#BBB' },
  orderAmount: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusTabText: { fontSize: 10, fontWeight: '700' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#CCC', fontSize: 16, fontWeight: '600', marginTop: 10 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', width: width * 0.9, borderRadius: 24, padding: 24, position: 'relative' },
  closeBtn: { position: 'absolute', top: 20, right: 20, padding: 4 },
  modalOrderId: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', textAlign: 'center', marginTop: 10 },
  modalDate: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  modalVendorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  modalVendorImg: { width: 50, height: 50, borderRadius: 10, marginRight: 12 },
  modalVendorName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  modalStatusText: { fontSize: 12, color: '#FF8C00', fontWeight: '600' },
  modalSectionTitle: { fontSize: 13, fontWeight: '700', color: '#999', marginBottom: 15 },
  itemsList: { marginBottom: 20 },
  modalItemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  modalItemText: { fontSize: 14, color: '#333' },
  modalItemPrice: { fontSize: 14, fontWeight: '600', color: '#333' },
  modalTotalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#F0F0F0', paddingTop: 12, marginTop: 5 },
  modalTotalLabel: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  modalTotalPrice: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
  modalInfoBox: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 15, marginBottom: 25 },
  modalInfoLabel: { fontSize: 13, color: '#999', marginBottom: 8 },
  modalInfoValue: { color: '#333', fontWeight: '500' },
  trackBtn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 14, alignItems: 'center' },
  trackBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

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
  },
  tabItem: {
    alignItems: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
  },
});

export default CustomerOrdersScreen;
