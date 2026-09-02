import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { ProgressBar } from '../components/OnboardingComponents';
import AnimatedLoadingText from '../components/AnimatedLoadingText';

import { updateVendorProfile } from '../services/api';
import { useOnboarding } from '../context/OnboardingContext';

const SectionHeader = ({ title, navigation, target }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity onPress={() => navigation.navigate(target)}>
      <Text style={styles.editText}>Edit</Text>
    </TouchableOpacity>
  </View>
);

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">{value}</Text>
  </View>
);

const ReviewSubmitScreen = ({ navigation }) => {
  const { onboardingData } = useOnboarding();
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Send the actual collected data to the backend
      const response = await updateVendorProfile({
        email: onboardingData.email,
        businessName: onboardingData.businessName,
        address: onboardingData.address,
        phone: onboardingData.phone,
        category: onboardingData.category,
        about: onboardingData.about,
        logoUrl: onboardingData.logoUrl,
        coverUrl: onboardingData.coverUrl,
        openingHours: onboardingData.openingHours,
        payoutAccount: {
          bank: onboardingData.bank,
          bankCode: onboardingData.bankCode,
          accountName: onboardingData.accountName,
          accountNumber: onboardingData.accountNumber,
        },
      });
      if (response && response.success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        setErrorMsg(response?.error || 'Failed to update profile');
      }
    } catch (err) {
      setErrorMsg('Network error. Check connection.', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProgressBar currentStep={5} totalSteps={5} title="Review" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Review & Submit</Text>
          <Text style={styles.subtitle}>Make sure everything looks right.</Text>
        </View>

        <View style={styles.card}>
          <SectionHeader title="Business information" navigation={navigation} target="Step1" />
          <InfoRow label="Name" value={onboardingData.businessName} />
          <InfoRow label="Category" value={onboardingData.category} />
          <InfoRow label="Phone" value={onboardingData.phone} />
          <InfoRow label="Email" value={onboardingData.email} />
          <InfoRow label="Address" value={onboardingData.address} />
        </View>

        <View style={styles.card}>
          <SectionHeader title="Opening hours" navigation={navigation} target="Step2" />
          {Object.keys(onboardingData.openingHours || {}).map(day => {
            const h = onboardingData.openingHours[day];
            return (
              <InfoRow 
                key={day} 
                label={day} 
                value={h.isOpen ? `${h.openAt} - ${h.closeAt}` : 'Closed'} 
              />
            );
          })}
        </View>

        <View style={styles.card}>
          <SectionHeader title="Payout account" navigation={navigation} target="Step4" />
          <InfoRow label="Bank" value={onboardingData.bank} />
          <InfoRow label="Account name" value={onboardingData.accountName} />
          <InfoRow label="Account number" value={onboardingData.accountNumber} />
        </View>

        <Text style={styles.termsText}>
          By submitting, you agree to Denish driver terms and our verification process.
        </Text>

        {errorMsg ? <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{errorMsg}</Text> : null}
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <AnimatedLoadingText text="Submitting" style={styles.buttonText} />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  editText: {
    fontSize: 12,
    color: '#FF8C00',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  termsText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginVertical: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReviewSubmitScreen;
