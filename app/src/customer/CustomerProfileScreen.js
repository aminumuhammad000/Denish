import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Switch, ActivityIndicator, Modal, TextInput, Alert, Clipboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

import { getCustomerProfile, saveAddress, savePaymentMethod, deleteCustomerAddress, deleteCustomerPaymentMethod, updateCustomerProfile } from '../services/api';
import { clearAuthSession } from '../services/authStorage';
import { useIsFocused } from '@react-navigation/native';
import CustomerBottomTab from './components/CustomerBottomTab';

const CustomerProfileScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [referralModalVisible, setReferralModalVisible] = useState(false);
  const [addressLabel, setAddressLabel] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardType, setCardType] = useState('Visa');
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  const handleCardNumberChange = (val) => {
    // Restrict to digits only, max 16 digits, auto-format with spaces (XXXX XXXX XXXX XXXX)
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (val) => {
    // Restrict to digits only, max 4 digits (MMYY), auto-format as MM/YY
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    let formatted = cleaned;
    if (cleaned.length >= 3) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    setCardExpiry(formatted);
  };

  const openPaymentModal = () => {
    setCardNumber('');
    setCardExpiry('');
    setCardType('Visa');
    setPaymentModalVisible(true);
  };

  const closePaymentModal = () => {
    setCardNumber('');
    setCardExpiry('');
    setCardType('Visa');
    setPaymentModalVisible(false);
  };
  const [notifications, setNotifications] = useState({
    orders: true,
    promotions: true,
    recommendations: false,
  });

  React.useEffect(() => {
    if (isFocused) {
      fetchProfile();
    }
  }, [isFocused]);

  const fetchProfile = async () => {
    try {
      const res = await getCustomerProfile();
      if (res.success) {
        setProfile(res.data);
        if (res.data.notifications) {
          setNotifications({
            orders: res.data.notifications.orders ?? true,
            promotions: res.data.notifications.promotions ?? true,
            recommendations: res.data.notifications.recommendations ?? false,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = async (key, value) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    try {
      await updateCustomerProfile({ notifications: updated });
    } catch (e) {
      console.error('Failed to update notification preference:', e);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { flexGrow: 1 }]}> 
        
        {/* User Info Card */}
        <View style={styles.userCard}>
          <Image 
            source={{ uri: profile?.profilePic || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' }} 
            style={styles.avatar} 
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile?.name || 'Customer'}</Text>
            <Text style={styles.userMeta}>{profile?.email || 'email@example.com'}</Text>
            <Text style={styles.userMeta}>{profile?.phone || '+234...'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editBtn}
            onPress={() => navigation.navigate('CustomerEditProfile', { initialData: profile })}
          >
            <MaterialCommunityIcons name="square-edit-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Loyalty Card */}
        <View style={styles.loyaltyCard}>
          <MaterialCommunityIcons name="gift-outline" size={40} color="#FFF" />
          <Text style={styles.loyaltyLabel}>Loyalty points</Text>
          <Text style={styles.loyaltyPoints}>{profile?.loyaltyPoints ?? 0}</Text>
        </View>

        {/* Saved Addresses */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={20} color="#FF8C00" />
            <Text style={styles.sectionTitle}>Saved addresses</Text>
          </View>
          <TouchableOpacity onPress={() => setAddressModalVisible(true)}>
            <Text style={styles.addText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {profile?.addresses && profile.addresses.length > 0 ? (
            profile.addresses.map((addr, index) => (
              <React.Fragment key={addr._id || index}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.addressRow}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                      <Text style={styles.addressName}>{addr.label || addr.title || 'Address'}</Text>
                      {addr.isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View>}
                    </View>
                    <Text style={styles.addressText}>{addr.addr || addr.address || addr.street || JSON.stringify(addr)}</Text>
                  </View>
                  <TouchableOpacity 
                    style={{ padding: 6 }}
                    onPress={() => {
                      Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Delete', 
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              await deleteCustomerAddress(addr._id);
                              fetchProfile();
                            } catch(e) {
                              Alert.alert('Error', 'Failed to delete address.');
                            }
                          } 
                        }
                      ]);
                    }}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF5252" />
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            ))
          ) : (
            <View style={{ padding: 15 }}>
              <Text style={{ color: '#888' }}>No saved addresses yet.</Text>
            </View>
          )}
        </View>

        {/* Payment Methods */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="wallet-outline" size={20} color="#FF8C00" />
            <Text style={styles.sectionTitle}>Payment method</Text>
          </View>
          <TouchableOpacity onPress={openPaymentModal}>
            <Text style={styles.addText}>+ Add card</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <View style={styles.paymentRow}>
            <MaterialCommunityIcons name="cash" size={24} color="#333" />
            <Text style={[styles.paymentName, { marginLeft: 15 }]}>Cash on delivery</Text>
          </View>
          {profile?.paymentMethods && profile.paymentMethods.map((pay, index) => (
            <React.Fragment key={pay._id || index}>
              <View style={styles.divider} />
              <View style={styles.paymentRow}>
                <MaterialCommunityIcons name="credit-card-outline" size={24} color="#333" />
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.paymentName}>{pay.cardType || pay.type || 'Card'} ● ● ● ● {pay.last4 || '4242'}</Text>
                  {pay.expiry && <Text style={styles.paymentMeta}>Expires {pay.expiry}</Text>}
                </View>
                <TouchableOpacity 
                  style={{ padding: 6 }}
                  onPress={() => {
                    Alert.alert('Delete Card', 'Are you sure you want to delete this payment method?', [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Delete', 
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await deleteCustomerPaymentMethod(pay._id);
                            fetchProfile();
                          } catch(e) {
                            Alert.alert('Error', 'Failed to delete payment method.');
                          }
                        } 
                      }
                    ]);
                  }}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF5252" />
                </TouchableOpacity>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Notification Preferences */}
        <View style={styles.cardContainer}>
          <Text style={styles.containerTitle}>Notification preferences</Text>
          <View style={styles.card}>
            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefTitle}>Order updates</Text>
                <Text style={styles.prefSubtitle}>Real-time status changes</Text>
              </View>
              <Switch 
                value={notifications.orders} 
                onValueChange={(v) => handleNotificationToggle('orders', v)}
                trackColor={{ true: '#4CD964', false: '#EEE' }}
                thumbColor="#FFF"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefTitle}>Promotions</Text>
                <Text style={styles.prefSubtitle}>Discounts and deals</Text>
              </View>
              <Switch 
                value={notifications.promotions} 
                onValueChange={(v) => handleNotificationToggle('promotions', v)}
                trackColor={{ true: '#4CD964', false: '#EEE' }}
                thumbColor="#FFF"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefTitle}>Recommendations</Text>
                <Text style={styles.prefSubtitle}>Spots you might like</Text>
              </View>
              <Switch 
                value={notifications.recommendations} 
                onValueChange={(v) => handleNotificationToggle('recommendations', v)}
                trackColor={{ true: '#4CD964', false: '#EEE' }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </View>

        {/* Other Options */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.optionRow} onPress={() => setReferralModalVisible(true)}>
            <MaterialCommunityIcons name="gift-outline" size={22} color="#FF8C00" />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.optionTitle}>Refer and earn</Text>
              <Text style={styles.optionSubtitle}>Code: EMEKA340</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.optionRow} onPress={() => navigation.navigate('SystemContent', { key: 'terms_of_service', title: 'Terms of Service' })}>
            <MaterialCommunityIcons name="file-document-outline" size={22} color="#FF8C00" />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.optionTitle}>Terms of service</Text>
              <Text style={styles.optionSubtitle}>Read our terms</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.optionRow} onPress={() => navigation.navigate('SystemContent', { key: 'privacy_policy', title: 'Privacy Policy' })}>
            <MaterialCommunityIcons name="shield-outline" size={22} color="#FF8C00" />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.optionTitle}>Privacy policy</Text>
              <Text style={styles.optionSubtitle}>How we use your data</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.optionRow} onPress={() => navigation.navigate('SystemContent', { key: 'help_and_support', title: 'Help & Support' })}>
            <MaterialCommunityIcons name="help-circle-outline" size={22} color="#FF8C00" />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.optionTitle}>Help & support</Text>
              <Text style={styles.optionSubtitle}>Talk to our team</Text>
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={async () => {
          await clearAuthSession();
          navigation.replace('RoleSelection');
        }}>
          <Ionicons name="log-out-outline" size={20} color="#FF5252" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Add Address Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addressModalVisible}
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => setAddressModalVisible(false)}
            >
              <Ionicons name="close" size={22} color="#666" />
            </TouchableOpacity>

            <Text style={styles.modalHeaderTitle}>Add address</Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Label</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Home, Office..."
                placeholderTextColor="#AAA"
                value={addressLabel}
                onChangeText={setAddressLabel}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Address</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Street, area, city"
                placeholderTextColor="#AAA"
                value={addressStreet}
                onChangeText={setAddressStreet}
              />
            </View>

            <TouchableOpacity 
              style={styles.saveModalBtn}
              disabled={savingAddress}
              onPress={async () => {
                if (!addressStreet) {
                  Alert.alert('Error', 'Please enter your street address.');
                  return;
                }
                setSavingAddress(true);
                try {
                  await saveAddress({
                    label: addressLabel || 'Home',
                    addr: addressStreet,
                    address: addressStreet,
                    isDefault: true
                  });
                  setAddressLabel('');
                  setAddressStreet('');
                  setAddressModalVisible(false);
                  fetchProfile();
                } catch (e) {
                  Alert.alert('Error', 'Failed to save address');
                } finally {
                  setSavingAddress(false);
                }
              }}
            >
              {savingAddress ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveModalBtnText}>Save</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelModalBtn}
              onPress={() => setAddressModalVisible(false)}
            >
              <Text style={styles.cancelModalBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Refer Friends Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={referralModalVisible}
        onRequestClose={() => setReferralModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => setReferralModalVisible(false)}
            >
              <Ionicons name="close" size={22} color="#666" />
            </TouchableOpacity>

            <Text style={styles.modalHeaderTitle}>Refer friends, earn rewards</Text>

            <View style={{ alignItems: 'center', marginVertical: 18 }}>
              <MaterialCommunityIcons name="gift-outline" size={54} color="#FF7A00" />
            </View>

            <Text style={styles.referralSubtitle}>
              You’ll need to sign back in to receive orders.
            </Text>

            <View style={styles.codeBox}>
              <Text style={styles.codeText}>EMEKA340</Text>
            </View>

            <TouchableOpacity 
              style={styles.copyBtn}
              onPress={() => {
                Clipboard.setString('EMEKA340');
                Alert.alert('Copied!', 'Referral code copied to clipboard.');
              }}
            >
              <Text style={styles.copyBtnText}>Copy code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Payment Method Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={paymentModalVisible}
        onRequestClose={closePaymentModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={closePaymentModal}
            >
              <Ionicons name="close" size={22} color="#666" />
            </TouchableOpacity>

            <Text style={styles.modalHeaderTitle}>Add payment card</Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Card Number</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="4242 4242 4242 4242"
                placeholderTextColor="#AAA"
                keyboardType="number-pad"
                maxLength={19}
                value={cardNumber}
                onChangeText={handleCardNumberChange}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[styles.modalInputGroup, { flex: 1 }]}>
                <Text style={styles.modalInputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="MM/YY (e.g. 12/28)"
                  placeholderTextColor="#AAA"
                  keyboardType="number-pad"
                  maxLength={5}
                  value={cardExpiry}
                  onChangeText={handleCardExpiryChange}
                />
              </View>
              <View style={[styles.modalInputGroup, { flex: 1 }]}>
                <Text style={styles.modalInputLabel}>Card Type</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Visa / Mastercard"
                  placeholderTextColor="#AAA"
                  value={cardType}
                  onChangeText={setCardType}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.saveModalBtn}
              disabled={savingPayment}
              onPress={async () => {
                const cleanNum = cardNumber.replace(/\D/g, '');
                if (cleanNum.length < 13 || cleanNum.length > 16) {
                  Alert.alert('Error', 'Please enter a valid card number (13 to 16 digits).');
                  return;
                }
                const cleanExpiry = cardExpiry.replace(/\D/g, '');
                if (cleanExpiry.length !== 4) {
                  Alert.alert('Error', 'Please enter a valid expiry date in MM/YY format.');
                  return;
                }
                const expMonth = parseInt(cleanExpiry.slice(0, 2), 10);
                if (expMonth < 1 || expMonth > 12) {
                  Alert.alert('Error', 'Please enter a valid month (01 to 12).');
                  return;
                }
                const formattedExpiry = `${cleanExpiry.slice(0, 2)}/${cleanExpiry.slice(2)}`;
                const last4Digits = cleanNum.slice(-4);
                setSavingPayment(true);
                try {
                  await savePaymentMethod({
                    title: `${cardType || 'Card'} ● ● ● ● ${last4Digits}`,
                    last4: last4Digits,
                    cardType: cardType || 'Visa',
                    expiry: formattedExpiry,
                    type: 'card'
                  });
                  closePaymentModal();
                  fetchProfile();
                } catch (e) {
                  Alert.alert('Error', 'Failed to save payment method.');
                } finally {
                  setSavingPayment(false);
                }
              }}
            >
              {savingPayment ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveModalBtnText}>Save card</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelModalBtn}
              onPress={closePaymentModal}
            >
              <Text style={styles.cancelModalBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomerBottomTab activeTab="Profile" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  backBtn: { padding: 4 },
  scroll: { padding: 16, paddingBottom: 40 },
  
  userCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  avatar: { width: 65, height: 65, borderRadius: 32.5 },
  userInfo: { flex: 1, marginLeft: 15 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  userMeta: { fontSize: 13, color: '#888', marginTop: 2 },
  editBtn: { padding: 8 },

  loyaltyCard: {
    backgroundColor: '#FF8C00',
    borderRadius: 20,
    padding: 24,
    marginBottom: 25,
    alignItems: 'flex-start',
  },
  loyaltyLabel: { color: '#FFF', fontSize: 16, marginTop: 15, opacity: 0.9 },
  loyaltyPoints: { color: '#FFF', fontSize: 48, fontWeight: '900', marginTop: 5 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  addText: { fontSize: 13, color: '#FF8C00', fontWeight: 'bold' },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 25,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  defaultBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  defaultText: { fontSize: 10, color: '#2E7D32', fontWeight: 'bold' },
  addressText: { fontSize: 13, color: '#888', marginTop: 4, lineHeight: 18 },
  addressActions: { flexDirection: 'row', gap: 12 },
  setDefaultText: { fontSize: 12, color: '#FF8C00', marginTop: 6, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 8 },

  paymentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  paymentName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  paymentMeta: { fontSize: 12, color: '#888', marginTop: 2 },

  cardContainer: { marginBottom: 25 },
  containerTitle: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12, paddingHorizontal: 4 },
  prefRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  prefTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  prefSubtitle: { fontSize: 11, color: '#AAA', marginTop: 2 },

  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  optionSubtitle: { fontSize: 12, color: '#AAA', marginTop: 2 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF5252',
    borderRadius: 12,
    padding: 15,
  },
  logoutText: { color: '#FF5252', fontSize: 16, fontWeight: 'bold' },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    position: 'relative'
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 10
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20
  },
  modalInputGroup: {
    marginBottom: 16
  },
  modalInputLabel: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 8,
    fontWeight: '500'
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#FFF'
  },
  saveModalBtn: {
    backgroundColor: '#FF7A00',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8
  },
  saveModalBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700'
  },
  cancelModalBtn: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12
  },
  cancelModalBtnText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600'
  },
  referralSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20
  },
  codeBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA'
  },
  codeText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 1.5
  },
  copyBtn: {
    backgroundColor: '#FF7A00',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center'
  },
  copyBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700'
  }
});

export default CustomerProfileScreen;
