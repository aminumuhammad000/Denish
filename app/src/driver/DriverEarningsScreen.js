import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const TransactionItem = ({ type, date, amount, status, isWithdrawal = false }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'reversed': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#94A3B8';
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case 'completed': return '#ECFDF5';
      case 'reversed': return '#FEF2F2';
      case 'pending': return '#FFFBEB';
      default: return '#F8FAFC';
    }
  };

  return (
    <View style={styles.transactionCard}>
      <View style={[styles.iconBox, { backgroundColor: isWithdrawal ? '#EFF6FF' : '#F0FDF4' }]}>
        <Ionicons 
          name={isWithdrawal ? "arrow-down" : (type === 'Tip' ? "gift-outline" : "wallet-outline")} 
          size={18} 
          color={isWithdrawal ? "#3B82F6" : "#10B981"} 
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionType}>{type}</Text>
        <Text style={styles.transactionDate}>{date}</Text>
      </View>
      <View style={styles.amountArea}>
        <Text style={[styles.amountText, isWithdrawal && { color: '#000' }]}>
          {isWithdrawal ? '-' : '+'}{amount}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBg() }]}>
          {status === 'completed' && <Ionicons name="checkmark" size={10} color="#10B981" style={{ marginRight: 2 }} />}
          {status === 'reversed' && <Ionicons name="close" size={10} color="#EF4444" style={{ marginRight: 2 }} />}
          {status === 'pending' && <Ionicons name="time" size={10} color="#F59E0B" style={{ marginRight: 2 }} />}
          <Text style={[styles.statusText, { color: getStatusColor() }]}>{status}</Text>
        </View>
      </View>
    </View>
  );
};

