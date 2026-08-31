import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useOnboarding } from '../../context/OnboardingContext';
import AnimatedLoadingText from '../../components/AnimatedLoadingText';

import { updateDriverProfile } from '../../services/api';

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
    <Text style={styles.infoValue} numberOfLines={1}>{value || '--'}</Text>
  </View>
);

const DriverStep5Review = ({ navigation }) => {
  const { onboardingData } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateDriverProfile({
        name: onboardingData.driverName,
        email: onboardingData.driverEmail,
        phone: onboardingData.driverPhone,
        vehicle: {
          type: onboardingData.vehicleType,
          make: onboardingData.vehicleMake,
          plate: onboardingData.vehiclePlate,
          color: onboardingData.vehicleColor
        },
        bank: {
          name: onboardingData.bank,
          bankCode: onboardingData.bankCode,
          accountName: onboardingData.accountName,
          accountNumber: onboardingData.accountNumber
        },
        documents: {
          nationalId: onboardingData.docs?.nationalId?.uri || null,
          vehiclePhoto: onboardingData.docs?.vehiclePhoto?.uri || null,
          license: onboardingData.docs?.license?.uri || null
        }
      });
      setLoading(false);
      if (Platform.OS === 'web') {
        alert("Application Submitted: Your details have been sent for verification. We will notify you once approved.");
        navigation.reset({ index: 0, routes: [{ name: 'DriverLogin' }] });
      } else {
        Alert.alert(
          "Application Submitted",
          "Your details have been sent for verification. We will notify you once approved.",
          [{ text: "Great", onPress: () => navigation.reset({ index: 0, routes: [{ name: 'DriverLogin' }] }) }]
        );
      }
    } catch (err) {
      console.error('Driver onboarding submit error:', err);
      setLoading(false);
      if (Platform.OS === 'web') {
        alert("Error: Could not submit application. Please try again.");
      } else {
        Alert.alert("Error", "Could not submit application. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Step Header */}
        <View style={styles.stepHeader}>
          <Text style={styles.stepText}>Step 5 of 5 | <Text style={styles.stepTitle}>Review</Text></Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarActive, { width: '100%' }]} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.mainTitle}>Review & Submit</Text>
            <Text style={styles.subtitle}>Make sure everything looks right.</Text>
          </View>

          <View style={styles.card}>
            <SectionHeader title="Personal information" navigation={navigation} target="DriverStep1Personal" />
            <InfoRow label="Full Name" value={onboardingData.driverName} />
            <InfoRow label="DOB" value={onboardingData.driverDob} />
            <InfoRow label="Phone" value={onboardingData.driverPhone} />
            <InfoRow label="Email" value={onboardingData.driverEmail} />
            <InfoRow label="Address" value={onboardingData.driverAddress} />
          </View>

          <View style={styles.card}>
            <SectionHeader title="Vehicle details" navigation={navigation} target="DriverStep2Vehicle" />
            <InfoRow label="Type" value={onboardingData.vehicleType} />
            <InfoRow label="Make" value={onboardingData.vehicleMake} />
            <InfoRow label="Model" value={onboardingData.vehicleModel} />
            <InfoRow label="Plate" value={onboardingData.vehiclePlate} />
            <InfoRow label="Color" value={onboardingData.vehicleColor} />
          </View>

          <View style={styles.card}>
            <SectionHeader title="Documents" navigation={navigation} target="DriverStep3Docs" />
            <InfoRow label="National ID" value={onboardingData.docs?.nationalId ? '✓ Uploaded' : 'Missing'} />
            <InfoRow label="Vehicle Photo" value={onboardingData.docs?.vehiclePhoto ? '✓ Uploaded' : 'Missing'} />
            <InfoRow label="License" value={onboardingData.docs?.license ? '✓ Uploaded' : 'Missing'} />
          </View>

          <View style={styles.card}>
            <SectionHeader title="Payout account" navigation={navigation} target="DriverStep4Payout" />
            <InfoRow label="Bank" value={onboardingData.bank} />
            <InfoRow label="Account Name" value={onboardingData.accountName} />
            <InfoRow label="Account Number" value={onboardingData.accountNumber} />
          </View>

          <Text style={styles.termsText}>
            By submitting, you agree to Denish driver terms and our background check policy.
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <AnimatedLoadingText text="Submitting" style={styles.continueText} />
            ) : (
              <Text style={styles.continueText}>Submit Application</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1 },
  stepHeader: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  stepText: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 10 },
  stepTitle: { fontWeight: '600', color: '#333' },
  progressBarContainer: { height: 4, backgroundColor: '#EEE', borderRadius: 2, width: '100%', overflow: 'hidden' },
  progressBarActive: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  header: { marginBottom: 25 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', marginTop: 20, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  editText: {
    fontSize: 13,
    color: Colors.primary,
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
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
  },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#FAFAFA' },
  continueButton: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 18, alignItems: 'center' },
  continueText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default DriverStep5Review;
