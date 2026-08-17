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
import { customerLogin, googleAuthApi } from '../services/api';
import { setAuthSession } from '../services/authStorage';
import { signInWithGoogle } from '../services/googleAuth';

const LoginScreen = ({ navigation }) => {
  const [authType, setAuthType] = useState('Email'); // 'Email' or 'Phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter your email/phone and password.');
      return;
    }
    setLoading(true);
    try {
      const response = await customerLogin(email, password);
      if (response && response.success) {
        await setAuthSession({
          role: 'customer',
          token: response.token,
          user: response.user,
          screen: 'CustomerHome'
        });
        navigation.reset({
          index: 0,
          routes: [{ name: 'CustomerHome' }],
        });
      } else {
        alert(response.error || 'Login failed');
      }
    } catch (error) {
       alert(error.response?.data?.error || 'Invalid credentials or network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { token, isAccessToken } = await signInWithGoogle();
      const response = await googleAuthApi(token, 'customer', isAccessToken);
      
      if (response && response.success) {
        await setAuthSession({
          role: 'customer',
          token: response.token,
          user: response.user,
          screen: 'CustomerHome'
        });
        navigation.reset({
          index: 0,
          routes: [{ name: 'CustomerHome' }],
        });
      } else {
        alert(response.error || 'Google Sign-In failed');
      }
    } catch (error) {
      console.error(error);
      alert(error.message || 'An error occurred during Google Sign-In');
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to keep ordering your favorites</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, authType === 'Email' && styles.activeTab]}
              onPress={() => setAuthType('Email')}
            >
              <Text style={[styles.tabText, authType === 'Email' && styles.activeTabText]}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, authType === 'Phone' && styles.activeTab]}
              onPress={() => setAuthType('Phone')}
            >
              <Text style={[styles.tabText, authType === 'Phone' && styles.activeTabText]}>Phone</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{authType}</Text>
              <TextInput
                style={styles.input}
                placeholder={authType === 'Email' ? 'you@email.com' : '0800 000 0000'}
                value={email}
                onChangeText={setEmail}
                keyboardType={authType === 'Email' ? 'email-address' : 'phone-pad'}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword', { role: 'customer' })}>
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={24}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Button */}
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

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Icons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
              <FontAwesome name="google" size={28} color="#EA4335" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { opacity: 0.5 }]} disabled={true}>
              <FontAwesome name="apple" size={28} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>New here? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('CustomerSignup')}>
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
    padding: 24,
    paddingTop: 50,
    flexGrow: 1,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.secondaryText,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EAEAEA',
    borderRadius: 12,
    padding: 3,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#000',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FAFBFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    borderColor: '#eee',
    borderWidth: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFB',
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 8,
    paddingRight: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  forgotPassword: {
    fontSize: 12,
    color: '#FF8C00',
    fontWeight: '600',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEE',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 12,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    backgroundColor: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  createAccount: {
    color: '#FF8C00',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default LoginScreen;
