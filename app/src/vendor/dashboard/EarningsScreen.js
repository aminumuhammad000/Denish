import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getVendorDashboardData } from '../../services/api';

const { width } = Dimensions.get('window');

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
        <ActivityIndicator size="large" color="#FF8C00" />
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

  const barDays = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
  const barHeights = data.barData || [25, 30, 28, 18, 35, 28, 31];
  const maxBar = Math.max(...barHeights);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Earnings</Text>
          <Text style={styles.headerSubtitle}>Track your income</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Request Payout Card */}
        <View style={styles.orangeCard}>
          <TouchableOpacity style={styles.payoutButton}>
            <Ionicons name="download-outline" size={24} color="#27AE60" style={styles.payoutIcon} />
            <Text style={styles.payoutButtonText}>Request payout</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={styles.statIconCircle}>
              <Ionicons name="pulse-outline" size={18} color="#FF8C00" />
            </View>
            <Text style={styles.statValue}>N289.0K</Text>
            <Text style={styles.statLabel}>Weekly revenue</Text>
          </View>
          <View style={styles.statBox}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FFF5E9' }]}>
              <Ionicons name="calendar-outline" size={18} color="#FF8C00" />
            </View>
            <Text style={styles.statValue}>97</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statBox}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FFF5E9' }]}>
              <Ionicons name="wallet-outline" size={18} color="#FF8C00" />
            </View>
            <Text style={styles.statValue}>N2,979</Text>
            <Text style={styles.statLabel}>Avg. orders</Text>
          </View>
        </View>

        {/* Income Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Income</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity style={styles.toggleActive}>
                <Text style={styles.toggleActiveText}>Weekly</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toggleInactive}>
                <Text style={styles.toggleInactiveText}>payouts</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.chartWrapper}>
            <View style={styles.yAxis}>
              {['40k', '30k', '20k', '10k', '0K'].map((label, idx) => (
                <Text key={label} style={styles.yAxisLabel}>{label}</Text>
              ))}
            </View>
            <View style={styles.chartArea}>
              <View style={styles.gridLines}>
                {[1, 2, 3, 4, 5].map((_, i) => <View key={i} style={styles.gridLine} />)}
              </View>
              <View style={styles.barsContainer}>
                {barHeights.map((h, i) => (
                  <View key={i} style={styles.barCol}>
                    <View style={[
                      styles.bar, 
                      { height: (h / 40) * 120 },
                      i === 2 ? styles.barActive : styles.barInactive
                    ]} />
                    <Text style={[styles.barDayLabel, i === 2 && styles.barDayLabelActive]}>{barDays[i]}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.periodSummary}>
            <View style={styles.periodBox}>
              <Text style={styles.periodLabel}>THIS WEEK</Text>
              <Text style={styles.periodValue}>₦42,000</Text>
            </View>
            <View style={styles.periodBoxSeparator} />
            <View style={styles.periodBox}>
              <Text style={styles.periodLabel}>THIS MONTH</Text>
              <Text style={styles.periodValue}>₦152,000</Text>
            </View>
            <View style={styles.periodBoxSeparator} />
            <View style={styles.periodBox}>
              <Text style={styles.periodLabel}>TODAY</Text>
              <Text style={styles.periodValue}>₦8,500</Text>
            </View>
          </View>
        </View>

        {/* Daily Breakdown */}
        <View style={[styles.sectionCard, { marginBottom: 40 }]}>
          <Text style={styles.sectionTitle}>Daily breakdown</Text>
          <View style={styles.breakdownList}>
            {[
              { day: 'Monday', orders: 8, amount: '24,000' },
              { day: 'Tuesday', orders: 11, amount: '32,000' },
              { day: 'Wednesday', orders: 9, amount: '28,000' },
            ].map((item, idx) => (
              <View key={idx} style={[styles.breakdownItem, idx === 2 && { borderBottomWidth: 0 }]}>
                <Text style={styles.breakdownDayText}>{item.day}</Text>
                <View style={styles.breakdownRight}>
                  <Text style={styles.breakdownOrdersText}>{item.orders} orders</Text>
                  <Text style={styles.breakdownAmountText}>N{item.amount}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  backBtn: { padding: 4 },
  headerTextContainer: { marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  headerSubtitle: { fontSize: 12, color: '#999', marginTop: -2 },
  scroll: { paddingBottom: 100 },
  orangeCard: {
    backgroundColor: '#FF8C00',
    padding: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    marginBottom: 25,
  },
  payoutButton: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 20,
    width: '80%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  payoutIcon: { marginRight: 12, transform: [{ rotate: '180deg' }] }, // Arrow pointing down/in
  payoutButtonText: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    width: (width - 48) / 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
  statLabel: { fontSize: 11, color: '#999', marginTop: 2, textAlign: 'center' },
  sectionCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 4,
  },
  toggleActive: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 1,
  },
  toggleActiveText: { fontSize: 12, fontWeight: '700', color: '#333' },
  toggleInactive: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  toggleInactiveText: { fontSize: 12, color: '#999', fontWeight: '600' },
  chartWrapper: {
    flexDirection: 'row',
    height: 180,
    marginBottom: 20,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginRight: 10,
  },
  yAxisLabel: { fontSize: 11, color: '#BBB', fontWeight: '600' },
  chartArea: { flex: 1, position: 'relative' },
  gridLines: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#F0F0F0',
    width: '100%',
    borderStyle: 'dashed',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    zIndex: 2,
    paddingBottom: 25,
  },
  barCol: { alignItems: 'center', flex: 1 },
  bar: {
    width: 28,
    borderRadius: 6,
  },
  barInactive: { backgroundColor: '#FFF0E0' },
  barActive: { backgroundColor: '#FF8C00' },
  barDayLabel: { fontSize: 11, color: '#BBB', position: 'absolute', bottom: -22, fontWeight: '600' },
  barDayLabelActive: { color: '#333', fontWeight: '800' },
  periodSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: '#F5F5F5',
  },
  periodBox: { alignItems: 'flex-start', flex: 1 },
  periodBoxSeparator: { width: 1, height: 20, backgroundColor: '#F0F0F0', marginHorizontal: 5 },
  periodLabel: { fontSize: 10, color: '#BBB', fontWeight: '800' },
  periodValue: { fontSize: 17, fontWeight: '800', color: '#1a1a1a', marginTop: 4 },
  breakdownList: { marginTop: 10 },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: '#F5F5F5',
  },
  breakdownDayText: { fontSize: 17, color: '#666', fontWeight: '600' },
  breakdownRight: { flexDirection: 'row', alignItems: 'center' },
  breakdownOrdersText: { fontSize: 12, color: '#BBB', marginRight: 15, fontWeight: '600' },
  breakdownAmountText: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
});

export default EarningsScreen;
