import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const ORDERS = [
  { id: 'ORD-2451', customer: 'Aisha Mohammed', items: 2, amount: '₦10,000', status: 'new', time: '3min ago' },
  { id: 'ORD-2452', customer: 'Chidi Okafor',   items: 3, amount: '₦10,000', status: 'new', time: '5min ago' },
  { id: 'ORD-2448', customer: 'Fatima Bello',   items: 2, amount: '₦10,000', status: 'preparing', time: '12min ago' },
  { id: 'ORD-2431', customer: 'Emeka Obi',      items: 1, amount: '₦5,000',  status: 'ready', time: '20min ago' },
  { id: 'ORD-2430', customer: 'Ngozi Eze',      items: 4, amount: '₦14,000', status: 'delivered', time: '1hr ago' },
];

const statusInfo = {
  new:       { color: '#FF8C00', bg: '#FFF3E0' },
  preparing: { color: '#27AE60', bg: '#E8F5E9' },
  ready:     { color: '#2980B9', bg: '#E8F4FD' },
  delivered: { color: '#888',    bg: '#F5F5F5' },
};

const OrdersScreen = () => {
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
            style={[styles.filterTab, tab === 'All' && styles.filterTabActive]}
          >
            <Text style={[styles.filterText, tab === 'All' && styles.filterTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll}>
        {ORDERS.map((order) => {
          const s = statusInfo[order.status];
          return (
            <TouchableOpacity key={order.id + order.time} style={styles.orderCard}>
              <View style={styles.orderRow}>
                <Text style={styles.orderId}>{order.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.statusText, { color: s.color }]}>{order.status}</Text>
                </View>
                <Text style={styles.orderTime}>{order.time}</Text>
              </View>
              <Text style={styles.customerName}>{order.customer}</Text>
              <Text style={styles.orderMeta}>{order.items} items</Text>
              <View style={styles.orderFooter}>
                <Text style={styles.orderAmount}>{order.amount}</Text>
                <Ionicons name="arrow-forward" size={16} color="#ccc" />
              </View>
            </TouchableOpacity>
          );
        })}
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
