import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Dimensions, StatusBar, Modal, TextInput, Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { getCustomerRestaurantDetails } from '../services/api';
import { useCart } from '../context/CartContext';

const { width, height } = Dimensions.get('window');

const CustomerRestaurantScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { restaurantId = 'demo' } = route?.params || {};
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  // Item Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  
  const { addToCart, getTotal, cartItems } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCustomerRestaurantDetails(restaurantId);
        if (response.success) {
          setData(response.data);
          if (response.data.menu?.length > 0) {
            setActiveCategory(response.data.menu[0].category);
          }
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
      <View style={[styles.centered, { backgroundColor: '#FFF' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!data || !data.vendor) {
    return (
      <View style={styles.centered}>
        <Text>Restaurant not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { vendor, menu } = data;
  const totalCartItems = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const filteredItems = menu.find(m => m.category === activeCategory)?.data || [];

  const openItemDetails = (item) => {
    setSelectedItem(item);
    setItemQuantity(1);
    setInstructions('');
    setItemModalVisible(true);
  };

  const handleAddToCart = () => {
    addToCart(selectedItem, vendor._id, itemQuantity, instructions);
    setItemModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: vendor.coverUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' }} 
            style={styles.heroImage} 
          />
          <TouchableOpacity 
            style={[styles.backBtn, { top: insets.top + 10 }]} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoTopRow}>
            <View>
              <Text style={styles.restaurantName}>{vendor.businessName || vendor.name}</Text>
              <Text style={styles.restaurantCategory}>{vendor.category || 'Local Dishes'}</Text>
            </View>
            <View style={styles.openBadge}>
              <Text style={styles.openText}>OPEN</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.metaValue}>4.8</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#999" />
              <Text style={styles.metaValue}>25-35 min</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="currency-ngn" size={14} color="#999" />
              <Text style={styles.metaValue}>500</Text>
            </View>
          </View>
        </View>

        {/* Category Chips */}
        <View style={styles.categorySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {menu.map(m => (
              <TouchableOpacity 
                key={m.category} 
                style={[styles.categoryChip, activeCategory === m.category && styles.activeCategoryChip]}
                onPress={() => setActiveCategory(m.category)}
              >
                <Text style={[styles.categoryText, activeCategory === m.category && styles.activeCategoryText]}>
                  {m.category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {filteredItems.map(item => (
            <TouchableOpacity key={item._id} style={styles.itemCard} onPress={() => openItemDetails(item)}>
              <Image source={{ uri: item.image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?w=400' }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc} numberOfLines={2}>{item.description || 'Authentic flavor, made with fresh local ingredients.'}</Text>
                <Text style={styles.itemPrice}>₦{item.price.toLocaleString()}</Text>
              </View>
              <View style={styles.addBtn}>
                <Ionicons name="add" size={20} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Item Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={itemModalVisible}
        onRequestClose={() => setItemModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalCloseOverlay} onPress={() => setItemModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalKnob} />
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Image 
                source={{ uri: selectedItem?.image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?w=400' }} 
                style={styles.modalItemImage} 
              />
              
              <View style={styles.modalTextContent}>
                <Text style={styles.modalItemName}>{selectedItem?.name}</Text>
                <Text style={styles.modalItemDesc}>{selectedItem?.description || 'Authentic flavor, made with fresh local ingredients and traditional recipes.'}</Text>
                <Text style={styles.modalItemPrice}>₦{selectedItem?.price?.toLocaleString()}</Text>

                <View style={styles.instructionsContainer}>
                  <TextInput
                    style={styles.instructionInput}
                    placeholder="e.g. extra spicy, no onions"
                    placeholderTextColor="#BBB"
                    multiline
                    value={instructions}
                    onChangeText={setInstructions}
                  />
                </View>

                <View style={styles.quantityRow}>
                  <Text style={styles.quantityLabel}>Quantity</Text>
                  <View style={styles.quantitySelector}>
                    <TouchableOpacity 
                      style={styles.qtyBtn} 
                      onPress={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                    >
                      <Ionicons name="remove" size={20} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{itemQuantity}</Text>
                    <TouchableOpacity 
                      style={[styles.qtyBtn, { backgroundColor: '#FFF2F0' }]} 
                      onPress={() => setItemQuantity(itemQuantity + 1)}
                    >
                      <Ionicons name="add" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.modalAddBtn}
                  onPress={handleAddToCart}
                >
                  <Text style={styles.modalAddBtnText}>
                    Add {itemQuantity} for ₦{(selectedItem?.price * itemQuantity).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Cart Bar */}
      {totalCartItems > 0 && (
        <SafeAreaView edges={['bottom']} style={styles.bottomBarContainer}>
          <TouchableOpacity 
            style={styles.viewCartBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <View style={styles.cartBtnLeft}>
              <View style={styles.cartIconBadge}>
                <MaterialCommunityIcons name="cart-outline" size={20} color="#FFF" />
                <View style={styles.badgeSmall}><Text style={styles.badgeSmallText}>{totalCartItems}</Text></View>
              </View>
              <Text style={styles.viewCartText}>View cart</Text>
            </View>
            <Text style={styles.totalPriceText}>₦{getTotal().toLocaleString()}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFBFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroContainer: { width: width, height: 250, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  backBtn: { 
    position: 'absolute', 
    left: 20, 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#FFF', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  infoCard: { 
    backgroundColor: '#FFF', 
    marginHorizontal: 20, 
    borderRadius: 24, 
    padding: 20, 
    marginTop: -50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  infoTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  restaurantName: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  restaurantCategory: { fontSize: 13, color: '#999', marginTop: 2 },
  openBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  openText: { color: '#22C55E', fontSize: 11, fontWeight: 'bold' },
  metaRow: { flexDirection: 'row', gap: 20, borderTopWidth: 1, borderTopColor: '#FDFDFD', paddingTop: 15 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaValue: { fontSize: 13, fontWeight: '700', color: '#666' },
  
  categorySection: { marginTop: 25 },
  categoryScroll: { paddingHorizontal: 20, gap: 12 },
  categoryChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE' },
  activeCategoryChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryText: { fontSize: 14, fontWeight: '600', color: '#666' },
  activeCategoryText: { color: '#FFF' },

  menuContainer: { padding: 20, gap: 16 },
  itemCard: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 12, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  itemImage: { width: 90, height: 90, borderRadius: 16 },
  itemInfo: { flex: 1, marginLeft: 15, paddingRight: 10 },
  itemName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  itemDesc: { fontSize: 12, color: '#999', marginTop: 4, lineHeight: 18 },
  itemPrice: { fontSize: 15, fontWeight: '800', color: Colors.primary, marginTop: 8 },
  addBtn: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#FFF2F0', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  // Modal Styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'flex-end', 
  },
  modalCloseOverlay: { ...StyleSheet.absoluteFillObject },
  modalContent: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    width: '100%',
    maxHeight: height * 0.75,
    overflow: 'hidden',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20
  },
  modalKnob: { 
    width: 35, 
    height: 4, 
    borderRadius: 2, 
    backgroundColor: '#EEE', 
    alignSelf: 'center', 
    marginVertical: 10 
  },
  modalItemImage: { 
    width: '100%', 
    height: 140, 
    resizeMode: 'cover'
  },
  modalTextContent: { padding: 16 },
  modalItemName: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  modalItemDesc: { fontSize: 13, color: '#888', marginTop: 4, lineHeight: 18 },
  modalItemPrice: { fontSize: 16, fontWeight: '800', color: Colors.primary, marginTop: 8 },
  
  instructionsContainer: { 
    marginTop: 15, 
    backgroundColor: '#F9FAFB', 
    borderRadius: 12, 
    padding: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  instructionInput: { fontSize: 13, color: '#333', minHeight: 45, textAlignVertical: 'top' },
  
  quantityRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 20,
    paddingHorizontal: 4
  },
  quantityLabel: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  quantitySelector: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F3F4F6', 
    borderRadius: 15, 
    padding: 4,
    gap: 12
  },
  qtyBtn: { 
    width: 30, 
    height: 30, 
    borderRadius: 8, 
    backgroundColor: '#FFF', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  qtyText: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a', minWidth: 20, textAlign: 'center' },
  
  modalAddBtn: { 
    backgroundColor: Colors.primary, 
    padding: 15, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 20,
  },
  modalAddBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },

  bottomBarContainer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#FFF', 
    paddingHorizontal: 20, 
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#F0F0F0'
  },
  viewCartBtn: { 
    backgroundColor: Colors.primary, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 18, 
    borderRadius: 25, 
    marginBottom: 5,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8
  },
  cartBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  cartIconBadge: { position: 'relative' },
  badgeSmall: { 
    position: 'absolute', 
    top: -5, 
    right: -8, 
    backgroundColor: '#FF4D4D', 
    width: 16, 
    height: 16, 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary
  },
  badgeSmallText: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },
  viewCartText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  totalPriceText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});

export default CustomerRestaurantScreen;
