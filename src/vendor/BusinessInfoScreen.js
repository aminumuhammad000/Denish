import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ProgressBar } from '../components/OnboardingComponents';

const BusinessInfoScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    businessName: 'Mama\'s Kitchen',
    category: 'Local Dishes',
    phone: '+234 800 000 0000',
    email: 'info@mamaskitchen.ng',
    address: '14 Secretariat Avenue, Ikeja, Lagos',
    about: 'Authentic Nigerian home-style cooking made',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProgressBar currentStep={1} totalSteps={5} title="Business Information" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Business information</Text>
            <Text style={styles.subtitle}>Tell us a bit about your business.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business name</Text>
              <TextInput
                style={styles.input}
                value={formData.businessName}
                onChangeText={(val) => setFormData({ ...formData, businessName: val })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.inputText}>{formData.category}</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone number</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                keyboardType="phone-pad"
                onChangeText={(val) => setFormData({ ...formData, phone: val })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(val) => setFormData({ ...formData, email: val })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Home address</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(val) => setFormData({ ...formData, address: val })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>About</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.about}
                multiline
                numberOfLines={3}
                onChangeText={(val) => setFormData({ ...formData, about: val })}
              />
            </View>

            <TouchableOpacity 
              style={styles.button}
              onPress={() => navigation.navigate('Step2')}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
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
    gap: 20,
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
  inputText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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

export default BusinessInfoScreen;
