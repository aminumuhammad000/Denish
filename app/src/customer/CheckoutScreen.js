import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Dimensions, Platform, Alert, StatusBar, Modal, KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useCart } from '../context/CartContext';
import { getCustomerProfile, placeCustomerOrder, saveAddress, savePaymentMethod } from '../services/api';

const { width, height } = Dimensions.get('window');

const CheckoutScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { cartItems, restaurantId, getTotal, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('saved-0');
  const [selectedPaymentId, setSelectedPaymentId] = useState('cash');
  
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'cash', type: 'cash', title: 'Cash on delivery', sub: '', icon: 'cash-outline' }
  ]);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('address'); 
  const [addressValue, setAddressValue] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getCustomerProfile();
      if (res.success) {
        const profile = res.data;
        let addrList = [];
        if (profile.addresses && profile.addresses.length > 0) {
          addrList = profile.addresses;
        } else if (profile.address) {
          addrList = [{ id: 'saved-0', label: 'Primary', tag: 'Default', addr: profile.address }];
        }
        setAddresses(addrList);
        if (addrList.length > 0) setSelectedAddressId(addrList[0].id || addrList[0]._id);

        if (profile.paymentMethods && profile.paymentMethods.length > 0) {
          const remotePayments = profile.paymentMethods.map(p => ({
            ...p,
            id: p.id || p._id
          }));
          setPaymentMethods([...remotePayments, { id: 'cash', type: 'cash', title: 'Cash on delivery', sub: '', icon: 'cash-outline' }]);
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
        const { number, expiry } = cardDetails;
        if (!number || !expiry) throw new Error('Card number and expiry required');
        const last4 = number.slice(-4) || '0000';
        const newId = `card-${Date.now()}`;
        const newPay = { 
          id: newId, 
          type: 'card', 
          title: `Visa ●●●● ${last4}`, 
          sub: `Expires ${expiry}`, 
          icon: 'card-outline' 
        };
        await savePaymentMethod(newPay);
        setPaymentMethods([newPay, ...paymentMethods]);
        setSelectedPaymentId(newId);
        setCardDetails({ number: '', expiry: '', cvv: '' });
      }
      setShowModal(false);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save details');
    } finally {
      setModalLoading(false);
    }
  };

  const subtotal = getTotal();
  const deliveryFee = 500;
  const serviceFee = 200;
  const total = subtotal + deliveryFee + serviceFee;

  const handlePlaceOrder = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      clearCart();
      navigation.navigate('TrackOrder', { orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}` });
    }, 1500);
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
          {paymentMethods.map((method) => (
            <TouchableOpacity 
              key={method.id || method._id}
              style={[styles.payOption, selectedPaymentId === (method.id || method._id) && styles.selectedItem]}
              onPress={() => setSelectedPaymentId(method.id || method._id)}
            >
              <Ionicons name={method.icon} size={20} color="#1a1a1a" />
              <View style={styles.payInfo}>
                <Text style={styles.payTitle}>{method.title}</Text>
                {method.sub ? <Text style={styles.paySub}>{method.sub}</Text> : null}
              </View>
              <View style={[styles.radio, selectedPaymentId === (method.id || method._id) && styles.radioActive]}>
                {selectedPaymentId === (method.id || method._id) && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.addBtn} onPress={() => { setModalType('payment'); setShowModal(true); }}>
            <Text style={styles.addBtnText}>+ Add new payment method</Text>
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
                    onChangeText={(val) => setCardDetails({...cardDetails, number: val})}
                    keyboardType="numeric"
                    maxLength={16}
                  />
                </View>
                <View style={styles.row}>
                  <View style={[styles.inputRow, { flex: 1, marginRight: 10 }]}>
                    <TextInput
                      style={styles.cardInput}
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChangeText={(val) => setCardDetails({...cardDetails, expiry: val})}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  <View style={[styles.inputRow, { flex: 1 }]}>
                    <TextInput
                      style={styles.cardInput}
                      placeholder="CVV"
                      value={cardDetails.cvv}
                      onChangeText={(val) => setCardDetails({...cardDetails, cvv: val})}
                      keyboardType="numeric"
                      maxLength={3}
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
