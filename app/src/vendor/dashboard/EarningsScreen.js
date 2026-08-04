import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getVendorDashboardData, getVendorTransactions } from '../../services/api';

const EarningsScreen = ({ navigation }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('weekly');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboard = await getVendorDashboardData();
        if (dashboard.success) setData(dashboard.data);
      } catch (error) {
        console.error('Failed to load earnings data', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTransactions = async () => {
      try {
        const result = await getVendorTransactions();
        if (result.success) {
          setTransactions(result.data || []);
        }
      } catch (error) {
        console.error('Failed to load payout history', error);
      }
    };

    fetchData();
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#888', fontSize: 14 }}>Failed to load data.</Text>
      </SafeAreaView>
    );
  }

  const barDays = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
  const barHeights = data.barData || [25000, 30000, 28000, 18000, 35000, 28000, 31000];
  const maxBar = Math.max(...barHeights, 1);

  const availableBalance = data.earnings?.availableBalance || 248500;
  const weeklyRevenue = data.earnings?.weeklyRevenue || 289000;
  const totalOrders = data.earnings?.totalOrders || 97;
  const avgOrders = data.earnings?.avgOrders || 2979;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Earnings</Text>
          <Text style={styles.headerSub}>Track your income</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Orange Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available balance</Text>
          <Text style={styles.balanceAmount}>₦{availableBalance.toLocaleString()}</Text>
          <Text style={styles.balanceMeta}>Min payout ₦5,000 | Settles in 24h</Text>
          <TouchableOpacity
            style={styles.payoutBtn}
            onPress={() => navigation.navigate('RequestPayout', {
              availableBalance,
              payoutAccount: data.payoutAccount,
            })}
          >
            <Text style={styles.payoutBtnText}>Request payout</Text>
          </TouchableOpacity>
        </View>

        {/* Stat Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="pulse-outline" size={16} color="#FF8C00" />
            <Text style={styles.statValue}>₦{(weeklyRevenue / 1000).toFixed(1)}K</Text>
            <Text style={styles.statLabel}>Weekly revenue</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={16} color="#FF8C00" />
            <Text style={styles.statValue}>{totalOrders}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="wallet-outline" size={16} color="#FF8C00" />
            <Text style={styles.statValue}>₦{avgOrders.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Avg. orders</Text>
          </View>
        </View>

        {/* Income Card */}
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>Income</Text>
            <View style={styles.chartToggle}>
              <TouchableOpacity
                style={activeTab === 'weekly' ? styles.toggleActiveBtn : styles.toggleInactiveBtn}
                onPress={() => setActiveTab('weekly')}
              >
                <Text style={activeTab === 'weekly' ? styles.toggleActiveText : styles.toggleInactiveText}>Weekly</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={activeTab === 'payouts' ? styles.toggleActiveBtn : styles.toggleInactiveBtn}
                onPress={() => setActiveTab('payouts')}
              >
                <Text style={activeTab === 'payouts' ? styles.toggleActiveText : styles.toggleInactiveText}>payouts</Text>
              </TouchableOpacity>
            </View>
          </View>

          {activeTab === 'weekly' ? (
            <>
              {/* Bar Chart */}
              <View style={styles.chartWrap}>
                <View style={styles.yAxis}>
                  {['40k', '30k', '20k', '10k', '0k'].map(l => (
                    <Text key={l} style={styles.yLabel}>{l}</Text>
                  ))}
                </View>
                <View style={styles.barsWrap}>
                  {barHeights.map((h, i) => (
                    <View key={i} style={styles.barCol}>
                      <View
                        style={[
                          styles.bar,
                          { height: Math.max(4, (h / maxBar) * 110) },
                          i === 2 ? styles.barActive : styles.barNormal,
                        ]}
                      />
                      <Text style={[styles.barLabel, i === 2 && styles.barLabelActive]}>
                        {barDays[i]}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Period Totals */}
              <View style={styles.periodRow}>
                {[
                  { label: 'THIS WEEK', value: `₦${(data.earnings?.weeklyRevenue || 0).toLocaleString()}` },
                  { label: 'THIS MONTH', value: `₦${(data.earnings?.monthlyRevenue || 0).toLocaleString()}` },
                  { label: 'TODAY', value: `₦${(data.earnings?.todayRevenue || 0).toLocaleString()}` },
                ].map((p, i) => (
                  <View key={p.label} style={[styles.periodItem, i === 1 && styles.periodItemMid]}>
                    <Text style={styles.periodLabel}>{p.label}</Text>
                    <Text style={styles.periodValue}>{p.value}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <>
              {/* Payouts List */}
              {transactions.length === 0 ? (
                <View style={styles.emptyPayoutList}>
                  <Text style={styles.emptyPayoutTitle}>No payout records yet</Text>
                  <Text style={styles.emptyPayoutText}>Your payout history will appear once requests are processed.</Text>
                </View>
              ) : (
                transactions.map((payout, idx) => (
                  <View key={payout._id || idx} style={[styles.payoutHistoryRow, idx === transactions.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={styles.payoutHistoryIcon}>
                      <Ionicons name="download-outline" size={16} color="#27AE60" />
                    </View>
                    <View style={styles.payoutHistoryInfo}>
                      <Text style={styles.payoutHistoryId}>{payout.reference || payout._id || `PAYOUT-${idx + 1}`}</Text>
                      <Text style={styles.payoutHistoryMeta}>{new Date(payout.createdAt || payout.date || Date.now()).toLocaleDateString()} | {payout.method || 'Bank Transfer'}</Text>
                    </View>
                    <View style={styles.payoutHistoryRight}>
                      <Text style={styles.payoutHistoryAmount}>₦{(payout.amount || 0).toLocaleString()}</Text>
                      <Text style={styles.payoutHistoryStatus}>{payout.status || 'Pending'}</Text>
                    </View>
                  </View>
                ))}
                {[
                  { label: 'THIS WEEK', value: '₦42,000' },
                  { label: 'THIS MONTH', value: '₦152,000' },
                  { label: 'TODAY', value: '₦8,500' },
                ].map((p, i) => (
                  <View key={p.label} style={[styles.periodItem, i === 1 && styles.periodItemMid]}>
                    <Text style={styles.periodLabel}>{p.label}</Text>
                    <Text style={styles.periodValue}>{p.value}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Daily Breakdown */}
        <View style={[styles.card, { marginBottom: 30 }]}>
          <Text style={styles.cardTitle}>Daily breakdown</Text>
          {[
            { day: 'Monday',    orders: data.dailyBreakdown?.[0]?.orders ?? 8,  amount: data.dailyBreakdown?.[0]?.amount ?? 24000 },
            { day: 'Tuesday',   orders: data.dailyBreakdown?.[1]?.orders ?? 11, amount: data.dailyBreakdown?.[1]?.amount ?? 32000 },
            { day: 'Wednesday', orders: data.dailyBreakdown?.[2]?.orders ?? 9,  amount: data.dailyBreakdown?.[2]?.amount ?? 28000 },
            { day: 'Thursday',  orders: data.dailyBreakdown?.[3]?.orders ?? 14, amount: data.dailyBreakdown?.[3]?.amount ?? 41000 },
            { day: 'Friday',    orders: data.dailyBreakdown?.[4]?.orders ?? 19, amount: data.dailyBreakdown?.[4]?.amount ?? 56000 },
            { day: 'Saturday',  orders: data.dailyBreakdown?.[5]?.orders ?? 23, amount: data.dailyBreakdown?.[5]?.amount ?? 68000 },
            { day: 'Sunday',    orders: data.dailyBreakdown?.[6]?.orders ?? 13, amount: data.dailyBreakdown?.[6]?.amount ?? 38000 },
          ].map((b, idx, arr) => (
            <View key={b.day} style={[styles.breakdownRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.breakdownDay}>{b.day}</Text>
              <Text style={styles.breakdownOrders}>{b.orders} orders</Text>
              <Text style={styles.breakdownAmount}>₦{b.amount.toLocaleString()}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F6F6' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  backBtn: { padding: 4, marginRight: 10 },
  headerTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  headerSub: { fontSize: 11, color: '#AAA', marginTop: 1 },

  scroll: { paddingBottom: 90 },

  // Balance Card
  balanceCard: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 22,
    marginBottom: 14,
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 20,
  },
  balanceLabel: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  balanceAmount: { fontSize: 30, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  balanceMeta: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 16 },
  payoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  payoutBtnText: { color: '#FF8C00', fontSize: 13, fontWeight: '600' },

  // Stat Row
  statsRow: { flexDirection: 'row', paddingHorizontal: 14, gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    gap: 4,
  },
  statValue: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', marginTop: 2 },
  statLabel: { fontSize: 10, color: '#AAA', textAlign: 'center' },

  // Card
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 14,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 14 },

  // Chart Toggle
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  chartToggle: { flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 8, padding: 3 },
  toggleActiveBtn: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    elevation: 1,
  },
  toggleActiveText: { fontSize: 11, fontWeight: '700', color: '#333' },
  toggleInactiveBtn: { paddingHorizontal: 12, paddingVertical: 4 },
  toggleInactiveText: { fontSize: 11, color: '#AAA', fontWeight: '500' },

  // Chart
  chartWrap: { flexDirection: 'row', height: 150, marginBottom: 14 },
  yAxis: { justifyContent: 'space-between', marginRight: 6, paddingBottom: 18 },
  yLabel: { fontSize: 9, color: '#CCC' },
  barsWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 18,
  },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { width: 18, borderRadius: 5, marginBottom: 4 },
  barNormal: { backgroundColor: '#FFE5C8' },
  barActive: { backgroundColor: '#FF8C00' },
  barLabel: { fontSize: 9, color: '#BBB' },
  barLabelActive: { fontWeight: '700', color: '#333' },

  // Period
  periodRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#F5F5F5',
    paddingTop: 14,
  },
  periodItem: { flex: 1, alignItems: 'flex-start' },
  periodItemMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#F0F0F0', paddingHorizontal: 10 },
  periodLabel: { fontSize: 9, color: '#BBB', fontWeight: '600', letterSpacing: 0.5 },
  periodValue: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginTop: 3 },

  // Payouts History
  payoutHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F8F8F8',
    gap: 10,
  },
  payoutHistoryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAFAF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutHistoryInfo: { flex: 1 },
  payoutHistoryId: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  payoutHistoryMeta: { fontSize: 10, color: '#BBB', marginTop: 2 },
  payoutHistoryRight: { alignItems: 'flex-end' },
  payoutHistoryAmount: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  payoutHistoryStatus: { fontSize: 10, color: '#27AE60', marginTop: 2, fontWeight: '500' },

  // Breakdown
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderColor: '#F8F8F8',
  },
  breakdownDay: { fontSize: 13, color: '#555', flex: 1, fontWeight: '500' },
  breakdownOrders: { fontSize: 11, color: '#BBB', textAlign: 'center', flex: 1 },
  breakdownAmount: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', flex: 1, textAlign: 'right' },

  // Payout Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
  },
  modalClose: { position: 'absolute', top: 16, right: 16, padding: 4, zIndex: 10 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginBottom: 4 },
  modalSub: { fontSize: 12, color: '#AAA', textAlign: 'center', marginBottom: 20 },
  bankBox: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
  bankLabel: { fontSize: 11, color: '#AAA', marginBottom: 4 },
  bankName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  bankMeta: { fontSize: 11, color: '#888', marginTop: 2 },
  amountLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8 },
  amountInput: {
    borderWidth: 1.5,
    borderColor: '#FF8C00',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 6,
  },
  balanceHint: { fontSize: 11, color: '#AAA', marginBottom: 20 },
  confirmBtn: {
    backgroundColor: '#FF8C00',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  cancelModalBtn: { padding: 12, alignItems: 'center' },
  cancelModalText: { color: '#555', fontSize: 14, fontWeight: '500' },
});

export default EarningsScreen;
