import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useCart } from '../context/CartContext';
import { placeCustomerOrder } from '../services/api';

const CheckoutScreen = ({ navigation }) => {
  const { cartItems, restaurantId, getTotal, clearCart, removeFromCart, addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        vendorId: restaurantId,
        items: cartItems.map(item => ({
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: getTotal() + 500, // Adding mock delivery fee of 500
        customerName: 'Demo Customer',
        customerPhone: '+2340000000000',
        deliveryAddress: '14 Secretariat Avenue',
      };
      
      const response = await placeCustomerOrder(payload);
      if (response && response.success) {
        clearCart();
        navigation.navigate('CustomerHome');
        // You would typically navigate to an OrderSuccess screen here
      } else {
        setErrorMsg(response.error || 'Checkout failed');
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CustomerHome')}>
            <Text style={styles.buttonText}>Find food</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const subtotal = getTotal();
  const deliveryFee = 500;
  const total = subtotal + deliveryFee;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Your Order</Text>
        
        <View style={styles.card}>
          {cartItems.map((item) => (
            <View key={item._id} style={styles.cartItem}>
              <View style={styles.itemQuantityContainer}>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₦{(item.price * item.quantity).toLocaleString()}</Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => removeFromCart(item._id)}>
                  <Ionicons name="remove" size={16} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => addToCart(item, restaurantId)}>
                  <Ionicons name="add" size={16} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Delivery Details</Text>
        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color={Colors.primary} />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Deliver to</Text>
              <Text style={styles.detailValue}>14 Secretariat Avenue, Ikeja</Text>
            </View>
            <TouchableOpacity><Text style={styles.editText}>Edit</Text></TouchableOpacity>
          </View>
          <View style={[styles.detailRow, { borderTopWidth: 1, borderColor: '#EEE', paddingTop: 12, marginTop: 12 }]}>
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Delivery time</Text>
              <Text style={styles.detailValue}>25-35 min (ASAP)</Text>
            </View>
            <TouchableOpacity><Text style={styles.editText}>Edit</Text></TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Payment</Text>
        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={20} color={Colors.primary} />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Method</Text>
              <Text style={styles.detailValue}>Pay on Delivery (Cash/Transfer)</Text>
            </View>
            <TouchableOpacity><Text style={styles.editText}>Edit</Text></TouchableOpacity>
          </View>
        </View>

        {/* Breakdown */}
        <View style={styles.breakdown}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Subtotal</Text>
            <Text style={styles.breakdownValue}>₦{subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Delivery Fee</Text>
            <Text style={styles.breakdownValue}>₦{deliveryFee.toLocaleString()}</Text>
          </View>
          <View style={[styles.breakdownRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₦{total.toLocaleString()}</Text>
          </View>
        </View>

        {errorMsg ? <Text style={{ color: 'red', textAlign: 'center', marginBottom: 16 }}>{errorMsg}</Text> : null}
        
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} disabled={loading}>
          <Text style={styles.checkoutBtnText}>{loading ? 'Processing...' : 'Place Order'}</Text>
          {!loading && <Text style={styles.checkoutBtnPrice}>₦{total.toLocaleString()}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#EEE' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  clearText: { color: 'red', fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 18, color: '#888', marginTop: 16, marginBottom: 24 },
  button: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  scroll: { padding: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12, marginTop: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#EEE', elevation: 1 },
  cartItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  itemQuantityContainer: { backgroundColor: '#FFF5E6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 12 },
  itemQuantity: { color: Colors.primary, fontWeight: 'bold', fontSize: 14 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#333' },
  itemPrice: { fontSize: 14, color: '#666', marginTop: 4 },
  itemActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  detailInfo: { flex: 1, marginLeft: 12 },
  detailLabel: { fontSize: 12, color: '#888' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 2 },
  editText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  breakdown: { marginTop: 24, paddingHorizontal: 16 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  breakdownLabel: { fontSize: 15, color: '#666' },
  breakdownValue: { fontSize: 15, fontWeight: '600', color: '#333' },
  totalRow: { borderTopWidth: 1, borderColor: '#DDD', paddingTop: 16, marginTop: 4 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderColor: '#EEE' },
  checkoutBtn: { backgroundColor: Colors.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12 },
  checkoutBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  checkoutBtnPrice: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

export default CheckoutScreen;
