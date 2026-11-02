import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  ActivityIndicator, Dimensions, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useCart } from '../context/CartContext';
import { getPlatformSettings } from '../services/api';
import { ItemImage } from '../utils/imageUtils';

const { width } = Dimensions.get('window');

const CartScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { 
    cartItems, 
    restaurantId, 
    getTotal, 
    clearCart, 
    removeFromCart, 
    deleteFromCart, 
    addToCart, 
    getOrdersByRestaurant,
    platformSettings 
  } = useCart();
  const [loading, setLoading] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(
    platformSettings?.baseDeliveryFee !== undefined && platformSettings?.baseDeliveryFee !== null
      ? Number(platformSettings.baseDeliveryFee)
      : (platformSettings?.deliveryFee !== undefined && platformSettings?.deliveryFee !== null
          ? Number(platformSettings.deliveryFee)
          : 500)
  );
  const [serviceFee, setServiceFee] = useState(
    platformSettings?.serviceFee !== undefined && platformSettings?.serviceFee !== null
      ? Number(platformSettings.serviceFee)
      : 200
  );

  const orderGroups = useMemo(() => {
    return getOrdersByRestaurant ? getOrdersByRestaurant() : [];
  }, [cartItems, restaurantId, getOrdersByRestaurant]);

  const [selectedRestId, setSelectedRestId] = useState(
    restaurantId || (orderGroups[0]?.restaurantId || null)
  );

  useEffect(() => {
    if (orderGroups.length > 0) {
      const exists = orderGroups.some(g => g.restaurantId === selectedRestId);
      if (!exists) {
        setSelectedRestId(orderGroups[0].restaurantId);
      }
    }
  }, [orderGroups, selectedRestId]);

  useEffect(() => {
    let isMounted = true;
    const fetchFees = async () => {
      try {
        const platRes = await getPlatformSettings();
        if (platRes?.success && platRes.settings && isMounted) {
          if (platRes.settings.serviceFee !== undefined && platRes.settings.serviceFee !== null) {
            const parsedServiceFee = Number(platRes.settings.serviceFee);
            if (!isNaN(parsedServiceFee)) {
              setServiceFee(parsedServiceFee);
            }
          }
          const platDeliveryFee = platRes.settings.baseDeliveryFee ?? platRes.settings.deliveryFee;
          if (platDeliveryFee !== undefined && platDeliveryFee !== null) {
            const parsedBaseFee = Number(platDeliveryFee);
            if (!isNaN(parsedBaseFee)) {
              setDeliveryFee(parsedBaseFee);
            }
          }
        }
      } catch (e) {
        console.error('Error fetching fees in CartScreen:', e);
      }
    };
    fetchFees();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (platformSettings) {
      const platDeliveryFee = platformSettings.baseDeliveryFee ?? platformSettings.deliveryFee;
      if (platDeliveryFee !== undefined && platDeliveryFee !== null) {
        const parsedBaseFee = Number(platDeliveryFee);
        if (!isNaN(parsedBaseFee)) {
          setDeliveryFee(parsedBaseFee);
        }
      }
      if (platformSettings.serviceFee !== undefined && platformSettings.serviceFee !== null) {
        const parsedServiceFee = Number(platformSettings.serviceFee);
        if (!isNaN(parsedServiceFee)) {
          setServiceFee(parsedServiceFee);
        }
      }
    }
  }, [platformSettings]);

  const currentGroup = orderGroups.find(g => g.restaurantId === selectedRestId) || orderGroups[0];
  const activeItems = currentGroup ? currentGroup.items : cartItems;
  const currentRestId = currentGroup?.restaurantId || restaurantId;
  const currentRestName = currentGroup?.restaurantName || 'Restaurant';

  const subtotal = activeItems.reduce((acc, item) => {
    let price = Number(item.price) || 0;
    return acc + (price * (item.quantity || 1));
  }, 0);
  const total = subtotal + deliveryFee + serviceFee;

  const handleClear = () => {
    if (orderGroups.length > 1 && currentGroup) {
      Alert.alert(
        'Clear Order',
        `Do you want to clear the order for ${currentRestName} or clear all orders?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: `Clear ${currentRestName}`, 
            style: 'destructive',
            onPress: () => clearCart(currentRestId) 
          },
          { 
            text: 'Clear All', 
            style: 'destructive', 
            onPress: () => clearCart() 
          }
        ]
      );
    } else {
      clearCart();
    }
  };

  const handleCheckout = () => {
    if (activeItems.length > 0) {
      navigation.navigate('Checkout', { 
        deliveryFee, 
        serviceFee,
        restaurantId: currentRestId,
        restaurantName: currentRestName,
        items: activeItems
      });
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
          <Text style={styles.headerSubtitle}>
            {orderGroups.length > 1 
              ? `${activeItems.length} items (${currentRestName})` 
              : `${cartItems.length} items`}
          </Text>
        </View>
        <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.clearCartText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Order Selector (when items from multiple orders/restaurants are retained) */}
        {orderGroups.length > 1 && (
          <View style={styles.orderSelectorBox}>
            <View style={styles.orderSelectorHeader}>
              <Text style={styles.orderSelectorTitle}>Your Retained Orders ({orderGroups.length})</Text>
              <Text style={styles.orderSelectorSubtitle}>Select an order to review or place</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.orderTabsScroll}>
              {orderGroups.map((grp, idx) => {
                const isSelected = grp.restaurantId === selectedRestId;
                const count = grp.items.reduce((s, it) => s + (it.quantity || 1), 0);
                return (
                  <TouchableOpacity
                    key={grp.restaurantId || idx}
                    style={[styles.orderTabPill, isSelected && styles.activeOrderTabPill]}
                    onPress={() => setSelectedRestId(grp.restaurantId)}
                  >
                    <Ionicons 
                      name="restaurant" 
                      size={13} 
                      color={isSelected ? '#FFF' : Colors.primary} 
                      style={{ marginRight: 5 }} 
                    />
                    <Text style={[styles.orderTabPillText, isSelected && styles.activeOrderTabPillText]}>
                      {grp.restaurantName} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.orderRetainBanner}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#10B981" />
              <Text style={styles.orderRetainBannerText}>
                Previous order retained! You can place this order without losing your other selected order.
              </Text>
            </View>
          </View>
        )}

        {/* Cart Items */}
        <View style={styles.itemsContainer}>
          {activeItems.map((item, idx) => (
            <View key={`${item._id || item.id || idx}-${idx}`} style={styles.itemCard}>
              <ItemImage item={item} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc} numberOfLines={1}>
                  {item.instructions || item.description || 'Authentic local recipe'}
                </Text>
                <Text style={styles.itemPrice}>₦{Number(item.price)?.toLocaleString()}</Text>
                
                <View style={styles.quantityRow}>
                  <View style={styles.quantitySelector}>
                    <TouchableOpacity 
                      style={styles.qtyBtn} 
                      onPress={() => removeFromCart(item._id || item.id, currentRestId)}
                    >
                      <Ionicons name="remove" size={16} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.qtyBtnPlus} 
                      onPress={() => addToCart(item, currentRestId, 1, item.instructions, currentRestName)}
                    >
                      <Ionicons name="add" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.deleteBtn}
                onPress={() => deleteFromCart(item._id || item.id, currentRestId)}
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
            <Text style={styles.summaryValue}>₦{Number(deliveryFee).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service fee</Text>
            <Text style={styles.summaryValue}>₦{Number(serviceFee).toLocaleString()}</Text>
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
            <Text style={styles.checkoutBtnText}>
              {orderGroups.length > 1 
                ? `Place Order for ${currentRestName} • ₦${total.toLocaleString()}`
                : `Checkout ₦${total.toLocaleString()}`}
            </Text>
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
  clearCartText: { fontSize: 14, fontWeight: '600', color: '#FF4D4D' },
  
  scroll: { padding: 12, paddingBottom: 100 },

  // Multi-order Selector
  orderSelectorBox: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  orderSelectorHeader: {
    marginBottom: 8,
  },
  orderSelectorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  orderSelectorSubtitle: {
    fontSize: 11,
    color: '#747475',
    marginTop: 1,
  },
  orderTabsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  orderTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  activeOrderTabPill: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  orderTabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  activeOrderTabPillText: {
    color: '#FFF',
    fontWeight: '700',
  },
  orderRetainBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#F4F4F4',
    gap: 6,
  },
  orderRetainBannerText: {
    fontSize: 11,
    color: '#059669',
    flex: 1,
  },
  
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
