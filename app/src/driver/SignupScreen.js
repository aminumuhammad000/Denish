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
import AnimatedLoadingText from '../components/AnimatedLoadingText';
import { driverSignup } from '../services/api';

const DriverSignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [vehicle, setVehicle] = useState(''); // Car, Bike, Bicycle
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !phone || !password || !vehicle) {
      setErrorMsg('Please fill all fields');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await driverSignup(name, email, phone, password, vehicle);
      if (response && response.success) {
        navigation.navigate('DriverStep1Personal');
      } else {
        setErrorMsg(response.error || 'Signup failed');
      }
    } catch (err) {
      console.error('Driver Signup error:', err);
      setErrorMsg(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const vehicles = ['Bike', 'Bicycle', 'Car'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Partner with Denish</Text>
            <Text style={styles.subtitle}>Register as a driver and start earning</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="example@mail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="08012345678"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vehicle Type</Text>
              <View style={styles.vehicleContainer}>
                {vehicles.map(v => (
                  <TouchableOpacity 
                    key={v} 
                    style={[styles.vehicleBtn, vehicle === v && styles.vehicleBtnActive]}
                    onPress={() => setVehicle(v)}
                  >
                    <Text style={[styles.vehicleText, vehicle === v && styles.vehicleTextActive]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="At least 6 characters"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye" : "eye-off"} 
                    size={22} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <TouchableOpacity 
              style={[styles.button, (!name || !email || !phone || !vehicle || password.length < 6) && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <AnimatedLoadingText text="Registering" style={styles.buttonText} />
              ) : (
                <Text style={styles.buttonText}>Register Now</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Existing Driver? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('DriverLogin')}>
              <Text style={styles.linkText}>Login</Text>
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
  scrollContent: {
    padding: 24,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
  },
  form: {
    gap: 18,
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
    borderColor: '#EEE',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 12,
    paddingRight: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 15,
  },
  vehicleContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  vehicleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEE',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  vehicleBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  vehicleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  vehicleTextActive: {
    color: '#FFF',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    paddingBottom: 20,
  },
  footerText: {
    color: '#666',
  },
  linkText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});

export default DriverSignupScreen;
