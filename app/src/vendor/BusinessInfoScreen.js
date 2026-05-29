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
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ProgressBar } from '../components/OnboardingComponents';
import { useOnboarding } from '../context/OnboardingContext';

const FOOD_CATEGORIES = [
  'Local Nigerian Dishes',
  'Fast Food & Snacks',
  'Continental Dishes',
  'Pastries & Bakery',
  'Drinks & Healthy Juices',
  'Grill & Barbecue (Suya)',
  'Sea Food',
  'Vegetarian & Salads',
  'Other'
];

const BusinessInfoScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [formData, setFormData] = useState({
    businessName: onboardingData.businessName || '',
    category: onboardingData.category || '',
    phone: onboardingData.phone || '',
    email: onboardingData.email || '',
    address: onboardingData.address || '',
    about: onboardingData.about || '',
    customCategory: onboardingData.customCategory || '',
  });

  const [modalVisible, setModalVisible] = useState(false);

  const selectCategory = (cat) => {
    setFormData({ ...formData, category: cat });
    setModalVisible(false);
  };

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
                placeholder="e.g. Mama's Kitchen"
                value={formData.businessName}
                onChangeText={(val) => setFormData({ ...formData, businessName: val })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.inputText}>{formData.category || 'Select category'}</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {formData.category === 'Other' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Specify Category</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Traditional Soups"
                  value={formData.customCategory}
                  onChangeText={(val) => setFormData({ ...formData, customCategory: val })}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. +234 800 000 0000"
                value={formData.phone}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
                onChangeText={(val) => setFormData({ ...formData, phone: val })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. contact@business.com"
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
                placeholder="e.g. 123 Lagos Way, Ikeja"
                value={formData.address}
                onChangeText={(val) => setFormData({ ...formData, address: val })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>About</Text>
              <TextInput
                placeholder="Tell us what makes your restaurant special..."
                style={[styles.input, styles.textArea]}
                value={formData.about}
                multiline
                numberOfLines={3}
                onChangeText={(val) => setFormData({ ...formData, about: val })}
              />
            </View>

            <TouchableOpacity 
              style={styles.button}
              onPress={() => {
                updateOnboardingData(formData);
                navigation.navigate('Step2');
              }}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Category Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Category</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={FOOD_CATEGORIES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.categoryItem}
                    onPress={() => selectCategory(item)}
                  >
                    <Text style={styles.categoryItemText}>{item}</Text>
                    {formData.category === item && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
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
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default BusinessInfoScreen;
