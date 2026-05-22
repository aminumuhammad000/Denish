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

const UploadBox = ({ label, height }) => (
  <View style={styles.uploadContainer}>
    <Text style={styles.uploadLabel}>{label}</Text>
    <TouchableOpacity style={[styles.dashBox, { height }]}>
      <Ionicons name="chevron-up" size={32} color={Colors.primary} />
      <Text style={styles.uploadText}>Tap to upload (max 5MB)</Text>
    </TouchableOpacity>
  </View>
);

const ProfilePicturesScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ProgressBar currentStep={3} totalSteps={5} title="Profile" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Upload cover and profile pictures</Text>
          <Text style={styles.subtitle}>Clear photos help you stand out.</Text>
        </View>

        <UploadBox label="Cover picture" height={150} />
        <View style={{ height: 24 }} />
        <UploadBox label="Profile picture" height={220} />

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Step4')}
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  uploadContainer: {
    gap: 8,
  },
  uploadLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dashBox: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadText: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfilePicturesScreen;
