import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { forgotPassword, resetPassword } from '../services/api';
import AnimatedLoadingText from '../components/AnimatedLoadingText';

const ForgotPasswordScreen = ({ navigation, route }) => {
  const defaultRole = route?.params?.role || 'vendor';
  const [role, setRole] = useState(defaultRole);

  const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP & Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendOTP = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setErrorMsg('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPassword(cleanEmail, role);
      if (result.success) {
        if (result.role) setRole(result.role);
        setStep(2);
        setSuccessMsg(result.message || 'OTP code sent to your email.');
      } else {
        setErrorMsg(result.error || 'Unable to send reset OTP code.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to send OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    const cleanEmail = email.trim();

    if (!cleanEmail) return;

    setResending(true);
    try {
      const result = await forgotPassword(cleanEmail, role);
      if (result.success) {
        setSuccessMsg('A new OTP code has been sent to your email.');
      } else {
        setErrorMsg(result.error || 'Unable to resend OTP code.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to resend OTP code.');
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    const cleanEmail = email.trim();
    const cleanOtp = otp.trim();
    const cleanPass = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanOtp) {
      setErrorMsg('Please enter the 6-digit OTP code sent to your email');
      return;
    }
    if (cleanOtp.length !== 6) {
      setErrorMsg('OTP code must be 6 digits');
      return;
    }
    if (!cleanPass) {
      setErrorMsg('Please enter a new password');
      return;
    }
    if (cleanPass.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }
    if (cleanPass !== cleanConfirm) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(cleanEmail, cleanOtp, cleanPass, role);
      if (result.success) {
        Alert.alert(
          'Success',
          'Your password has been reset successfully. Please sign in with your new password.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (role === 'customer') navigation.navigate('CustomerLogin');
                else if (role === 'driver') navigation.navigate('DriverLogin');
                else navigation.navigate('Login');
              },
            },
          ]
        );
      } else {
        setErrorMsg(result.error || 'Password reset failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Invalid OTP or failed to reset password.');
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
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (step === 2) {
                setStep(1);
                setErrorMsg('');
                setSuccessMsg('');
              } else {
                navigation.goBack();
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          {step === 1 ? (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Forgot password?</Text>
                <Text style={styles.subtitle}>
                  Enter your registered email address to receive a 6-digit OTP verification code.
                </Text>
              </View>

              {errorMsg ? <View style={styles.errorBox}><Text style={styles.errorText}>{errorMsg}</Text></View> : null}

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, (!email.trim() || loading) && { opacity: 0.7 }]}
                  onPress={handleSendOTP}
                  disabled={loading || !email.trim()}
                >
                  {loading ? (
                    <AnimatedLoadingText text="Sending OTP" style={styles.buttonText} />
                  ) : (
                    <Text style={styles.buttonText}>Send OTP</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Enter OTP & Reset</Text>
                <Text style={styles.subtitle}>
                  We sent a 6-digit code to <Text style={styles.emailHighlight}>{email}</Text>
                </Text>
                <TouchableOpacity onPress={() => setStep(1)} style={styles.changeEmailBtn}>
                  <Text style={styles.changeEmailText}>Change email address</Text>
                </TouchableOpacity>
              </View>

              {successMsg ? <View style={styles.successBox}><Text style={styles.successText}>{successMsg}</Text></View> : null}
              {errorMsg ? <View style={styles.errorBox}><Text style={styles.errorText}>{errorMsg}</Text></View> : null}

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>6-Digit OTP Code</Text>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="123456"
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="••••••••"
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="••••••••"
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Ionicons
                        name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.button, (!otp.trim() || !newPassword.trim() || loading) && { opacity: 0.7 }]}
                  onPress={handleResetPassword}
                  disabled={loading || !otp.trim() || !newPassword.trim()}
                >
                  {loading ? (
                    <AnimatedLoadingText text="Resetting password" style={styles.buttonText} />
                  ) : (
                    <Text style={styles.buttonText}>Reset Password</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={handleResendOTP}
                  disabled={resending}
                >
                  <Text style={styles.resendText}>
                    {resending ? 'Resending code...' : "Didn't receive code? Resend OTP"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
  content: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 24,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  emailHighlight: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  changeEmailBtn: {
    marginTop: 6,
  },
  changeEmailText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: '#FAFBFB',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  otpInput: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 6,
    textAlign: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFB',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    paddingRight: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  errorBox: {
    backgroundColor: '#FFEBE9',
    borderColor: '#FF8182',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#D12420',
    fontSize: 13,
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: '#E6F4EA',
    borderColor: '#34A853',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  successText: {
    color: '#137333',
    fontSize: 13,
    textAlign: 'center',
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  resendText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
