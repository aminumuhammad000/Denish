import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { getBanks, verifyAccount } from '../../services/api';

const DriverStep3Payout = ({ navigation }) => {
  const [formData, setFormData] = useState({
    bank: '',
    bankCode: '',
    accountName: '',
    accountNumber: '',
  });

  const [banks, setBanks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorHeader, setErrorHeader] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    setLoadingBanks(true);
    try {
      const result = await getBanks();
      if (result.success) {
        setBanks(result.data);
      }
    } catch (err) {
      console.error('Failed to load banks', err);
    } finally {
      setLoadingBanks(false);
    }
  };

  const handleBankSelect = (bank) => {
    setFormData({ ...formData, bank: bank.name, bankCode: bank.code, accountName: '' });
    setModalVisible(false);
    setSearchQuery('');
  };

  const filteredBanks = (banks || []).filter(b => 
    b && b.name && b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAccountChange = async (val) => {
    setFormData({ ...formData, accountNumber: val, accountName: '' });
    
    if (val.length === 10 && formData.bankCode) {
      setVerifying(true);
      setErrorHeader('');
      try {
        const result = await verifyAccount(formData.bankCode, val);
        if (result.success) {
          setFormData(prev => ({ ...prev, accountName: result.data.accountName, accountNumber: val }));
        } else {
          setErrorHeader(result.message || 'Verification failed');
        }
      } catch (err) {
        setErrorHeader('Could not verify account. Please check details.');
      } finally {
        setVerifying(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Step Header */}
        <View style={styles.stepHeader}>
          <Text style={styles.stepText}>Step 3 of 5 | <Text style={styles.stepTitle}>Payout Details</Text></Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarActive} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.mainTitle}>Payout account</Text>
          <Text style={styles.subtitle}>Where should we send your earnings?</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Bank</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.inputText}>{formData.bank || 'Choose your bank'}</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account number (10 digits)</Text>
              <View style={styles.accountInputWrapper}>
                <TextInput
                  style={[styles.input, { flex: 1, borderColor: formData.accountNumber.length === 10 ? Colors.primary : '#CCC' }]}
                  value={formData.accountNumber}
                  placeholder="e.g. 0123456789"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  maxLength={10}
                  onChangeText={handleAccountChange}
                />
                {verifying && <ActivityIndicator style={styles.loader} color={Colors.primary} />}
              </View>
              {errorHeader ? <Text style={styles.errorText}>{errorHeader}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account name</Text>
              <View style={[styles.input, styles.disabledInput]}>
                <Text style={[styles.inputText, !formData.accountName && { color: '#999' }]}>
                  {formData.accountName || 'Enter account number to verify...'}
                </Text>
                {formData.accountName && <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.continueButton, !formData.accountName && { opacity: 0.5 }]}
            onPress={() => navigation.navigate('DriverDashboard')}
            disabled={!formData.accountName}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>

        {/* Bank Picker Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose your bank</Text>
                <TouchableOpacity onPress={() => {
                  setModalVisible(false);
                  setSearchQuery('');
                }}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <View style={styles.searchWrapper}>
                <Ionicons name="search" size={18} color="#666" />
                <TextInput 
                  style={styles.searchInput}
                  placeholder="Search bank name..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                />
              </View>

              {loadingBanks ? (
                <ActivityIndicator size="large" color={Colors.primary} style={{ margin: 20 }} />
              ) : (
                <FlatList
                  data={filteredBanks}
                  keyExtractor={(item) => item.code}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.bankItem}
                      onPress={() => handleBankSelect(item)}
                    >
                      <Text style={styles.bankItemText}>{item.name}</Text>
                      {formData.bankCode === item.code && <Ionicons name="checkmark" size={20} color={Colors.primary} />}
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1 },
  stepHeader: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  stepText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 10 },
  stepTitle: { fontWeight: '600', color: '#333' },
  progressBarContainer: { height: 4, backgroundColor: '#EEE', borderRadius: 2, width: '100%' },
  progressBarActive: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2, width: '60%' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', marginTop: 20, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#333' },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 15, fontSize: 16, color: '#333' },
  dropdown: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inputText: { fontSize: 16, color: '#333' },
  accountInputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loader: { position: 'absolute', right: 15 },
  disabledInput: { backgroundColor: '#F0F0F0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  errorText: { color: '#E74C3C', fontSize: 12, marginTop: -4 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#FAFAFA' },
  continueButton: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 18, alignItems: 'center' },
  continueText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10, gap: 8 },
  searchInput: { flex: 1, height: 35, fontSize: 15, color: '#333' },
  bankItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderColor: '#F5F5F5' },
  bankItemText: { fontSize: 16, color: '#333' },
});

export default DriverStep3Payout;
