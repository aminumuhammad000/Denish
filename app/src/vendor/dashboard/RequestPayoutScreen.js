import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

const RequestPayoutScreen = ({ navigation, route }) => {
  const { availableBalance = 248500 } = route?.params || {};
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      Alert.alert('Request Submitted', 'Your payout is being processed. Funds will arrive within 24h.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Request payout</Text>
          <Text style={styles.headerSub}>Funds will be sent within 24h</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Bank Info */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Payout to</Text>
            <View style={styles.bankCard}>
              <View style={styles.bankIconWrap}>
                <Ionicons name="business-outline" size={20} color="#FF8C00" />
              </View>
              <View style={styles.bankDetails}>
                <Text style={styles.bankName}>GTBank</Text>
                <Text style={styles.bankMeta}>0123456789 | Mama's kitchen ltd</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
            </View>
          </View>

          {/* Available Balance */}
          <View style={styles.balanceBanner}>
            <Ionicons name="wallet-outline" size={16} color="#FF8C00" />
            <Text style={styles.balanceBannerText}>
              Available balance: <Text style={styles.balanceBannerAmt}>₦{availableBalance.toLocaleString()}</Text>
            </Text>
          </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Amount (₦)</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputPrefix}>₦</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#CCC"
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
            </View>
            <Text style={styles.minHint}>Minimum payout: ₦5,000</Text>
          </View>

          {/* Quick Amount Chips */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Quick select</Text>
            <View style={styles.chipsRow}>
              {QUICK_AMOUNTS.map(q => (
                <TouchableOpacity
                  key={q}
                  style={[styles.chip, amount === String(q) && styles.chipActive]}
                  onPress={() => setAmount(String(q))}
                >
                  <Text style={[styles.chipText, amount === String(q) && styles.chipTextActive]}>
                    ₦{(q / 1000).toFixed(0)}k
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Settlement Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={15} color="#FF8C00" />
              <Text style={styles.infoText}>Settlements arrive within <Text style={styles.infoBold}>24 hours</Text></Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark-outline" size={15} color="#FF8C00" />
              <Text style={styles.infoText}>Payouts are processed <Text style={styles.infoBold}>Monday – Friday</Text></Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="alert-circle-outline" size={15} color="#FF8C00" />
              <Text style={styles.infoText}>Payout requests submitted after 5pm are processed <Text style={styles.infoBold}>next business day</Text></Text>
            </View>
          </View>

          {/* Summary Row */}
          {!!amount && !isNaN(parseFloat(amount)) && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Payout amount</Text>
                <Text style={styles.summaryValue}>₦{parseFloat(amount || 0).toLocaleString()}</Text>
              </View>
              <View style={[styles.summaryRow, { marginTop: 6 }]}>
                <Text style={styles.summaryLabel}>Balance after</Text>
                <Text style={styles.summaryValue}>
                  ₦{Math.max(0, availableBalance - parseFloat(amount || 0)).toLocaleString()}
                </Text>
              </View>
            </View>
          )}

        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.confirmBtn, (!amount || submitting) && { opacity: 0.6 }]}
            onPress={handleConfirm}
            disabled={!amount || submitting}
          >
            <Text style={styles.confirmBtnText}>
              {submitting ? 'Processing...' : 'Confirm'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F6F6' },

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
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  headerSub: { fontSize: 11, color: '#AAA', marginTop: 1 },

  scroll: { padding: 16, paddingBottom: 20 },

  // Section
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 8 },

  // Bank Card
  bankCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    gap: 12,
  },
  bankIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankDetails: { flex: 1 },
  bankName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  bankMeta: { fontSize: 11, color: '#AAA', marginTop: 2 },

  // Balance Banner
  balanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  balanceBannerText: { fontSize: 12, color: '#888' },
  balanceBannerAmt: { fontWeight: '700', color: '#FF8C00' },

  // Amount Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#FF8C00',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputPrefix: { fontSize: 18, color: '#CCC', marginRight: 4 },
  amountInput: { flex: 1, fontSize: 22, fontWeight: '600', color: '#1a1a1a', paddingVertical: 14 },
  minHint: { fontSize: 11, color: '#CCC', marginTop: 6 },

  // Quick Chips
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  chipActive: { backgroundColor: '#FF8C00', borderColor: '#FF8C00' },
  chipText: { fontSize: 12, color: '#666', fontWeight: '500' },
  chipTextActive: { color: '#FFF', fontWeight: '700' },

  // Info Card
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    gap: 10,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  infoText: { fontSize: 12, color: '#888', flex: 1, lineHeight: 18 },
  infoBold: { fontWeight: '700', color: '#555' },

  // Summary Card
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 12, color: '#AAA' },
  summaryValue: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },

  // Bottom Actions
  bottomActions: {
    padding: 16,
    paddingBottom: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
  },
  confirmBtn: {
    backgroundColor: '#FF8C00',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  cancelBtn: { padding: 12, alignItems: 'center' },
  cancelBtnText: { color: '#666', fontSize: 14, fontWeight: '500' },
});

export default RequestPayoutScreen;
