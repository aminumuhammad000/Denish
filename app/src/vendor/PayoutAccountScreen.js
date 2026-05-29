import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ProgressBar } from '../components/OnboardingComponents';
import { getBanks, verifyAccount } from '../services/api';
import { useOnboarding } from '../context/OnboardingContext';
import { 
  Modal, 
  FlatList, 
  ActivityIndicator 
} from 'react-native';

const PayoutAccountScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [formData, setFormData] = useState({
    bank: onboardingData.bank || '',
    bankCode: onboardingData.bankCode || '',
    accountName: onboardingData.accountName || '',
    accountNumber: onboardingData.accountNumber || '',
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
    
    // Auto-verify when 10 digits are reached and bank is selected
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
      <ProgressBar currentStep={4} totalSteps={5} title="Payout account" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Payout account</Text>
          <Text style={styles.subtitle}>Where should we send your earnings?</Text>
        </View>

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

          <TouchableOpacity 
            style={[styles.button, !formData.accountName && { opacity: 0.5 }]}
            onPress={() => {
              updateOnboardingData(formData);
              navigation.navigate('Step5');
            }}
            disabled={!formData.accountName}
          >
            <Text style={styles.buttonText}>Continue</Text>
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
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#999" />
                  </TouchableOpacity>
                )}
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#1a1a1a',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 14,
  },
  inputText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  accountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loader: {
    position: 'absolute',
    right: 15,
  },
  disabledInput: {
    backgroundColor: '#F8F9FA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#E9ECEF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: '#F1F3F5',
  },
  bankItemText: {
    fontSize: 16,
    color: '#333',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 35,
    fontSize: 15,
    color: '#333',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PayoutAccountScreen;
