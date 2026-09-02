import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { requestVendorPayout } from '../../services/api';

const RequestPayoutScreen = ({ navigation, route }) => {
  const { availableBalance = 248500, payoutAccount } = route?.params || {};
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const bankName = payoutAccount?.bank || 'GTBank';
  const acctNum = payoutAccount?.accountNumber || '0123456789';
  const acctName = payoutAccount?.accountName || "Mama's kitchen ltd";

  const handleConfirm = async () => {
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
    try {
      const result = await requestVendorPayout(value);
      if (result.success) {
        Alert.alert(
          'Request Submitted',
          'Your payout request is being processed. Funds will arrive within 24h.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Request Failed', result.error || 'Unable to submit payout request.');
      }
    } catch (error) {
      Alert.alert('Request Failed', error.response?.data?.error || 'Unable to submit payout request.');
    } finally {
      setSubmitting(false);
    }
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
              <Text style={styles.bankName} numberOfLines={1} ellipsizeMode="tail">{bankName}</Text>
              <Text style={styles.bankMeta} numberOfLines={1} ellipsizeMode="tail">{acctNum} | {acctName}</Text>
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

            {/* Quick Select Chips */}
            <View style={styles.quickSelect}>
              {['5000', '10000', '50000', 'All'].map(val => (
                <TouchableOpacity
                  key={val}
                  style={styles.chip}
                  onPress={() => {
                    if (val === 'All') setAmount(String(availableBalance || ''));
                    else setAmount(val);
                  }}
                >
                  <Text style={styles.chipText}>
                    {val === 'All' ? 'All' : `₦${parseInt(val).toLocaleString()}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Confirm */}
            <TouchableOpacity
              style={[styles.confirmBtn, submitting && { opacity: 0.7 }]}
              onPress={handleConfirm}
              disabled={submitting}
            >
              <Text style={styles.confirmBtnText}>
                {submitting ? 'Processing Payout...' : 'Confirm Payout'}
              </Text>
            </TouchableOpacity>
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
  balanceHint: { fontSize: 11, color: '#BBB', marginBottom: 16 },
  quickSelect: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },

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
