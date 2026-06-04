import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Dimensions, Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useCart } from '../context/CartContext';
import { placeCustomerOrder } from '../services/api';

const { width } = Dimensions.get('window');

const CartScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { cartItems, restaurantId, getTotal, clearCart, removeFromCart, addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  const subtotal = getTotal();
  const deliveryFee = 500;
  const serviceFee = 200;
  const total = subtotal + deliveryFee + serviceFee;

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      navigation.navigate('Checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Cart</Text>
            <Text style={styles.headerSubtitle}>0 items</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="cart-off" size={80} color="#EEE" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity 
            style={styles.browseBtn} 
            onPress={() => navigation.navigate('CustomerHome')}
          >
            <Text style={styles.browseBtnText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Cart</Text>
          <Text style={styles.headerSubtitle}>{cartItems.length} items</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Cart Items */}
        <View style={styles.itemsContainer}>
          {cartItems.map((item, idx) => (
            <View key={`${item._id}-${idx}`} style={styles.itemCard}>
              <Image 
                source={{ uri: item.image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?w=400' }} 
                style={styles.itemImage} 
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc} numberOfLines={1}>
                  {item.instructions || 'Smoky party-style jollof with chicken'}
                </Text>
                <Text style={styles.itemPrice}>₦{item.price.toLocaleString()}</Text>
                
                <View style={styles.quantityRow}>
                  <View style={styles.quantitySelector}>
                    <TouchableOpacity 
                      style={styles.qtyBtn} 
                      onPress={() => removeFromCart(item._id)}
                    >
                      <Ionicons name="remove" size={16} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.qtyBtnPlus} 
                      onPress={() => addToCart(item, restaurantId)}
                    >
                      <Ionicons name="add" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.deleteBtn}
                onPress={() => removeFromCart(item._id)}
              >
                <Ionicons name="trash-outline" size={18} color="#FF4D4D" />
              </TouchableOpacity>
            </View>
          ))}
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

      {/* Checkout Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity 
          style={styles.checkoutBtn} 
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.checkoutBtnText}>Checkout ₦{total.toLocaleString()}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBFBFC' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    height: 60,
    backgroundColor: '#FFF'
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  headerSubtitle: { fontSize: 12, color: '#999', marginTop: 2 },
  
  scroll: { padding: 12, paddingBottom: 100 },
  
  itemsContainer: { gap: 10 },
  itemCard: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    borderRadius: 14, 
    padding: 10, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  itemImage: { width: 70, height: 70, borderRadius: 10 },
  itemInfo: { flex: 1, marginLeft: 10 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  itemDesc: { fontSize: 11, color: '#AAA', marginTop: 1 },
  itemPrice: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginTop: 4 },
  
  quantityRow: { marginTop: 6 },
  quantitySelector: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F7F8F9', 
    borderRadius: 8, 
    padding: 2,
    alignSelf: 'flex-start',
    gap: 10
  },
  qtyBtn: { width: 26, height: 26, borderRadius: 5, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  qtyBtnPlus: { width: 26, height: 26, borderRadius: 5, backgroundColor: '#FFF2F0', justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 13, fontWeight: 'bold', color: '#1a1a1a', minWidth: 18, textAlign: 'center' },
  
  deleteBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFF5F5', justifyContent: 'center', alignItems: 'center' },
  
  summaryCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 16, 
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 13, color: '#999', fontWeight: '500' },
  summaryValue: { fontSize: 14, color: '#1a1a1a', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F8F8F8', marginVertical: 6 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  totalLabel: { fontSize: 15, fontWeight: '800', color: '#1a1a1a' },
  totalValue: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
  
  footer: { 
    backgroundColor: '#FFF', 
    padding: 12, 
    borderTopWidth: 1,
    borderColor: '#F0F0F0'
  },
  checkoutBtn: { 
    backgroundColor: Colors.primary, 
    padding: 16, 
    borderRadius: 14, 
    alignItems: 'center' 
  },
  checkoutBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 15, color: '#999', marginTop: 12, marginBottom: 20, fontWeight: '600' },
  browseBtn: { backgroundColor: Colors.primary, paddingHorizontal: 25, paddingVertical: 12, borderRadius: 10 },
  browseBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});

export default CartScreen;
