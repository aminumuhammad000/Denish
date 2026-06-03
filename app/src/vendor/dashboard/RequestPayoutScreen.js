import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const PAYOUT_HISTORY = [
  { id: 'PO-1024', date: '2026-04-15', ref: 'PYT-9982', amount: 145000, status: 'Completed' },
  { id: 'PO-1024', date: '2026-04-15', ref: 'PYT-9982', amount: 145000, status: 'Completed' },
  { id: 'PO-1024', date: '2026-04-15', ref: 'PYT-9982', amount: 145000, status: 'Completed' },
  { id: 'PO-1024', date: '2026-04-15', ref: 'PYT-9982', amount: 145000, status: 'Completed' },
  { id: 'PO-1024', date: '2026-04-15', ref: 'PYT-9982', amount: 145000, status: 'Completed' },
];

const RequestPayoutScreen = ({ navigation, route }) => {
  const { availableBalance = 248500, payoutAccount } = route?.params || {};
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const bankName = payoutAccount?.bank || 'GTBank';
  const acctNum = payoutAccount?.accountNumber || '0123456789';
  const acctName = payoutAccount?.accountName || "Mama's kitchen ltd";

  const handleConfirm = () => {
    const value = parseFloat(amount);
    if (!amount || isNaN(value) || value < 5000) {
      Alert.alert('Invalid Amount', 'Minimum payout is ₦5,000.');
      return;
    }
    if (value > availableBalance) {
      Alert.alert('Insufficient Balance', `Your available balance is ₦${availableBalance.toLocaleString()}.`);
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'Request Submitted',
        'Your payout is being processed. Funds will arrive within 24h.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request payout</Text>
        <View style={{ width: 36 }} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── Payout Form Card ── */}
          <View style={styles.formCard}>

            {/* Title */}
            <Text style={styles.title}>Request payout</Text>
            <Text style={styles.subtitle}>Funds will be sent within 24h</Text>

            {/* Bank Info Box */}
            <View style={styles.bankBox}>
              <Text style={styles.bankLabel}>Payout to</Text>
              <Text style={styles.bankName}>{bankName}</Text>
              <Text style={styles.bankMeta}>{acctNum} | {acctName}</Text>
            </View>

            {/* Amount */}
            <Text style={styles.amountLabel}>Amount (N)</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
            <Text style={styles.balanceHint}>
              Available balance: N{availableBalance.toLocaleString()}
            </Text>

            {/* Confirm */}
            <TouchableOpacity
              style={[styles.confirmBtn, submitting && { opacity: 0.7 }]}
              onPress={handleConfirm}
              disabled={submitting}
            >
              <Text style={styles.confirmBtnText}>
                {submitting ? 'Processing...' : 'Confirm'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Income / Payouts History Card ── */}
          <View style={styles.incomeCard}>
            {/* Income Header */}
            <View style={styles.incomeHeader}>
              <Text style={styles.incomeTitle}>Income</Text>
              <View style={styles.toggle}>
                <View style={styles.toggleInactiveBtn}>
                  <Text style={styles.toggleInactiveText}>Weekly</Text>
                </View>
                <View style={styles.toggleActiveBtn}>
                  <Text style={styles.toggleActiveText}>payouts</Text>
                </View>
              </View>
            </View>

            {/* Payout History List */}
            {PAYOUT_HISTORY.map((payout, idx) => (
              <View
                key={idx}
                style={[
                  styles.payoutRow,
                  idx === PAYOUT_HISTORY.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.payoutIconWrap}>
                  <Ionicons name="download-outline" size={14} color="#27AE60" />
                </View>
                <View style={styles.payoutInfo}>
                  <Text style={styles.payoutId}>{payout.id}</Text>
                  <Text style={styles.payoutMeta}>{payout.date} | {payout.ref}</Text>
                </View>
                <View style={styles.payoutRight}>
                  <Text style={styles.payoutAmount}>N{payout.amount.toLocaleString()}</Text>
                  <Text style={styles.payoutStatus}>{payout.status}</Text>
                </View>
              </View>
            ))}

            {/* Period Summary */}
            <View style={styles.periodRow}>
              {[
                { label: 'THIS WEEK', value: 'N42,000' },
                { label: 'THIS MONTH', value: 'N152,000' },
                { label: 'TODAY', value: 'N8,500' },
              ].map((p, i) => (
                <View key={p.label} style={[styles.periodItem, i === 1 && styles.periodItemMid]}>
                  <Text style={styles.periodLabel}>{p.label}</Text>
                  <Text style={styles.periodValue}>{p.value}</Text>
                </View>
              ))}
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F2' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },

  scroll: { padding: 14, paddingBottom: 40 },

  // ── Form Card ──
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
  },
  title: { fontSize: 15, fontWeight: '600', color: '#888', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 12, color: '#AAA', textAlign: 'center', marginBottom: 22 },

  bankBox: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 13,
    marginBottom: 20,
  },
  bankLabel: { fontSize: 11, color: '#BBB', marginBottom: 3 },
  bankName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  bankMeta: { fontSize: 12, color: '#888' },

  amountLabel: { fontSize: 13, fontWeight: '500', color: '#333', marginBottom: 8 },
  amountInput: {
    borderWidth: 1.5,
    borderColor: '#FF8C00',
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 7,
    backgroundColor: '#FFF',
  },
  balanceHint: { fontSize: 11, color: '#BBB', marginBottom: 24 },

  confirmBtn: {
    backgroundColor: '#FF8C00',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#555', fontSize: 14, fontWeight: '500' },

  // ── Income Card ──
  incomeCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
  },
  incomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  incomeTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 3,
  },
  toggleInactiveBtn: { paddingHorizontal: 12, paddingVertical: 5 },
  toggleInactiveText: { fontSize: 11, color: '#AAA', fontWeight: '500' },
  toggleActiveBtn: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  toggleActiveText: { fontSize: 11, fontWeight: '700', color: '#333' },

  // Payout History Row
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F5F5F5',
    gap: 10,
  },
  payoutIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAFAF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutInfo: { flex: 1 },
  payoutId: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  payoutMeta: { fontSize: 10, color: '#BBB', marginTop: 2 },
  payoutRight: { alignItems: 'flex-end' },
  payoutAmount: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  payoutStatus: { fontSize: 10, color: '#27AE60', marginTop: 2, fontWeight: '500' },

  // Period Summary
  periodRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#F5F5F5',
    paddingTop: 14,
    marginTop: 8,
  },
  periodItem: { flex: 1 },
  periodItemMid: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F0F0F0',
    paddingHorizontal: 8,
  },
  periodLabel: { fontSize: 9, color: '#BBB', fontWeight: '600', letterSpacing: 0.4 },
  periodValue: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginTop: 3 },
});

export default RequestPayoutScreen;
