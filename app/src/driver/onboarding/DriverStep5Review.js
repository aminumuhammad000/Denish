import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Colors } from '../../constants/Colors';

const DriverStep5Review = ({ navigation }) => {
  // Demo data for review
  const data = {
    personal: {
      name: 'Bayo Adeyemi',
      dob: '2026-04-16',
      phone: '+2348000000000',
      email: 'user@email.com',
      address: '11 Nura Avenue, Lagos, Kano.',
    },
    vehicle: {
      type: 'Motorcycle',
      make: 'Honda',
      model: 'M4',
      plate: 'ABC-123-DE',
      color: 'Blue',
    },
    payout: {
      bank: 'Kuda Bank',
      number: '0123456789',
      name: 'Bayo Adeyemi',
    }
  };

  const ReviewCard = ({ title, items, onEdit }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <TouchableOpacity onPress={onEdit}>
          <Text style={styles.editLink}>Edit ›</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardBody}>
        {Object.entries(items).map(([label, value]) => (
          <View key={label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label.toUpperCase()}</Text>
            <Text style={styles.infoValue}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Step Header */}
        <View style={styles.stepHeader}>
          <Text style={styles.stepText}>Step 5 of 5 | <Text style={styles.stepTitle}>Review</Text></Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarActive} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.mainTitle}>Review & Submit</Text>
          <Text style={styles.subtitle}>Make sure everything looks right.</Text>

          <ReviewCard 
            title="Personal" 
            items={data.personal} 
            onEdit={() => navigation.navigate('DriverStep1Personal')} 
          />

          <ReviewCard 
            title="Vehicle" 
            items={data.vehicle} 
            onEdit={() => navigation.navigate('DriverStep2Vehicle')} 
          />

          <ReviewCard 
            title="Payout" 
            items={data.payout} 
            onEdit={() => navigation.navigate('DriverStep3Payout')} 
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => navigation.navigate('DriverDashboard')}
          >
            <Text style={styles.continueText}>Continue</Text>
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
  progressBarContainer: { height: 4, backgroundColor: '#EEE', borderRadius: 2, width: '100%' },
  progressBarActive: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2, width: '100%' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', marginTop: 20, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  editLink: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FAFAFA',
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
  },
  continueText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default DriverStep5Review;
