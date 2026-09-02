import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import AnimatedLoadingText from '../components/AnimatedLoadingText';
import { driverLogin, googleAuthApi } from '../services/api';
import { setAuthSession } from '../services/authStorage';
import { signInWithGoogle } from '../services/googleAuth';

const DriverLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const response = await driverLogin(email, password);
      if (response && response.success) {
        await setAuthSession({
          role: 'driver',
          token: response.token,
          user: response.user,
          screen: 'DriverDashboard'
        });
        navigation.reset({
          index: 0,
          routes: [{ name: 'DriverDashboard' }],
        });
      } else {
        setErrorMsg(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Driver Login error:', error);
      setErrorMsg(error.response?.data?.error || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { token, isAccessToken } = await signInWithGoogle();
      const response = await googleAuthApi(token, 'driver', isAccessToken);
      
      if (response && response.success) {
        await setAuthSession({
          role: 'driver',
          token: response.token,
          user: response.user,
          screen: 'DriverDashboard'
        });
        navigation.reset({
          index: 0,
          routes: [{ name: 'DriverDashboard' }],
        });
      } else {
        setErrorMsg(response.error || 'Google Sign-In failed');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || 'An error occurred during Google Sign-In');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Driver Login</Text>
            <Text style={styles.subtitle}>Sign in to start delivering</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="driver@denish.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword', { role: 'driver' })}>
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                  autoComplete="password"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.eyeBtn}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#64748B" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <TouchableOpacity 
              style={[styles.button, (!email || !password) && { opacity: 0.5 }]}
              onPress={handleLogin}
              disabled={loading || !email || !password}
            >
              {loading ? (
                <AnimatedLoadingText text="Signing in" style={styles.buttonText} />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
              <FontAwesome name="google" size={24} color="#EA4335" />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New here? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('DriverSignup')}>
              <Text style={styles.createAccount}>Create an account</Text>
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
    padding: 16,
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
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
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  forgotPassword: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FAFBFB',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFB',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  eyeBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginTop: 30,
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
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  createAccount: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default DriverLoginScreen;
