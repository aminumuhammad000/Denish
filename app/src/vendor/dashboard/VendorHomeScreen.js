import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Switch, Modal, ActivityIndicator, StatusBar, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { getVendorDashboardData, updateVendorProfile } from '../../services/api';


const statusColor = { new: '#FF8C00', preparing: '#27AE60' };
const barDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const VendorHomeScreen = ({ navigation }) => {
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

  const toggleStoreStatus = async () => {
    if (isPending) return;
    const newStatus = isOpen ? 'Suspended' : 'Approved';
    setIsOpen(!isOpen);
    try {
      await updateVendorProfile({ status: newStatus });
    } catch (err) {
      console.error('Failed to update store status', err);
      setIsOpen(isOpen);
    }
  };



  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!data) return null;

  const isPending = data.status === 'Pending';

  const theme = {
    bg: '#FDFDFD',
    text: '#1a1a1a',
    subText: '#888888',
    card: '#FFFFFF',
    border: '#F0F0F0',
    headerBg: '#FF8C00',
    inputBg: '#F8F8F8',
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="dark-content" />
      {isPending && (
        <View style={styles.pendingBanner}>
          <Ionicons name="information-circle" size={16} color="#fff" />
          <Text style={styles.pendingText}>Your account is pending approval.</Text>
        </View>
      )}
      <ScrollView showsVerticalScrollIndicator={false} style={[styles.scroll, isPending && { opacity: 0.9 }]}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <View style={styles.headerUserInfo}>
              <TouchableOpacity onPress={() => navigation.navigate('VendorProfile')}>
                <View style={styles.avatar}>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&q=80' }}
                    style={styles.avatarImg}
                  />
                </View>
              </TouchableOpacity>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.businessNameHeader}>{data.businessName || "Mama's Kitchen"}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Store Status Card - Floating */}
          <View style={[styles.storeCard, { backgroundColor: theme.card }]}>
            <View style={styles.storeCardLeft}>
              <View style={[styles.powerIconBg, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="power-outline" size={20} color="#4CAF50" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.storeOpenText, { color: theme.text }]}>{isOpen ? 'Store is open' : 'Store is closed'}</Text>
                <Text style={[styles.storeSubText, { color: theme.subText }]}>{isOpen ? 'Accepting orders' : 'Not accepting orders'}</Text>
              </View>
            </View>
            <Switch
              value={isOpen}
              onValueChange={toggleStoreStatus}
              disabled={isPending}
              trackColor={{ true: '#4CAF50', false: '#ccc' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.contentBody}>
          {/* Today Summary */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today</Text>
          <View style={styles.statsGrid}>
            {[
              { label: 'New', value: data.stats?.new || 2, icon: 'time-outline', color: '#FFF5E6', iconColor: '#FF8C00' },
              { label: 'Cooking', value: data.stats?.cooking || 2, icon: 'flame-outline', color: '#E8F5E9', iconColor: '#27AE60' },
              { label: 'Ready', value: data.stats?.ready || 1, icon: 'checkmark-circle-outline', color: '#E3F2FD', iconColor: '#2196F3' }
            ].map((s) => (
              <View key={s.label} style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.statIconBg, { backgroundColor: s.color }]}>
                  <Ionicons name={s.icon} size={18} color={s.iconColor} />
                </View>
                <Text style={[styles.statValue, { color: theme.text }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: theme.subText }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Revenue */}
          <View style={styles.revenueHeader}>
            <Text style={[styles.revenueLabel, { color: theme.subText }]}>Today's revenue</Text>
            <Text style={styles.deliveredCount}>{data.delivered || 2} delivered</Text>
          </View>
          <Text style={[styles.revenueValue, { color: theme.text }]}>₦{(data.todayRevenue || 17000).toLocaleString()}</Text>

          {/* Stock Warning */}
          <TouchableOpacity style={styles.warningCard}>
            <View style={styles.warningIconBg}>
              <Ionicons name="alert-circle" size={18} color="#FF8C00" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.warningTitle}>{data.lowStock || 1} item low on stock</Text>
              <Text style={styles.warningSubText}>Puff Puff (8pcs)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#FF8C00" />
          </TouchableOpacity>

          {/* Live Order Queue */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Live order queue</Text>
            <TouchableOpacity><Text style={styles.viewAllText}>View all</Text></TouchableOpacity>
          </View>

          {(data.liveOrders && data.liveOrders.length > 0 ? data.liveOrders : []).map((o, i) => (
            <TouchableOpacity key={o._id || i} style={[styles.orderRow, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => { setSelectedOrder(o); setModalVisible(true); }}>
              <View style={styles.orderMainInfo}>
                <View style={styles.orderIdRow}>
                  <Text style={[styles.orderIdText, { color: theme.text }]}>{o.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: o.status === 'new' ? '#FFF5E6' : '#E8F5E9' }]}>
                    <Text style={[styles.statusBadgeText, { color: o.status === 'new' ? '#FF8C00' : '#27AE60' }]}>
                      {o.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.orderCustomerText, { color: theme.subText }]}>{o.customer} | {o.items}</Text>
              </View>
              <View style={styles.orderRightSide}>
                <Text style={[styles.orderAmountText, { color: theme.text }]}>{o.amount}</Text>
                <Ionicons name="chevron-forward" size={16} color="#DDD" />
              </View>
            </TouchableOpacity>
          ))}

          {/* Earnings Section */}
          <View style={[styles.sectionHeader, { marginTop: 20 }]}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Earnings</Text>
            <TouchableOpacity><Text style={styles.viewAllText}>View all</Text></TouchableOpacity>
          </View>
          <View style={[styles.earningsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.earningsHeader}>
              <View>
                <Text style={[styles.earningsSubtitle, { color: theme.subText }]}>Last 7 days</Text>
                <Text style={[styles.earningsAmount, { color: theme.text }]}>₦42,000 earned</Text>
              </View>
              <View style={styles.growthBadge}>
                <Ionicons name="trending-up" size={12} color="#27AE60" />
                <Text style={styles.growthText}>+12%</Text>
              </View>
            </View>

            <View style={styles.chartContainer}>
              {[25, 40, 30, 70, 20, 55, 45].map((h, i) => (
                <View key={i} style={styles.chartBarCol}>
                  <View style={[styles.chartBar, { height: h, backgroundColor: h > 60 ? '#FF8C00' : '#FFDAB9' }]} />
                  <Text style={styles.chartBarLabel}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal for Order Detail */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          {selectedOrder && (
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>

              <Text style={[styles.modalOrderId, { color: theme.text }]}>{selectedOrder.id}</Text>
              <Text style={styles.modalOrderTime}>3min ago</Text>

              <View style={styles.customerInfoBlock}>
                <Text style={[styles.modalCustomerName, { color: theme.text }]}>{selectedOrder.customer}</Text>
                <Text style={styles.modalCustomerPhone}>+2340905838929</Text>
                <Text style={[styles.modalCustomerAddress, { color: theme.subText }]}>12 Marina Road, Lagos</Text>
              </View>

              <Text style={styles.modalItemsTitle}>ORDER ITEMS</Text>
              <View style={styles.modalItemsList}>
                <View style={styles.modalItemRow}>
                  <Text style={[styles.modalItemLabel, { color: theme.text }]}>Jollof Rice x 2</Text>
                  <Text style={[styles.modalItemPrice, { color: theme.text }]}>₦6,000</Text>
                </View>
                <View style={styles.modalItemRow}>
                  <Text style={[styles.modalItemLabel, { color: theme.text }]}>Egusi Soup x 1</Text>
                  <Text style={[styles.modalItemPrice, { color: theme.text }]}>₦3,800</Text>
                </View>
                <View style={[styles.modalItemRow, { borderTopWidth: 1, borderColor: theme.border, paddingTop: 10, marginTop: 4 }]}>
                  <Text style={[styles.modalTotalLabel, { color: theme.text }]}>Total</Text>
                  <Text style={[styles.modalTotalPrice, { color: theme.text }]}>₦9,800</Text>
                </View>
              </View>

              <View style={[styles.specialInstructionsBox, { backgroundColor: isDarkMode ? '#2A2610' : '#FFFBE6', borderColor: isDarkMode ? '#4D441D' : '#FFE58F' }]}>
                <Text style={styles.specialInstructionsHeader}>SPECIAL INSTRUCTIONS</Text>
                <Text style={[styles.specialInstructionsText, { color: theme.text }]}>Extra spicy please</Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.acceptOrderBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.acceptOrderBtnText}>Accept order</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectOrderBtn} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.rejectOrderBtnText, { color: theme.subText }]}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDFDFD' },
  pendingBanner: {
    backgroundColor: '#FF8C00',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pendingText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  scroll: { flex: 1 },
  headerContainer: {
    backgroundColor: '#FF8C00',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%', borderRadius: 22 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  welcomeText: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  businessNameHeader: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 5, // Extra breathing room inside the curve
  },
  storeCardLeft: { flexDirection: 'row', alignItems: 'center' },
  powerIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeOpenText: { fontWeight: 'bold', fontSize: 15, color: '#1a1a1a' },
  storeSubText: { color: '#888', fontSize: 12 },
  contentBody: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  statLabel: { fontSize: 12, color: '#888' },
  revenueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  revenueLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  deliveredCount: { fontSize: 12, color: '#27AE60', fontWeight: '600' },
  revenueValue: { fontSize: 32, fontWeight: '800', color: '#000', marginBottom: 20 },
  warningCard: {
    backgroundColor: '#FFF9F0',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFECCF',
    marginBottom: 24,
  },
  warningIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningTitle: { fontSize: 14, fontWeight: '700', color: '#FF8C00' },
  warningSubText: { fontSize: 12, color: '#888' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  viewAllText: { color: '#FF8C00', fontSize: 13, fontWeight: '600' },
  orderRow: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  orderMainInfo: { gap: 4 },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderIdText: { fontWeight: 'bold', fontSize: 14, color: '#1a1a1a' },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusBadgeText: { fontSize: 9, fontWeight: '800' },
  orderCustomerText: { color: '#888', fontSize: 12 },
  orderRightSide: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderAmountText: { fontWeight: 'bold', fontSize: 15, color: '#1a1a1a' },
  earningsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 100,
  },
  earningsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  earningsSubtitle: { fontSize: 12, color: '#888' },
  earningsAmount: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2,
  },
  growthText: { color: '#27AE60', fontSize: 11, fontWeight: 'bold' },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 80 },
  chartBarCol: { alignItems: 'center', flex: 1 },
  chartBar: { width: 22, borderRadius: 4, marginBottom: 6 },
  chartBarLabel: { fontSize: 10, color: '#AAA' },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowRadius: 20, shadowOpacity: 0.2, elevation: 10 },
  modalCloseBtn: {
    alignSelf: 'flex-end',
    marginBottom: -10,
    padding: 10, // Added padding for better hit area
  },
  modalOrderId: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a' },
  modalOrderTime: { textAlign: 'center', color: '#888', fontSize: 12, marginBottom: 24 },
  customerInfoBlock: { marginBottom: 24 },
  modalCustomerName: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  modalCustomerPhone: { color: '#FF8C00', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  modalCustomerAddress: { color: '#666', fontSize: 14 },
  modalItemsTitle: { fontSize: 12, color: '#AAA', fontWeight: '700', marginBottom: 12, letterSpacing: 0.5 },
  modalItemsList: { marginBottom: 20 },
  modalItemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  modalItemLabel: { fontSize: 15, color: '#1a1a1a' },
  modalItemPrice: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  modalTotalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
  modalTotalPrice: { fontSize: 18, fontWeight: '900', color: '#000' },
  specialInstructionsBox: { backgroundColor: '#FFFBE6', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderColor: '#FFE58F', marginBottom: 24 },
  specialInstructionsHeader: { fontSize: 10, color: '#B88B00', fontWeight: '800', marginBottom: 4 },
  specialInstructionsText: { fontSize: 14, color: '#1a1a1a', fontWeight: '500' },
  modalActions: { gap: 12 },
  acceptOrderBtn: { backgroundColor: '#FF8C00', borderRadius: 14, padding: 18, alignItems: 'center' },
  acceptOrderBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  rejectOrderBtn: { padding: 14, alignItems: 'center' },
  rejectOrderBtnText: { color: '#666', fontSize: 15, fontWeight: '600' },
});

export default VendorHomeScreen;
