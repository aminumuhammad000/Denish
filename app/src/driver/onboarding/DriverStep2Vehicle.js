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
import { Colors } from '../../constants/Colors';

const DriverStep2Vehicle = ({ navigation }) => {
  const [vehicle, setVehicle] = useState('Bike');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepText}>Step 2 of 5 | <Text style={styles.stepTitle}>Vehicle Details</Text></Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarActive} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.mainTitle}>Vehicle details</Text>
          <Text style={styles.subtitle}>Select the transport you'll be using.</Text>

          <View style={styles.vehicleOptions}>
            {['Bike', 'Bicycle', 'Car'].map(v => (
              <TouchableOpacity 
                key={v}
                style={[styles.option, vehicle === v && styles.optionActive]}
                onPress={() => setVehicle(v)}
              >
                <Text style={[styles.optionText, vehicle === v && styles.optionTextActive]}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  stepText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 10 },
  stepTitle: { fontWeight: '600', color: '#333' },
  progressBarContainer: { height: 4, backgroundColor: '#EEE', borderRadius: 2, width: '100%' },
  progressBarActive: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2, width: '40%' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', marginTop: 20, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  vehicleOptions: { gap: 15 },
  option: { padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#EEE', backgroundColor: '#FFF' },
  optionActive: { borderColor: Colors.primary, backgroundColor: '#FFF5E6' },
  optionText: { fontSize: 16, fontWeight: '600', color: '#333' },
  optionTextActive: { color: Colors.primary },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#FAFAFA' },
  continueButton: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 18, alignItems: 'center' },
  continueText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default DriverStep2Vehicle;
