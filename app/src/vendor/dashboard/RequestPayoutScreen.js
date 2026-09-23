import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { requestVendorPayout } from '../../services/api';

const useCountdown = (targetDateStr) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!targetDateStr) return null;
    const diff = new Date(targetDateStr).getTime() - Date.now();
    return Math.max(0, diff);
  });

  useEffect(() => {
    if (!targetDateStr) return;
    const calculate = () => {
      const diff = new Date(targetDateStr).getTime() - Date.now();
      setTimeLeft(Math.max(0, diff));
    };
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  if (timeLeft === null) return { hours: '00', minutes: '00', seconds: '00', days: 0, isFinished: true };

  const totalSeconds = Math.floor(timeLeft / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    timeLeft,
    days,
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    isFinished: timeLeft <= 0,
  };
};

const RequestPayoutScreen = ({ navigation, route }) => {
  const { availableBalance = 248500, payoutAccount, activeQueuedPayout } = route?.params || {};
  const [currentBalance, setCurrentBalance] = useState(availableBalance);
  const [activePayout, setActivePayout] = useState(activeQueuedPayout || null);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const countdown = useCountdown(activePayout?.scheduledFor);

  const hasValidAccount = Boolean(
    payoutAccount?.accountNumber && String(payoutAccount.accountNumber).trim().length >= 10
  );

  const bankName = hasValidAccount ? (payoutAccount.bank || 'Bank Account') : 'No Bank Account Set';
  const acctNum = hasValidAccount ? payoutAccount.accountNumber : 'Please set up your payout bank account';
  const acctName = hasValidAccount ? (payoutAccount.accountName || '') : 'Tap here to add your bank details';

  const handleConfirm = async () => {
    if (!hasValidAccount) {
      Alert.alert(
        'Payout Account Required',
        'Please set up your bank account details before requesting a payout.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Set Up Account',
            onPress: () => navigation.navigate('PayoutAccount')
          }
        ]
      );
      return;
    }

    const value = parseFloat(amount);
    if (!amount || isNaN(value) || value < 1000) {
      Alert.alert('Invalid Amount', 'Minimum payout is ₦1,000.');
      return;
    }
    if (value > currentBalance) {
      Alert.alert('Insufficient Balance', `Your available balance is ₦${currentBalance.toLocaleString()}.`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await requestVendorPayout(value);
      if (result.success) {
        const newPayout = result.data?.payout || result.data || {};
        const scheduledFor = result.data?.scheduledFor || newPayout.scheduledFor;
        const estimatedLandingTime = result.data?.estimatedLandingTime || newPayout.estimatedLandingTime || 'Tonight at 11:00 PM WAT';
        const newBalance = result.data?.availableBalance ?? Math.max(0, currentBalance - value);

        setCurrentBalance(newBalance);
        setActivePayout({
          ...newPayout,
          amount: value,
          scheduledFor,
          estimatedLandingTime,
        });
        setAmount('');

        Alert.alert(
          'Payout Initiated ⏳',
          `₦${value.toLocaleString()} has been queued. Funds will land in your bank account ${estimatedLandingTime.toLowerCase()} when the countdown finishes.`
        );
      } else {
        Alert.alert('Request Failed', result.error || 'Unable to submit payout request.');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Unable to submit payout request.';
      Alert.alert('Payout Failed', errorMsg);
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
        <Text style={styles.headerTitle}>Request Payout</Text>
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

          {/* ── Active Queued Payout Timer Card ── */}
          {activePayout && (
            <View style={styles.timerCard}>
              <View style={styles.timerBadgeRow}>
                <View style={styles.timerBadge}>
                  <Ionicons name="time" size={14} color="#FF8C00" />
                  <Text style={styles.timerBadgeText}>Payout Initiated</Text>
                </View>
                <Text style={styles.timerStatusSub}>Settles Nightly (WAT)</Text>
              </View>

              <Text style={styles.timerCardTitle}>Landing in Your Account</Text>
              <Text style={styles.timerCardAmount}>
                ₦{Number(activePayout.amount || 0).toLocaleString()}
              </Text>
              <Text style={styles.timerCardSub}>
                Scheduled for {activePayout.estimatedLandingTime || 'Tonight at 11:00 PM WAT'}
              </Text>

              {/* Countdown Digits */}
              <View style={styles.digitsRow}>
                <View style={styles.digitBox}>
                  <Text style={styles.digitNum}>{countdown.hours}</Text>
                  <Text style={styles.digitLabel}>Hours</Text>
                </View>
                <Text style={styles.digitColon}>:</Text>
                <View style={styles.digitBox}>
                  <Text style={styles.digitNum}>{countdown.minutes}</Text>
                  <Text style={styles.digitLabel}>Minutes</Text>
                </View>
                <Text style={styles.digitColon}>:</Text>
                <View style={styles.digitBox}>
                  <Text style={styles.digitNum}>{countdown.seconds}</Text>
                  <Text style={styles.digitLabel}>Seconds</Text>
                </View>
              </View>

              <View style={styles.timerFootnote}>
                <Ionicons name="shield-checkmark" size={15} color="#10B981" />
                <Text style={styles.timerFootnoteText} numberOfLines={1} ellipsizeMode="tail">
                  Reserved for {bankName} ({acctNum})
                </Text>
              </View>
            </View>
          )}

          {/* ── Payout Form Card ── */}
          <View style={styles.formCard}>
            {/* Title */}
            <Text style={styles.title}>
              {activePayout ? 'Initiate Additional Payout' : 'Initiate Payout'}
            </Text>
            <Text style={styles.subtitle}>
              Vendor payouts automatically settle nightly at 11:00 PM WAT
            </Text>

            {/* Bank Info Box */}
            <TouchableOpacity 
              style={[styles.bankBox, !hasValidAccount && { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }]}
              onPress={() => navigation.navigate('PayoutAccount')}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.bankLabel, !hasValidAccount && { color: '#EF4444' }]}>
                  {hasValidAccount ? 'Payout destination' : '⚠️ Action Required'}
                </Text>
                <Text style={{ fontSize: 11, color: '#FF8C00', fontWeight: '700' }}>
                  {hasValidAccount ? 'Change' : 'Configure Account'}
                </Text>
              </View>
              <Text style={[styles.bankName, !hasValidAccount && { color: '#DC2626' }]} numberOfLines={1} ellipsizeMode="tail">
                {bankName}
              </Text>
              <Text style={[styles.bankMeta, !hasValidAccount && { color: '#991B1B' }]} numberOfLines={1} ellipsizeMode="tail">
                {acctNum}{acctName ? ` | ${acctName}` : ''}
              </Text>
            </TouchableOpacity>

            {/* Amount */}
            <Text style={styles.amountLabel}>Amount (₦)</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={amount}
              placeholder="Enter amount"
              placeholderTextColor="#94A3B8"
              onChangeText={setAmount}
            />
            <Text style={styles.balanceHint}>
              Available balance: ₦{currentBalance.toLocaleString()}
            </Text>

            {/* Quick Select Chips */}
            <View style={styles.quickSelect}>
              {['5000', '10000', '50000', 'All'].map(val => (
                <TouchableOpacity
                  key={val}
                  style={styles.chip}
                  onPress={() => {
                    if (val === 'All') setAmount(String(currentBalance || ''));
                    else setAmount(val);
                  }}
                >
                  <Text style={styles.chipText}>
                    {val === 'All' ? 'Max' : `₦${parseInt(val).toLocaleString()}`}
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
                {submitting ? 'Initiating Payout...' : 'Initiate Payout'}
              </Text>
            </TouchableOpacity>

            <View style={styles.infoNotice}>
              <Ionicons name="information-circle-outline" size={16} color="#64748B" />
              <Text style={styles.infoNoticeText}>
                When initiated, a live countdown will track your payout until it lands in your bank account tonight at 11:00 PM WAT.
              </Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },

  scroll: { padding: 16, paddingBottom: 40 },

  // ── Active Timer Card ──
  timerCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  timerBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 140, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  timerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF8C00',
  },
  timerStatusSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  timerCardTitle: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  timerCardAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  timerCardSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 16,
  },
  digitsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  digitBox: {
    alignItems: 'center',
    minWidth: 64,
  },
  digitNum: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FF8C00',
    letterSpacing: 1,
  },
  digitLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  digitColon: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF8C00',
    marginHorizontal: 8,
    marginBottom: 12,
  },
  timerFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  timerFootnoteText: {
    fontSize: 12,
    color: '#E2E8F0',
    flex: 1,
  },

  // ── Form Card ──
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: { fontSize: 16, fontWeight: '700', color: '#0F172A', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#64748B', textAlign: 'center', marginBottom: 20 },

  bankBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bankLabel: { fontSize: 11, color: '#64748B', marginBottom: 3, fontWeight: '500' },
  bankName: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  bankMeta: { fontSize: 12, color: '#64748B' },

  amountLabel: { fontSize: 13, fontWeight: '600', color: '#0F172A', marginBottom: 8 },
  amountInput: {
    borderWidth: 1.5,
    borderColor: '#FF8C00',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 6,
    backgroundColor: '#FFF',
  },
  balanceHint: { fontSize: 12, color: '#64748B', marginBottom: 16 },
  quickSelect: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    flex: 1,
    paddingVertical: 9,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },

  confirmBtn: {
    backgroundColor: '#FF8C00',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#FF8C00',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  confirmBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  infoNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoNoticeText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    flex: 1,
  },
});

export default RequestPayoutScreen;
