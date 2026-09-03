import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Dimensions, Platform, Alert, StatusBar, Modal, KeyboardAvoidingView, Linking
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useCart } from '../context/CartContext';
import { getCustomerProfile, placeCustomerOrder, saveAddress, savePaymentMethod, initFlutterwaveCheckout, verifyFlutterwaveCheckout } from '../services/api';
import * as WebBrowser from 'expo-web-browser';

const { width, height } = Dimensions.get('window');

const CheckoutScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { cartItems, restaurantId, getTotal, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('saved-0');
  const [selectedPaymentId, setSelectedPaymentId] = useState('flutterwave');
  const [profile, setProfile] = useState(null);
  
  const isCardExpired = (expiryStr) => {
    if (!expiryStr) return false;
    const cleanExpiry = String(expiryStr).replace(/\D/g, '');
    if (cleanExpiry.length !== 4) return false;
    const expMonth = parseInt(cleanExpiry.slice(0, 2), 10);
    const expYear = parseInt(cleanExpiry.slice(2), 10);
    if (isNaN(expMonth) || isNaN(expYear)) return false;
    const now = new Date();
    const currentYear = parseInt(now.getFullYear().toString().slice(-2), 10);
    const currentMonth = now.getMonth() + 1;
    return expYear < currentYear || (expYear === currentYear && expMonth < currentMonth);
  };

  const getCardBrand = (num) => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'Mastercard';
    if (/^50[6-7]|^650/.test(clean)) return 'Verve';
    return 'Card';
  };

  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'flutterwave', type: 'card', title: 'Flutterwave Checkout (Card / Transfer / USSD)', sub: 'Pay securely via Flutterwave', icon: 'card-outline' }
  ]);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('address'); 
  const [addressValue, setAddressValue] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [modalLoading, setModalLoading] = useState(false);

  const handleCardNumberChange = (val) => {
    // Only numbers, max 16 digits, auto-formatted with spaces XXXX XXXX XXXX XXXX
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardDetails(prev => ({ ...prev, number: formatted }));
  };

  const handleExpiryChange = (val) => {
    // Only numbers, max 4 digits (MMYY), auto-formatted as MM/YY
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    let formatted = cleaned;
    if (cleaned.length >= 3) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    setCardDetails(prev => ({ ...prev, expiry: formatted }));
  };

  const handleCvvChange = (val) => {
    // Only numbers, max 4 digits
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    setCardDetails(prev => ({ ...prev, cvv: cleaned }));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getCustomerProfile();
      if (res.success) {
        const profileData = res.data;
        setProfile(profileData);
        let addrList = [];
        if (profileData.addresses && profileData.addresses.length > 0) {
          addrList = profileData.addresses;
        } else if (profileData.address) {
          addrList = [{ id: 'saved-0', label: 'Primary', tag: 'Default', addr: profileData.address }];
        }
        setAddresses(addrList);
        if (addrList.length > 0) setSelectedAddressId(addrList[0].id || addrList[0]._id);

        const flwOption = { id: 'flutterwave', type: 'card', title: 'Flutterwave Checkout (Card / Transfer / USSD)', sub: 'Pay securely via Flutterwave', icon: 'card-outline' };

        if (profileData.paymentMethods && profileData.paymentMethods.length > 0) {
          const remotePayments = profileData.paymentMethods.map(p => ({
            ...p,
            id: p.id || p._id,
            title: p.title || `${p.cardType || 'Card'} ●●●● ${p.last4 || '••••'}`,
            sub: p.expiry ? `Expires ${p.expiry}` : (p.sub || 'Saved Card'),
            expiry: p.expiry,
            icon: 'card-outline'
          }));
          setPaymentMethods([flwOption, ...remotePayments]);
        } else {
          setPaymentMethods([flwOption]);
        }
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
  };

  const handleSaveModal = async () => {
    setModalLoading(true);
    try {
      if (modalType === 'address') {
        if (!addressValue.trim()) throw new Error('Address is required');
        const newId = `saved-${Date.now()}`;
        const newAddr = { id: newId, label: 'Other', addr: addressValue };
        await saveAddress(newAddr);
        setAddresses([...addresses, newAddr]);
        setSelectedAddressId(newId);
        setAddressValue('');
      } else {
        const { number, expiry, cvv } = cardDetails;
        const cleanNum = number.replace(/\D/g, '');
        if (!cleanNum || cleanNum.length < 13 || cleanNum.length > 19) {
          throw new Error('Please enter a valid card number (13 to 19 digits)');
        }
        const cleanExpiry = expiry.replace(/\D/g, '');
        if (!cleanExpiry || cleanExpiry.length !== 4) {
          throw new Error('Please enter a valid expiry date (MM/YY)');
        }
        const expMonth = parseInt(cleanExpiry.slice(0, 2), 10);
        const expYear = parseInt(cleanExpiry.slice(2), 10);
        if (expMonth < 1 || expMonth > 12) {
          throw new Error('Please enter a valid month (01-12)');
        }
        
        // Strict card expiration validation
        const now = new Date();
        const currentYear = parseInt(now.getFullYear().toString().slice(-2), 10);
        const currentMonth = now.getMonth() + 1;
        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
          throw new Error('This ATM card has expired. Please use a valid, active card.');
        }

        const cleanCvv = cvv.replace(/\D/g, '');
        if (!cleanCvv || cleanCvv.length < 3 || cleanCvv.length > 4) {
          throw new Error('Please enter a valid 3 or 4 digit CVV');
        }

        const formattedExpiry = `${cleanExpiry.slice(0, 2)}/${cleanExpiry.slice(2)}`;
        const last4 = cleanNum.slice(-4);
        const cardBrand = getCardBrand(cleanNum);
        const newId = `card-${Date.now()}`;
        const newPay = { 
          id: newId, 
          type: 'card', 
          cardType: cardBrand,
          last4,
          expiry: formattedExpiry,
          title: `${cardBrand} ●●●● ${last4}`, 
          sub: `Expires ${formattedExpiry}`, 
          icon: 'card-outline' 
        };
        await savePaymentMethod(newPay);
        setPaymentMethods(prev => [newPay, ...prev]);
        setSelectedPaymentId(newId);
        setCardDetails({ number: '', expiry: '', cvv: '' });
      }
      setShowModal(false);
    } catch (err) {
      Alert.alert('Card Error', err.message || 'Failed to save details');
    } finally {
      setModalLoading(false);
    }
  };

  const rawSubtotal = getTotal();
  const subtotal = rawSubtotal;
  const deliveryFee = 500;
  const serviceFee = 200;
  const total = subtotal + deliveryFee + serviceFee;

  const handlePlaceOrder = async () => {
    if (!cartItems || cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before placing an order');
      return;
    }

    const selectedAddrObj = addresses.find(a => (a.id || a._id) === selectedAddressId) || addresses[0];
    if (!selectedAddrObj || !selectedAddrObj.addr) {
      Alert.alert('Address Required', 'Please add or select a delivery address first');
      return;
    }

    // Check if the chosen payment method is an expired card
    const selectedMethod = paymentMethods.find(m => (m.id || m._id) === selectedPaymentId);
    if (selectedMethod && isCardExpired(selectedMethod.expiry || selectedMethod.sub)) {
      Alert.alert('Card Expired', 'The selected card has expired. Please select another payment method or add a valid card.');
      return;
    }
    
    setLoading(true);
    try {
      const orderPayload = {
        vendorId: restaurantId,
        items: cartItems.map(item => {
          let price = item.price;
          if (typeof price === 'string') {
            price = parseFloat(price.replace(/,/g, '')) || 0;
          }
          return {
            menuItemId: item.id || item._id,
            name: item.name,
            price: price,
            quantity: item.quantity
          };
        }),
        totalAmount: total,
        deliveryAddress: selectedAddrObj.addr,
        customerName: profile?.name || "Customer",
        customerPhone: profile?.phone || "08123456789"
      };

      // Handle Flutterwave Hosted Checkout
      if (selectedPaymentId === 'flutterwave') {
        const flwRes = await initFlutterwaveCheckout({
          amount: total,
          email: profile?.email || 'customer@denishng.com',
          name: profile?.name || 'Denish Customer',
          phone: profile?.phone || '08123456789',
          orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`
        });

        if (flwRes.success && flwRes.data?.link) {
          try {
            await WebBrowser.openBrowserAsync(flwRes.data.link);
          } catch (e) {
            await Linking.openURL(flwRes.data.link);
          }
          
          // Verify live payment transaction status
          const verifyRes = await verifyFlutterwaveCheckout({ tx_ref: flwRes.data.tx_ref });
          if (!verifyRes.success || verifyRes.data?.status !== 'successful') {
            throw new Error('Payment was not completed on Flutterwave');
          }
        } else {
          throw new Error('Could not generate Flutterwave payment link');
        }
      }

      // Place the verified order
      const res = await placeCustomerOrder(orderPayload);
      if (res && res.success) {
        clearCart();
        const createdOrderId = res.data?._id || res.data?.orderId || res.data?.id || 'ORD-NEW';
        Alert.alert('Order Placed Successfully 🎉', 'Your payment was successful and your order has been confirmed!', [
          {
            text: 'Track Order',
            onPress: () => navigation.navigate('TrackOrder', { orderId: createdOrderId })
          }
        ]);
        if (Platform.OS === 'web') {
          navigation.navigate('TrackOrder', { orderId: createdOrderId });
        }
      } else {
        throw new Error(res?.message || res?.error || 'Failed to place order');
      }
    } catch (err) {
      console.error('Place order error:', err);
      Alert.alert('Checkout Error', err.message || 'Something went wrong while placing order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 140 }]}>
        {/* Delivery Address Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="location-outline" size={18} color={Colors.primary} />
          <Text style={styles.sectionLabel}>Delivery address</Text>
        </View>
        <View style={styles.card}>
          {addresses.map((addr) => (
            <TouchableOpacity 
              key={addr.id || addr._id} 
              style={[styles.addressItem, selectedAddressId === (addr.id || addr._id) && styles.selectedItem]}
              onPress={() => setSelectedAddressId(addr.id || addr._id)}
            >
              <View style={styles.radioContainer}>
                <View style={[styles.radio, selectedAddressId === (addr.id || addr._id) && styles.radioActive]}>
                  {selectedAddressId === (addr.id || addr._id) && <View style={styles.radioInner} />}
                </View>
              </View>
              <View style={styles.addressInfo}>
                <View style={styles.labelRow}>
                  <Text style={styles.addressLabel}>{addr.label}</Text>
                  {addr.tag && <Text style={styles.defaultTag}>{addr.tag}</Text>}
                </View>
                <Text style={styles.addressText} numberOfLines={1}>{addr.addr}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addBtn} onPress={() => { setModalType('address'); setShowModal(true); }}>
            <Text style={styles.addBtnText}>+ Add new address</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Method Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="wallet-outline" size={18} color={Colors.primary} />
          <Text style={styles.sectionLabel}>Payment method</Text>
        </View>
        <View style={styles.card}>
          {paymentMethods.map((method) => {
            const methodId = method.id || method._id;
            const expired = isCardExpired(method.expiry || method.sub);
            return (
              <TouchableOpacity 
                key={methodId}
                style={[
                  styles.payOption, 
                  selectedPaymentId === methodId && styles.selectedItem,
                  expired && { opacity: 0.6, backgroundColor: '#FFF5F5' }
                ]}
                onPress={() => {
                  if (expired) {
                    Alert.alert('Card Expired', 'This card has expired and cannot be used. Please choose another payment method or add an active card.');
                    return;
                  }
                  setSelectedPaymentId(methodId);
                }}
              >
                <Ionicons name={method.icon} size={20} color={expired ? '#E53E3E' : Colors.primary} />
                <View style={styles.payInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.payTitle, expired && { color: '#E53E3E' }]}>{method.title}</Text>
                    {expired && (
                      <View style={{ backgroundColor: '#FED7D7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontSize: 10, color: '#C53030', fontWeight: '700' }}>Expired</Text>
                      </View>
                    )}
                  </View>
                  {method.sub ? <Text style={[styles.paySub, expired && { color: '#E53E3E' }]}>{method.sub}</Text> : null}
                </View>
                <View style={[styles.radio, selectedPaymentId === methodId && styles.radioActive, expired && { borderColor: '#E2E8F0' }]}>
                  {selectedPaymentId === methodId && !expired && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.addBtn} onPress={() => { setCardDetails({ number: '', expiry: '', cvv: '' }); setModalType('payment'); setShowModal(true); }}>
            <Text style={styles.addBtnText}>+ Add new card</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₦{subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>₦{deliveryFee.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service fee</Text>
            <Text style={styles.summaryValue}>₦{serviceFee.toLocaleString()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₦{total.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 25) }]}>
        <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder} disabled={loading}>
          {loading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator color="#FFF" />
              <Text style={[styles.placeOrderBtnText, { marginLeft: 10 }]}>Placing order...</Text>
            </View>
          ) : (
            <Text style={styles.placeOrderBtnText}>Place order ₦{total.toLocaleString()}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Cross-platform Input Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalType === 'address' ? 'Add Address' : 'Add Card Details'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {modalType === 'address' ? (
              <TextInput
                style={styles.modalInput}
                placeholder="Enter full delivery address"
                value={addressValue}
                onChangeText={setAddressValue}
                multiline
                autoFocus
              />
            ) : (
              <View style={styles.cardInputContainer}>
                <View style={styles.inputRow}>
                  <Ionicons name="card-outline" size={20} color="#999" />
                  <TextInput
                    style={styles.cardInput}
                    placeholder="Card Number"
                    value={cardDetails.number}
                    onChangeText={handleCardNumberChange}
                    keyboardType="number-pad"
                    maxLength={19}
                  />
                </View>
                <View style={styles.row}>
                  <View style={[styles.inputRow, { flex: 1, marginRight: 10 }]}>
                    <TextInput
                      style={styles.cardInput}
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChangeText={handleExpiryChange}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                  <View style={[styles.inputRow, { flex: 1 }]}>
                    <TextInput
                      style={styles.cardInput}
                      placeholder="CVV"
                      value={cardDetails.cvv}
                      onChangeText={handleCvvChange}
                      keyboardType="number-pad"
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.saveBtn, ((modalType === 'address' && !addressValue) || (modalType === 'payment' && !cardDetails.number)) && { opacity: 0.6 }]} 
              onPress={handleSaveModal}
              disabled={modalLoading}
            >
              {modalLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Details</Text>}
            </TouchableOpacity>
            {/* Safe area for modal on iPhone bottom */}
            <View style={{ height: insets.bottom + 10 }} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 60, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  backBtn: { padding: 4 },
  scroll: { padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 15 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 8, gap: 8 },
  addressItem: { flexDirection: 'row', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F8F9FA', alignItems: 'center' },
  selectedItem: { backgroundColor: '#FFF7F0', borderColor: Colors.primary },
  radioContainer: { marginRight: 12 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#EEE', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: Colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  addressInfo: { flex: 1 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  addressLabel: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  defaultTag: { fontSize: 10, color: Colors.primary, backgroundColor: '#FFF2F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: '600' },
  addressText: { fontSize: 12, color: '#999' },
  addBtn: { paddingVertical: 10, paddingHorizontal: 4 },
  addBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  payOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F8F9FA' },
  payInfo: { flex: 1, marginLeft: 12 },
  payTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  paySub: { fontSize: 12, color: '#999', marginTop: 1 },
  summaryCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginTop: 25, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 14, color: '#999', fontWeight: '500' },
  summaryValue: { fontSize: 15, color: '#1a1a1a', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', padding: 16, borderTopWidth: 1, borderColor: '#F0F0F0' },
  placeOrderBtn: { backgroundColor: Colors.primary, padding: 18, borderRadius: 15, alignItems: 'center' },
  placeOrderBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 24, minHeight: 350 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  modalInput: { backgroundColor: '#F7F8F9', borderRadius: 12, padding: 16, fontSize: 15, color: '#333', textAlignVertical: 'top', minHeight: 80, marginBottom: 24 },
  
  cardInputContainer: { marginBottom: 24 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F8F9', borderRadius: 12, paddingHorizontal: 16, height: 50, marginBottom: 12 },
  cardInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#333' },
  row: { flexDirection: 'row' },

  saveBtn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default CheckoutScreen;
