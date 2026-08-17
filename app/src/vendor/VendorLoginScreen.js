import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { vendorLogin, googleAuthApi } from '../services/api';
import { setAuthSession } from '../services/authStorage';
import AnimatedLoadingText from '../components/AnimatedLoadingText';
import { signInWithGoogle } from '../services/googleAuth';

const VendorLoginScreen = ({ navigation }) => {
  const [authType, setAuthType] = useState('Email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if(!email || !password) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await vendorLogin(email, password);
      if (response && response.success) {
        await setAuthSession({
          role: 'vendor',
          token: response.token,
          vendor: response.vendor,
          screen: 'Dashboard'
        });
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      } else {
        setErrorMsg('Invalid login credentials');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { token, isAccessToken } = await signInWithGoogle();
      const response = await googleAuthApi(token, 'vendor', isAccessToken);
      
      if (response && response.success) {
        await setAuthSession({
          role: 'vendor',
          token: response.token,
          vendor: response.vendor,
          screen: 'Dashboard'
        });
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
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
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sig in to keep earning</Text>
          </View>

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

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{authType}</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder={authType === 'Email' ? 'you@email.com' : 'Phone number'}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword', { role: 'vendor' })}>
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••"
                  secureTextEntry
                />
                <Ionicons name="eye-off-outline" size={20} color="#999" />
              </View>
            </View>

            {errorMsg ? <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>{errorMsg}</Text> : null}
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

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
              <FontAwesome name="google" size={24} color="#EA4335" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { opacity: 0.5 }]} disabled={true}>
              <FontAwesome name="apple" size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New here? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
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
    paddingTop: 60,
  },
  header: {
    marginTop: 10,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EAEAEA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.white,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
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
    padding: 12,
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
    padding: 12,
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
  createAccount: {
    color: '#FF8C00',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default VendorLoginScreen;
