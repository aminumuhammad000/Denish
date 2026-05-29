import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { getVendorOrders } from '../../services/api';
import moment from 'moment'; // We mock time with moment or just use strings. If moment isn't installed we can just format the date.

const statusInfo = {
  new:       { color: '#FF8C00', bg: '#FFF3E0' },
  preparing: { color: '#27AE60', bg: '#E8F5E9' },
  ready:     { color: '#2980B9', bg: '#E8F4FD' },
  delivered: { color: '#888',    bg: '#F5F5F5' },
};

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getVendorOrders();
        if (response.success) {
          setOrders(response.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getFilteredOrders = () => {
    if (activeTab === 'All') return orders;
    return orders.filter(order => order.status.toLowerCase() === activeTab.toLowerCase());
  };

  const filteredOrders = getFilteredOrders();

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Orders</Text>
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {['All', 'New', 'Preparing', 'Ready', 'Delivered'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.filterTab, tab === activeTab && styles.filterTabActive]}
          >
            <Text style={[styles.filterText, tab === activeTab && styles.filterTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll}>
        {filteredOrders.length === 0 ? (
           <Text style={{textAlign: 'center', marginTop: 20, color: '#888'}}>No {activeTab.toLowerCase()} orders found.</Text>
        ) : (
          filteredOrders.map((order) => {
            const s = statusInfo[order.status] || { color: '#888', bg: '#F5F5F5' };
            // Mock a friendly time display
            const timeAgo = new Date(order.createdAt).getTime() > 0 ? new Date(order.createdAt).toLocaleTimeString() : 'Just now';
            return (
              <TouchableOpacity key={order._id} style={styles.orderCard}>
                <View style={styles.orderRow}>
                  <Text style={styles.orderId}>{order.orderId}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.statusText, { color: s.color }]}>{order.status}</Text>
                  </View>
                  <Text style={styles.orderTime}>{timeAgo}</Text>
                </View>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <Text style={styles.orderMeta}>{order.itemsCount} items</Text>
                <View style={styles.orderFooter}>
                  <Text style={styles.orderAmount}>₦{order.amount.toLocaleString()}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#ccc" />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F7F7' },
  topBar: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#EEE' },
  topTitle: { fontSize: 22, fontWeight: 'bold' },
  filterScroll: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#EEE' },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#EEE', marginRight: 10, backgroundColor: '#fff' },
  filterTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: '#555', fontSize: 13 },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },
  scroll: { padding: 16, paddingBottom: 100 },
  orderCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14, elevation: 1 },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  orderId: { fontWeight: 'bold', fontSize: 15 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },
  orderTime: { color: '#aaa', fontSize: 12, marginLeft: 'auto' },
  customerName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  orderMeta: { color: '#888', fontSize: 13, marginBottom: 10 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderAmount: { fontWeight: 'bold', fontSize: 16, color: '#000' },
});

export default OrdersScreen;
