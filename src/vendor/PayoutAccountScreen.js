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

const PayoutAccountScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    bank: 'Access Bank',
    accountName: 'Mama\'s Kitchen Ltd',
    accountNumber: '636363',
  });

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
            <Text style={styles.label}>Bank</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.inputText}>{formData.bank}</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account name</Text>
            <TextInput
              style={styles.input}
              value={formData.accountName}
              onChangeText={(val) => setFormData({ ...formData, accountName: val })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account number (10 digits)</Text>
            <TextInput
              style={[styles.input, { borderColor: formData.accountNumber.length < 10 ? '#FF8C00' : '#CCC' }]}
              value={formData.accountNumber}
              keyboardType="number-pad"
              maxLength={10}
              onChangeText={(val) => setFormData({ ...formData, accountNumber: val })}
            />
            {formData.accountNumber.length < 10 && (
              <Text style={styles.errorText}>Must be 10 digits</Text>
            )}
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Step5')}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
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
    color: '#FF8C00',
    fontSize: 12,
    fontWeight: '500',
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
