import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { getVendorDashboardData } from '../../services/api';

const EarningsScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getVendorDashboardData();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Failed to load data.</Text>
      </SafeAreaView>
    );
  }

  const barDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxBar = Math.max(...data.barData);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Ionicons name="arrow-back" size={22} color="#000" />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.topTitle}>Earnings</Text>
          <Text style={styles.topSub}>Track your income</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available balance</Text>
          <Text style={styles.balanceAmount}>₦{data.earnings.availableBalance.toLocaleString()}</Text>
          <Text style={styles.balanceSub}>Min payout ₦5,000 | Settles in 24h</Text>
          <TouchableOpacity style={styles.payoutBtn}>
            <Ionicons name="download-outline" size={16} color={Colors.primary} />
            <Text style={styles.payoutBtnText}>Request payout</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: 'pulse-outline', value: `₦${(data.earnings.weeklyRevenue / 1000).toFixed(1)}K`, label: 'Weekly revenue' },
            { icon: 'calendar-outline', value: data.earnings.totalOrders.toString(), label: 'Orders' },
            { icon: 'tablet-portrait-outline', value: `₦${data.earnings.avgOrders.toLocaleString()}`, label: 'Avg. orders' },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon} size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Income</Text>
            <View style={styles.chartTabs}>
              <TouchableOpacity style={styles.chartTabActive}><Text style={styles.chartTabActiveText}>Weekly</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.chartTabText}>payouts</Text></TouchableOpacity>
            </View>
          </View>
          {/* Y-axis labels */}
          <View style={styles.chartArea}>
            <View style={styles.yLabels}>
              {['40k', '30k', '20k', '10k', '0k'].map(l => (
                <Text key={l} style={styles.yLabel}>{l}</Text>
              ))}
            </View>
            <View style={styles.bars}>
              {data.barData.map((h, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={[styles.bar, {
                    height: maxBar > 0 ? (h / maxBar) * 100 : 0,
                    backgroundColor: i === 2 ? Colors.primary : '#FFDBB5',
                  }]} />
                  <Text style={[styles.barLabel, i === 2 && { fontWeight: 'bold' }]}>{barDays[i]}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Period totals */}
          <View style={styles.periodRow}>
            {[{ label: 'THIS WEEK', value: '₦42,000' }, { label: 'THIS MONTH', value: '₦152,000' }, { label: 'TODAY', value: '₦8,500' }].map(p => (
              <View key={p.label} style={styles.periodItem}>
                <Text style={styles.periodLabel}>{p.label}</Text>
                <Text style={styles.periodValue}>{p.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Daily Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Daily breakdown</Text>
          {data.dailyBreakdown.map((b) => (
            <View key={b.day} style={styles.breakdownRow}>
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
  safeArea: { flex: 1, backgroundColor: '#F7F7F7' },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#EEE' },
  topTitle: { fontSize: 18, fontWeight: 'bold' },
  topSub: { fontSize: 12, color: '#888' },
  scroll: { padding: 16, paddingBottom: 100 },
  balanceCard: { backgroundColor: Colors.primary, borderRadius: 16, padding: 24, marginBottom: 20 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 4 },
  balanceAmount: { color: '#fff', fontSize: 34, fontWeight: 'bold', marginBottom: 4 },
  balanceSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginBottom: 16 },
  payoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'flex-start', gap: 8 },
  payoutBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', elevation: 1 },
  statValue: { fontSize: 16, fontWeight: 'bold', marginTop: 6 },
  statLabel: { fontSize: 11, color: '#888', textAlign: 'center' },
  chartCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 1 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  chartTitle: { fontSize: 18, fontWeight: 'bold' },
  chartTabs: { flexDirection: 'row', gap: 8 },
  chartTabActive: { backgroundColor: '#EEE', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  chartTabActiveText: { fontSize: 12, fontWeight: '600' },
  chartTabText: { fontSize: 12, color: '#888', paddingHorizontal: 10, paddingVertical: 4 },
  chartArea: { flexDirection: 'row', height: 120, marginBottom: 16 },
  yLabels: { justifyContent: 'space-between', marginRight: 8, paddingBottom: 20 },
  yLabel: { fontSize: 10, color: '#bbb' },
  bars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { width: 24, borderRadius: 4, marginBottom: 4 },
  barLabel: { fontSize: 10, color: '#888' },
  periodRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#EEE', paddingTop: 16 },
  periodItem: { alignItems: 'center' },
  periodLabel: { fontSize: 10, color: '#888', fontWeight: '600' },
  periodValue: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  breakdownCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 1 },
  breakdownTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#F5F5F5' },
  breakdownDay: { fontSize: 14, color: '#333', flex: 1 },
  breakdownOrders: { fontSize: 12, color: '#888', flex: 1, textAlign: 'center' },
  breakdownAmount: { fontSize: 14, fontWeight: 'bold', flex: 1, textAlign: 'right' },
});

export default EarningsScreen;
