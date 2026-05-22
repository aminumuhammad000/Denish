import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { ProgressBar } from '../components/OnboardingComponents';

const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity>
      <Text style={styles.editText}>Edit</Text>
    </TouchableOpacity>
  </View>
);

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
  </View>
);

const ReviewSubmitScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ProgressBar currentStep={5} totalSteps={5} title="Review" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Review & Submit</Text>
          <Text style={styles.subtitle}>Make sure everything looks right.</Text>
        </View>

        <View style={styles.card}>
          <SectionHeader title="Business information" />
          <InfoRow label="Name" value="Mama's Kitchen" />
          <InfoRow label="Category" value="Local dishes" />
          <InfoRow label="Phone" value="+2348000000000" />
          <InfoRow label="Email" value="info@mamaskitchen.ng" />
          <InfoRow label="Address" value="14 Secretariat Avenue, Ikeja, La..." />
        </View>

        <View style={styles.card}>
          <SectionHeader title="Opening hours" />
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
            <InfoRow key={day} label={day} value="0800 - 1700" />
          ))}
          <InfoRow label="Saturday" value="Closed" />
          <InfoRow label="Sunday" value="Closed" />
        </View>

        <View style={styles.card}>
          <SectionHeader title="Payout account" />
          <InfoRow label="Bank" value="Access Bank" />
          <InfoRow label="Account name" value="Mama's Kitchen Ltd" />
          <InfoRow label="Account number" value="63636363633663" />
        </View>

        <Text style={styles.termsText}>
          By submitting, you agree to Denish driver terms and our verification process.
        </Text>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Success')}
        >
          <Text style={styles.buttonText}>Continue</Text>
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
