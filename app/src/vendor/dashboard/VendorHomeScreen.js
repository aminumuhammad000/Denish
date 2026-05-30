import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  SafeAreaView, Switch, Modal, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { getVendorDashboardData } from '../../services/api';

const statusColor = { new: '#FF8C00', preparing: '#27AE60' };
const barDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const VendorHomeScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getVendorDashboardData();
        if (response.success) {
          setData(response.data);
          setIsOpen(response.data.storeOpen);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!data) return null;

  const isPending = data.status === 'Pending';

  return (
    <SafeAreaView style={styles.safeArea}>
      {isPending && (
        <View style={styles.pendingBanner}>
          <Ionicons name="information-circle" size={20} color="#fff" />
          <Text style={styles.pendingText}>Your account is pending approval. Some features are restricted.</Text>
        </View>
      )}
      <ScrollView style={[styles.scroll, isPending && { opacity: 0.8 }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>Restaurant name</Text>
            <Text style={styles.headerTitle}>{data.businessName || 'Your Restaurant'}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(data.businessName || 'VR').substring(0, 2).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Store Status Card */}
        <View style={styles.storeCard}>
          <View style={styles.storeCardLeft}>
            <Ionicons name="power-outline" size={22} color={Colors.primary} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.storeOpenText}>{isOpen ? 'Store is open' : 'Store is closed'}</Text>
              <Text style={styles.storeSubText}>{isOpen ? 'Accepting orders' : 'Not accepting orders'}</Text>
            </View>
          </View>
          <Switch
            value={isOpen}
            onValueChange={isPending ? null : setIsOpen}
            disabled={isPending}
            trackColor={{ true: Colors.primary, false: '#ccc' }}
          />
        </View>

        {/* Today Stats */}
        <Text style={styles.sectionLabel}>Today</Text>
        <View style={styles.statsRow}>
          {[
            { label: 'New', value: data.stats?.new || 0, icon: 'bag-outline' },
            { label: 'Cooking', value: data.stats?.cooking || 0, icon: 'flame-outline' },
            { label: 'Ready', value: data.stats?.ready || 0, icon: 'checkmark-circle-outline' }
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon} size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Revenue */}
        <View style={styles.revenueRow}>
          <View>
            <Text style={styles.sectionLabel}>Today's revenue</Text>
            <Text style={styles.revenueAmount}>₦{(data.todayRevenue || 0).toLocaleString()}</Text>
          </View>
          <Text style={styles.deliveredBadge}>{data.delivered || 0} delivered</Text>
        </View>

        {/* Low Stock */}
        <TouchableOpacity style={styles.lowStockCard}>
          <Ionicons name="warning-outline" size={18} color={Colors.primary} />
          <Text style={styles.lowStockText}>{data.lowStock} item low on stock</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.primary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* Live Order Queue */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Live order queue</Text>
          <TouchableOpacity><Text style={styles.viewAll}>View all</Text></TouchableOpacity>
        </View>
        {(data.liveOrders || []).map((o, i) => (
          <TouchableOpacity key={i} style={styles.orderRow} onPress={() => { setSelectedOrder(o); setModalVisible(true); }}>
            <View style={styles.orderLeft}>
              <Text style={styles.orderId}>{o.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor[o.status] + '22' }]}>
                <Text style={[styles.statusText, { color: statusColor[o.status] }]}>{o.status}</Text>
              </View>
              <Text style={styles.orderCustomer}>{o.customer} | {o.items}</Text>
            </View>
            <View style={styles.orderRight}>
              <Text style={styles.orderAmount}>{o.amount}</Text>
              <Ionicons name="arrow-forward" size={16} color="#ccc" />
            </View>
          </TouchableOpacity>
        ))}

        {/* Earnings Chart */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Earnings</Text>
          <TouchableOpacity><Text style={styles.viewAll}>View all</Text></TouchableOpacity>
        </View>
        <View style={styles.chartCard}>
          <Text style={styles.chartSubLabel}>Last 7 days</Text>
          <View style={styles.chart}>
            {(data.barData || []).map((h, i) => (
              <View key={i} style={styles.barCol}>
                <View style={[styles.bar, { height: h * 3, backgroundColor: i === 2 ? Colors.primary : '#FFDBB5' }]} />
                <Text style={styles.barLabel}>{barDays[i]}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Order Detail Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          {selectedOrder && (
            <View style={styles.modalCard}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalOrderId}>{selectedOrder.id}</Text>
              <Text style={styles.modalTime}>3min ago</Text>
              <Text style={styles.modalCustomer}>{selectedOrder.customer}</Text>
              <Text style={styles.modalPhone}>+2340905838929</Text>
              <Text style={styles.modalAddress}>12 Marina Road, Lagos</Text>
              <Text style={styles.modalItemsLabel}>Order items</Text>
              {[{ name: 'Jollof Rice x 2', price: '₦6,000' }, { name: 'Egusi Soup x 1', price: '₦3,800' }].map((item, i) => (
                <View key={i} style={styles.modalItemRow}>
                  <Text style={styles.modalItemName}>{item.name}</Text>
                  <Text style={styles.modalItemPrice}>{item.price}</Text>
                </View>
              ))}
              <View style={styles.modalTotalRow}>
                <Text style={styles.modalTotalLabel}>Total</Text>
                <Text style={styles.modalTotalValue}>₦8,000</Text>
              </View>
              <View style={styles.instructionsBox}>
                <Text style={styles.instructionsLabel}>SPECIAL INSTRUCTIONS</Text>
                <Text style={styles.instructionsText}>Extra spicy please</Text>
              </View>
              <TouchableOpacity style={styles.acceptBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.acceptBtnText}>Accept order</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F7F7' },
  pendingBanner: {
    backgroundColor: '#FF8C00',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pendingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  header: { backgroundColor: Colors.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 30 },
  headerLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  storeCard: { margin: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  storeCardLeft: { flexDirection: 'row', alignItems: 'center' },
  storeOpenText: { fontWeight: 'bold', fontSize: 15 },
  storeSubText: { color: '#888', fontSize: 12 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginHorizontal: 16, marginTop: 8, marginBottom: 8 },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', elevation: 1 },
  statValue: { fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  statLabel: { fontSize: 12, color: '#888' },
  revenueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginHorizontal: 16, marginBottom: 12 },
  revenueAmount: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  deliveredBadge: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  lowStockCard: { marginHorizontal: 16, backgroundColor: '#FFF8F0', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, borderWidth: 1, borderColor: '#FFE0B2' },
  lowStockText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 8 },
  viewAll: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  orderRow: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderLeft: { gap: 2 },
  orderId: { fontWeight: 'bold', fontSize: 14 },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 11, fontWeight: '600' },
  orderCustomer: { color: '#888', fontSize: 12 },
  orderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderAmount: { fontWeight: 'bold', fontSize: 14 },
  chartCard: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 100, elevation: 1 },
  chartSubLabel: { color: '#888', fontSize: 12, marginBottom: 12 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 80 },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { width: 22, borderRadius: 4, marginBottom: 4 },
  barLabel: { fontSize: 10, color: '#888' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%' },
  closeBtn: { alignSelf: 'flex-end' },
  modalOrderId: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 4 },
  modalTime: { textAlign: 'center', color: '#888', fontSize: 12, marginBottom: 16 },
  modalCustomer: { fontWeight: 'bold', fontSize: 15 },
  modalPhone: { color: Colors.primary, fontSize: 13 },
  modalAddress: { color: '#666', fontSize: 13, marginBottom: 16 },
  modalItemsLabel: { fontSize: 12, color: '#888', fontWeight: '600', marginBottom: 8 },
  modalItemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  modalItemName: { fontSize: 14 },
  modalItemPrice: { fontSize: 14, fontWeight: '600' },
  modalTotalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#EEE', paddingTop: 10, marginTop: 6 },
  modalTotalLabel: { fontWeight: 'bold' },
  modalTotalValue: { fontWeight: 'bold' },
  instructionsBox: { backgroundColor: '#FFFBF0', borderRadius: 8, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#FFE699' },
  instructionsLabel: { fontSize: 10, color: '#888', fontWeight: '700', marginBottom: 4 },
  instructionsText: { fontSize: 13 },
  acceptBtn: { backgroundColor: Colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 16 },
  acceptBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  rejectBtn: { padding: 14, alignItems: 'center' },
  rejectBtnText: { color: '#333', fontSize: 15 },
});

export default VendorHomeScreen;