const WithdrawModal = ({ visible, onClose, balance, onWithdraw }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onWithdraw(amount);
      onClose();
      setAmount('');
    }, 2000);
  };

  const selectQuick = (val) => {
    if (val === 'All') setAmount(balance.replace('₦', '').replace(',', ''));
    else setAmount(val);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalTitleContainer}>
            <Text style={styles.modalTitle}>Withdraw earnings</Text>
            <Text style={styles.modalSubtitle}>Funds will be sent to GTBank 0219832185</Text>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.amountLabel}>Amount (₦)</Text>
            <TextInput
              style={styles.amountInput}
              placeholder={`Up to ${balance}`}
              keyboardType="number-pad"
              value={amount}
              onChangeText={setAmount}
            />

            <View style={styles.quickSelect}>
              {['5000', '10000', 'All'].map(val => (
                <TouchableOpacity key={val} style={styles.chip} onPress={() => selectQuick(val)}>
                  <Text style={styles.chipText}>{val === 'All' ? val : `₦${parseInt(val).toLocaleString()}`}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.mainWithdrawBtn} onPress={handleWithdraw} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.mainWithdrawBtnText}>Withdraw</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

import { getDriverEarnings, withdrawEarnings } from '../services/api';

const DriverEarningsScreen = ({ navigation }) => {
  const [incomeTab, setIncomeTab] = useState('Weekly');
  const [historyTab, setHistoryTab] = useState('Transactions');
  const [modalVisible, setModalVisible] = useState(false);

  const [realEarnings, setRealEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const res = await getDriverEarnings();
      if (res.success) {
        setRealEarnings(res.data);
      }
    } catch (e) {
      console.error('Fetch earnings error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawSuccess = async (amount) => {
    try {
      const numericAmt = parseFloat(amount.replace(/[^0-9.]/g, ''));
      const res = await withdrawEarnings(numericAmt);
      if (res.success) {
        Alert.alert('Withdrawal Initiated 🎉', res.message);
        fetchEarnings();
      } else {
        Alert.alert('Error', res.error || 'Withdrawal failed');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };



  // Mock data for earnings chart
  const chartDays = [
    { day: 'Mon', value: 25 },
    { day: 'Tue', value: 32 },
    { day: 'Wed', value: 28, active: true },
    { day: 'Thur', value: 18 },
    { day: 'Fri', value: 35 },
    { day: 'Sat', value: 28 },
    { day: 'Sun', value: 32 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Earnings</Text>
          <Text style={styles.headerSubtitle}>Track your income</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* BALANCE CARD */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available balance</Text>
          <Text style={styles.balanceValue}>₦{(realEarnings?.availableBalance || 0).toLocaleString()}</Text>
          <TouchableOpacity style={styles.withdrawBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="download-outline" size={20} color="#333" />
            <Text style={styles.withdrawText}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* INCOME CHART SECTION */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Income</Text>
            <View style={styles.chartToggle}>
              <TouchableOpacity 
                onPress={() => setIncomeTab('Weekly')}
                style={[styles.toggleBtn, incomeTab === 'Weekly' && styles.activeToggle]}
              >
                <Text style={[styles.toggleText, incomeTab === 'Weekly' && styles.activeToggleText]}>Weekly</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setIncomeTab('Monthly')}
                style={[styles.toggleBtn, incomeTab === 'Monthly' && styles.activeToggle]}
              >
                <Text style={[styles.toggleText, incomeTab === 'Monthly' && styles.activeToggleText]}>Monthly</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.chartContent}>
             <View style={styles.yAxis}>
                <Text style={styles.yText}>40k</Text>
                <Text style={styles.yText}>30k</Text>
                <Text style={styles.yText}>20k</Text>
                <Text style={styles.yText}>10k</Text>
                <Text style={styles.yText}>0k</Text>
             </View>
             <View style={styles.barsContainer}>
                {(realEarnings?.weeklyData || chartDays).map((item, idx) => (
                  <View key={idx} style={styles.barColumn}>
                    <View style={styles.barBg}>
                      <View style={[
                        styles.barFill, 
                        { height: `${Math.min(100, ((item.amount || item.value || 0) / 40000) * 100)}%` },
                        item.active && styles.barFillActive
                      ]} />
                    </View>
                    <Text style={[styles.barLabel, item.active && styles.barLabelActive]}>{item.day}</Text>
                  </View>
                ))}
             </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>THIS WEEK</Text>
              <Text style={styles.summaryValue}>₦{(realEarnings?.weekEarned || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>THIS MONTH</Text>
              <Text style={styles.summaryValue}>₦{(realEarnings?.monthEarned || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>TODAY</Text>
              <Text style={styles.summaryValue}>₦{(realEarnings?.todayEarned || 0).toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* TRANSACTION HISTORY */}
        <View style={styles.historySection}>
          <View style={styles.historyTabs}>
             <TouchableOpacity 
               onPress={() => setHistoryTab('Transactions')}
               style={[styles.hTab, historyTab === 'Transactions' && styles.activeHTab]}
             >
               <Text style={[styles.hTabText, historyTab === 'Transactions' && styles.activeHTabText]}>Transactions</Text>
             </TouchableOpacity>
             <TouchableOpacity 
               onPress={() => setHistoryTab('Withdrawals')}
               style={[styles.hTab, historyTab === 'Withdrawals' && styles.activeHTab]}
             >
               <Text style={[styles.hTabText, historyTab === 'Withdrawals' && styles.activeHTabText]}>Withdrawals</Text>
             </TouchableOpacity>
          </View>

          <View style={styles.historyList}>
             {(realEarnings?.recentTransactions || [])
               .filter(t => historyTab === 'Transactions' ? true : t.isWithdrawal)
               .map((item, idx) => (
                 <TransactionItem 
                   key={item.id || idx}
                   type={item.type || 'Delivery'}
                   date={`${item.date} | ${item.id}`}
                   amount={item.amount}
                   status={item.status || 'completed'}
                   isWithdrawal={item.isWithdrawal}
                 />
             ))}
          </View>
        </View>

      </ScrollView>

      <WithdrawModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        balance={`₦${(realEarnings?.availableBalance || 62500).toLocaleString()}`}
        onWithdraw={handleWithdrawSuccess}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
  },
  backBtn: {
    marginRight: 15,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: 25,
    padding: 25,
    marginBottom: 25,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceValue: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  withdrawBtn: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    width: 140,
    gap: 8,
  },
  withdrawText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 15,
  },
  chartSection: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 25,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  chartToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#FFF',
    elevation: 1,
  },
  toggleText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#1E293B',
  },
  chartContent: {
    flexDirection: 'row',
    height: 180,
    marginBottom: 25,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingBottom: 25,
    marginRight: 15,
  },
  yText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  barBg: {
    flex: 1,
    width: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 5,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#FFE4E6',
    borderRadius: 5,
  },
  barFillActive: {
    backgroundColor: Colors.primary,
  },
  barLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  barLabelActive: {
    color: '#1E293B',
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 20,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  historySection: {
    gap: 20,
  },
  historyTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  hTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeHTab: {
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  hTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeHTabText: {
    color: '#1E293B',
  },
  historyList: {
    gap: 12,
  },
  transactionCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 15,
  },
  transactionType: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  transactionDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  amountArea: {
    alignItems: 'flex-end',
    gap: 5,
  },
  amountText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'lowercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
  },
  modalTitleContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  modalContent: {
    marginVertical: 10,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 10,
  },
  amountInput: {
    height: 52,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#FAFAFA',
  },
  quickSelect: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  chipText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  modalFooter: {
    marginTop: 30,
    gap: 12,
  },
  mainWithdrawBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainWithdrawBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelBtn: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DriverEarningsScreen;
