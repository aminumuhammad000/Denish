import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ProgressBar } from '../components/OnboardingComponents';

const DayRow = ({ day }) => (
  <View style={styles.dayRow}>
    <View style={styles.dayCol}>
      <Text style={styles.label}>{day}</Text>
      <TouchableOpacity style={styles.dropdown}>
        <Text style={styles.inputText}>Open</Text>
        <Ionicons name="chevron-down" size={18} color="#666" />
      </TouchableOpacity>
    </View>
    <View style={styles.timeCol}>
      <Text style={styles.label}>Time</Text>
      <TouchableOpacity style={styles.dropdown}>
        <Text style={styles.inputText}>08:00 - 22:00</Text>
        <Ionicons name="chevron-down" size={18} color="#666" />
      </TouchableOpacity>
    </View>
  </View>
);

const OpeningHoursScreen = ({ navigation }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProgressBar currentStep={2} totalSteps={5} title="Opening Hours" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Opening hours</Text>
          <Text style={styles.subtitle}>When will you always be available</Text>
        </View>

        <View style={styles.daysList}>
          {days.map((day) => (
            <DayRow key={day} day={day} />
          ))}
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Step3')}
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
  daysList: {
    gap: 20,
    marginBottom: 30,
  },
  dayRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dayCol: {
    flex: 1,
    gap: 8,
  },
  timeCol: {
    flex: 1.5,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
  },
  inputText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OpeningHoursScreen;
