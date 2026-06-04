import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const DriverStep1Personal = ({ navigation }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});
  // Track if user has interacted with the field
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Real-time validation helpers
  const isPhoneValid = (v) => /^[\+]?[0-9]{10,15}$/.test(v.replace(/\s/g, ''));
  const isEmailValid = (v) => /\S+@\S+\.\S+/.test(v);

  const phoneStatus = !phoneTouched ? 'idle' : isPhoneValid(phone) ? 'valid' : 'invalid';
  const emailStatus = !emailTouched ? 'idle' : isEmailValid(email) ? 'valid' : 'invalid';

  const validate = () => {
    let newErrors = {};
    if (!name) newErrors.name = 'Full name is required';
    if (!dob) newErrors.dob = 'Date of birth is required';
    if (!phone) newErrors.phone = 'Phone number is required';
    else if (phone.length < 10) newErrors.phone = 'Invalid phone number';
    if (!email) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email address';
    if (!address) newErrors.address = 'Home address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      navigation.navigate('DriverStep2Vehicle');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Step Header */}
        <View style={styles.stepHeader}>
          <Text style={styles.stepText}>Step 1 of 5 | <Text style={styles.stepTitle}>Personal Information</Text></Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarActive} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.mainTitle}>Personal information</Text>
          <Text style={styles.subtitle}>Tell us a bit about yourself.</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full legal name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Bayo Adeyemi"
                placeholderTextColor="#999"
                value={name}
                onChangeText={(v) => { setName(v); if(errors.name) setErrors({...errors, name: null}); }}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of birth</Text>
              <TextInput
                style={[styles.input, errors.dob && styles.inputError]}
                placeholder="mm/dd/yyy"
                placeholderTextColor="#999"
                value={dob}
                onChangeText={(v) => { setDob(v); if(errors.dob) setErrors({...errors, dob: null}); }}
              />
              {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone number</Text>
              <View style={[
                styles.inputWrapper,
                phoneStatus === 'valid' && styles.inputWrapperValid,
                phoneStatus === 'invalid' && styles.inputWrapperError,
                errors.phone && styles.inputWrapperError,
              ]}>
                <TextInput
                  style={styles.inputInner}
                  placeholder="+234 800 000 0000"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(v) => {
                    setPhone(v);
                    setPhoneTouched(true);
                    if (errors.phone) setErrors({ ...errors, phone: null });
                  }}
                  onBlur={() => setPhoneTouched(true)}
                />
                {phoneStatus === 'valid' && <Ionicons name="checkmark-circle" size={20} color="#27A572" />}
                {phoneStatus === 'invalid' && <Ionicons name="close-circle" size={20} color="#FF3B30" />}
              </View>
              {phoneStatus === 'valid' && <Text style={styles.hintValid}>✓ Looks good!</Text>}
              {phoneStatus === 'invalid' && <Text style={styles.hintError}>Enter a valid phone number (10–15 digits)</Text>}
              {errors.phone && phoneStatus !== 'invalid' && <Text style={styles.hintError}>{errors.phone}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email address</Text>
              <View style={[
                styles.inputWrapper,
                emailStatus === 'valid' && styles.inputWrapperValid,
                emailStatus === 'invalid' && styles.inputWrapperError,
                errors.email && styles.inputWrapperError,
              ]}>
                <TextInput
                  style={styles.inputInner}
                  placeholder="person@email.com"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    setEmailTouched(true);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  onBlur={() => setEmailTouched(true)}
                />
                {emailStatus === 'valid' && <Ionicons name="checkmark-circle" size={20} color="#27A572" />}
                {emailStatus === 'invalid' && <Ionicons name="close-circle" size={20} color="#FF3B30" />}
              </View>
              {emailStatus === 'valid' && <Text style={styles.hintValid}>✓ Valid email address</Text>}
              {emailStatus === 'invalid' && <Text style={styles.hintError}>Enter a valid email (e.g. name@email.com)</Text>}
              {errors.email && emailStatus !== 'invalid' && <Text style={styles.hintError}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Home address</Text>
              <TextInput
                style={[styles.input, errors.address && styles.inputError]}
                placeholder="14 Secretariat Avenue, Ikeja, Lagos"
                placeholderTextColor="#999"
                value={address}
                onChangeText={(v) => { setAddress(v); if(errors.address) setErrors({...errors, address: null}); }}
                multiline
              />
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
  },
  stepHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  stepTitle: {
    fontWeight: '600',
    color: '#333',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#EEE',
    borderRadius: 2,
    width: '100%',
  },
  progressBarActive: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
    width: '20%', // 1 of 5
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
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
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 4,
  },
  inputWrapperValid: {
    borderColor: '#27A572',
    backgroundColor: '#F0FAF6',
  },
  inputWrapperError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF8F8',
  },
  inputInner: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 11,
  },
  hintValid: {
    color: '#27A572',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  hintError: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
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
  continueText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DriverStep1Personal;
