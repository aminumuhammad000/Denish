import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { getCustomerRestaurantDetails } from '../services/api';
import { useCart } from '../context/CartContext';

const CustomerRestaurantScreen = ({ route, navigation }) => {
  const { restaurantId = 'demo' } = route?.params || {};
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { cartItems, addToCart, getTotal } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCustomerRestaurantDetails(restaurantId);
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [restaurantId]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!data || !data.vendor) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Restaurant not found</Text>
      </SafeAreaView>
    );
  }

  const { vendor, menu } = data;
  const totalCartItems = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image 
            source={{ uri: vendor.coverUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800' }} 
            style={styles.bannerImage} 
          />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.restaurantName}>{vendor.businessName || vendor.name}</Text>
          <Text style={styles.restaurantTags}>Local &bull; Rice &bull; Spicy</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Ionicons name="star" size={14} color="#f5c518" />
              <Text style={styles.metaText}>4.8 (120+)</Text>
            </View>
            <View style={styles.metaBadge}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.metaText}>25-35 min</Text>
            </View>
            <View style={styles.metaBadge}>
              <Ionicons name="bicycle-outline" size={14} color="#666" />
              <Text style={styles.metaText}>₦500 delivery</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {menu.map((section, idx) => (
          <View key={idx} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.category}</Text>
            {section.data.map(item => (
              <TouchableOpacity key={item._id} style={styles.menuItem}>
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemName}>{item.name}</Text>
                  <Text style={styles.menuItemDesc} numberOfLines={2}>{item.description}</Text>
                  <Text style={styles.menuItemPrice}>₦{item.price.toLocaleString()}</Text>
                </View>
                <View style={styles.menuItemImageContainer}>
                  <Image source={{ uri: item.image || 'https://via.placeholder.com/150' }} style={styles.menuItemImage} />
                  <TouchableOpacity 
                    style={styles.addBtn}
                    onPress={() => addToCart(item, vendor._id)}
                  >
                    <Ionicons name="add" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Floating View Cart Button */}
      {totalCartItems > 0 && (
        <View style={styles.cartFloatingContainer}>
          <TouchableOpacity style={styles.cartBtn} onPress={() => navigation?.navigate('Checkout')}>
            <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{totalCartItems}</Text></View>
            <Text style={styles.cartBtnText}>View your cart</Text>
            <Text style={styles.cartBtnPrice}>₦{getTotal().toLocaleString()}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  bannerContainer: { height: 200, backgroundColor: '#333', justifyContent: 'flex-start', position: 'relative' },
  bannerImage: { width: '100%', height: '100%', position: 'absolute' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', margin: 16, marginTop: 40 },
  infoContainer: { padding: 16, borderBottomWidth: 8, borderColor: '#FAFAFA' },
  restaurantName: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  restaurantTags: { fontSize: 14, color: '#888', marginBottom: 12 },
  metaRow: { flexDirection: 'row', gap: 12 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, fontWeight: '600', color: '#444' },
  menuSection: { padding: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 16 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  menuItemInfo: { flex: 1, paddingRight: 16 },
  menuItemName: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  menuItemDesc: { fontSize: 13, color: '#888', marginBottom: 8, lineHeight: 18 },
  menuItemPrice: { fontSize: 14, fontWeight: 'bold', color: Colors.primary },
  menuItemImageContainer: { width: 90, height: 90, borderRadius: 12, backgroundColor: '#F0F0F0', overflow: 'hidden' },
  menuItemImage: { width: '100%', height: '100%' },
  addBtn: { position: 'absolute', bottom: 4, right: 4, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  cartFloatingContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#EEE' },
  cartBtn: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12 },
  cartBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cartBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  cartBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, flex: 1 },
  cartBtnPrice: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default CustomerRestaurantScreen;
