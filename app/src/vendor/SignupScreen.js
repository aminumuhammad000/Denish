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
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import AnimatedLoadingText from '../components/AnimatedLoadingText';

import { vendorSignup } from '../services/api';

const SignupScreen = ({ navigation }) => {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [phone, setPhone]     = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
  const validatePhone = (phone) => /^\+?[0-9]{10,15}$/.test(phone);

  const isEmailValid = email.length === 0 || validateEmail(email);
  const isPhoneValid = phone.length === 0 || validatePhone(phone);
  const canContinue = name.length > 2 && validateEmail(email) && validatePhone(phone) && password.length >= 6;

  const handleSignup = async () => {
    if(!canContinue) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await vendorSignup(name, email, phone, password);
      if (response && response.success) {
        navigation.navigate('Step1'); // Move to next wizard step
      } else {
        setErrorMsg(response.error || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Get started</Text>
          <Text style={styles.subtitle}>Grow your business on your terms</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Emeka Okafor" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput 
              style={[styles.input, !isEmailValid && styles.inputError]} 
              value={email} 
              onChangeText={setEmail} 
              placeholder="you@email.com" 
              keyboardType="email-address" 
              autoCapitalize="none" 
            />
            {!isEmailValid && <Text style={styles.inlineError}>Please enter a valid email</Text>}
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput 
              style={[styles.input, !isPhoneValid && styles.inputError]} 
              value={phone} 
              onChangeText={setPhone} 
              placeholder="+234909090909" 
              keyboardType="phone-pad" 
              textContentType="telephoneNumber"
              autoComplete="tel"
            />
            {!isPhoneValid && <Text style={styles.inlineError}>Please enter a valid phone number</Text>}
          </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
              <TextInput style={styles.passwordInput} value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry={!showPass} />
              <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={20} color="#999" onPress={() => setShowPass(!showPass)} />
            </View>
          </View>

          {errorMsg ? <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>{errorMsg}</Text> : null}
          <TouchableOpacity 
            style={[styles.button, (!canContinue || loading) && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={!canContinue || loading}
          >
            {loading ? (
              <AnimatedLoadingText text="Creating" style={styles.buttonText} />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or sign up with</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={[styles.socialContainer, { opacity: 0.6 }]}>
          <TouchableOpacity style={styles.socialButton} disabled={true}>
            <FontAwesome name="google" size={24} color="#EA4335" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} disabled={true}>
            <FontAwesome name="apple" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signIn}>Sign in</Text>
          </TouchableOpacity>
        </View>
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
    padding: 16,
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
  },
  form: {
    gap: 12,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FAFBFB',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    padding: 16,
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFB',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    paddingRight: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 14,
  },
  forgotPassword: {
    fontSize: 11,
    color: '#FF8C00',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  inlineError: {
    color: '#FF3B30',
    fontSize: 10,
    marginTop: -4,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEE',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 11,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 16,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 13,
  },
  signIn: {
    color: '#FF8C00',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default SignupScreen;
