import React, { useState, useEffect, useRef } from 'react';
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
import { forgotPassword, resetPassword, verifyOTP } from '../services/api';
import AnimatedLoadingText from '../components/AnimatedLoadingText';

const RESEND_COOLDOWN_SECONDS = 45;

const ForgotPasswordScreen = ({ navigation, route }) => {
  const defaultRole = route?.params?.role || 'vendor';
  const [role, setRole] = useState(defaultRole);

  const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP & Reset Password
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const digitInputs = useRef([]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer = null;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

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
      if (result && result.success) {
        if (result.role) setRole(result.role);
        setStep(2);
        setCountdown(RESEND_COOLDOWN_SECONDS);
        setOtpDigits(['', '', '', '', '', '']);
        setSuccessMsg(result.message || 'A 6-digit OTP code has been sent to your email.');
        // If in development mode and devOtp is returned, prefill or alert
        if (result.devOtp) {
          console.log('DEV OTP received:', result.devOtp);
        }
      } else {
        setErrorMsg(result?.error || 'Unable to send reset OTP code.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to send OTP. Please check your email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || resending) return;
    setErrorMsg('');
    setSuccessMsg('');
    const cleanEmail = email.trim();

    if (!cleanEmail) return;

    setResending(true);
    try {
      const result = await forgotPassword(cleanEmail, role);
      if (result && result.success) {
        setCountdown(RESEND_COOLDOWN_SECONDS);
        setSuccessMsg('A new 6-digit OTP has been sent to your email.');
      } else {
        setErrorMsg(result?.error || 'Unable to resend OTP code.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to resend OTP code.');
    } finally {
      setResending(false);
    }
  };

  const handleDigitChange = (value, index) => {
    const newDigits = [...otpDigits];
    
    // Handle paste of full 6-digit code
    if (value.length > 1) {
      const pasted = value.replace(/[^0-9]/g, '').slice(0, 6);
      const chars = pasted.split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = chars[i] || '';
      }
      setOtpDigits(newDigits);
      if (pasted.length === 6) {
        digitInputs.current[5]?.blur();
      } else {
        digitInputs.current[Math.min(pasted.length, 5)]?.focus();
      }
      return;
    }

    const cleanVal = value.replace(/[^0-9]/g, '');
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    if (cleanVal && index < 5) {
      digitInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        digitInputs.current[index - 1]?.focus();
      }
    }
  };

  const getCombinedOTP = () => otpDigits.join('').trim();

  const handleResetPassword = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    const cleanEmail = email.trim();
    const cleanOtp = getCombinedOTP();
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
      if (result && result.success) {
        Alert.alert(
          'Password Reset Successful 🎉',
          'Your password has been updated. Please sign in with your new password.',
          [
            {
              text: 'Sign In Now',
              onPress: () => {
                let targetLogin = 'Login';
                if (role === 'customer') targetLogin = 'CustomerLogin';
                else if (role === 'driver') targetLogin = 'DriverLogin';
                navigation.reset({ index: 0, routes: [{ name: targetLogin }] });
              },
            },
          ]
        );
      } else {
        setErrorMsg(result?.error || 'Password reset failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Invalid or expired OTP. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const otpComplete = getCombinedOTP().length === 6;

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
                <View style={styles.iconCircle}>
                  <Ionicons name="key-outline" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.title}>Forgot password?</Text>
                <Text style={styles.subtitle}>
                  Enter your registered account email. We'll send you a 6-digit OTP verification code to reset your password.
                </Text>
              </View>

              {errorMsg ? <View style={styles.errorBox}><Text style={styles.errorText}>{errorMsg}</Text></View> : null}
              {successMsg ? <View style={styles.successBox}><Text style={styles.successText}>{successMsg}</Text></View> : null}

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
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, (!email.trim() || loading) && { opacity: 0.6 }]}
                  onPress={handleSendOTP}
                  disabled={loading || !email.trim()}
                >
                  {loading ? (
                    <AnimatedLoadingText text="Sending verification code" style={styles.buttonText} />
                  ) : (
                    <Text style={styles.buttonText}>Send OTP Code</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.header}>
                <View style={styles.iconCircle}>
                  <Ionicons name="shield-checkmark-outline" size={32} color={Colors.primary} />
                </View>
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
                  <Text style={styles.label}>6-Digit Security Code</Text>
                  <View style={styles.otpContainer}>
                    {otpDigits.map((digit, idx) => (
                      <TextInput
                        key={idx}
                        ref={(ref) => (digitInputs.current[idx] = ref)}
                        style={[
                          styles.otpCell,
                          digit ? styles.otpCellFilled : null,
                        ]}
                        value={digit}
                        onChangeText={(val) => handleDigitChange(val, idx)}
                        onKeyPress={(e) => handleKeyPress(e, idx)}
                        keyboardType="number-pad"
                        maxLength={1}
                        selectTextOnFocus
                        textAlign="center"
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Minimum 6 characters"
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
                      placeholder="Re-enter new password"
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
                  style={[styles.button, (!otpComplete || !newPassword.trim() || loading) && { opacity: 0.6 }]}
                  onPress={handleResetPassword}
                  disabled={loading || !otpComplete || !newPassword.trim()}
                >
                  {loading ? (
                    <AnimatedLoadingText text="Updating password" style={styles.buttonText} />
                  ) : (
                    <Text style={styles.buttonText}>Reset Password</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={handleResendOTP}
                  disabled={countdown > 0 || resending}
                >
                  <Text style={[styles.resendText, countdown > 0 && { color: '#94A3B8' }]}>
                    {resending
                      ? 'Resending code...'
                      : countdown > 0
                      ? `Resend code in ${countdown}s`
                      : "Didn't receive code? Resend OTP"}
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
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF5EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
  },
  emailHighlight: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  changeEmailBtn: {
    marginTop: 8,
  },
  changeEmailText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  form: {
    gap: 18,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  otpCell: {
    flex: 1,
    height: 52,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  otpCellFilled: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF9F5',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingRight: 14,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  successBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#16A34A',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resendText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
