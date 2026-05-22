import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const menuItems = [
  { id: 1, name: 'Suya Platter', desc: 'Spicy grilled beef skewers with onions', price: '₦3,500', stock: '8 left', available: true },
  { id: 2, name: 'Pepper Soup', desc: 'Spicy grilled beef skewers with onions', price: '₦3,500', stock: 'Out', available: false },
  { id: 3, name: 'Suya Platter', desc: 'Spicy grilled beef skewers with onions', price: '₦3,500', stock: '8 left', available: true },
  { id: 4, name: 'Suya Platter', desc: 'Spicy grilled beef skewers with onions', price: '₦3,500', stock: '8 left', available: true },
  { id: 5, name: 'Puff Puff (6pcs)', desc: 'Sweet, fluffy fried dough', price: '₦1,000', stock: '3 left', available: true },
];

const categories = ['All', 'Rice', 'Soups', 'Grills', 'Drinks', 'Snacks'];

const MenuScreen = () => {
  const [selectedCat, setSelectedCat] = useState('All');
  const [items, setItems] = useState(menuItems);

  const toggleAvailable = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, available: !item.available } : item));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#000" />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Menu</Text>
          <Text style={styles.headerSub}>Available items for order</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#999" />
          <Text style={styles.searchPlaceholder}>Search items...</Text>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catPill, selectedCat === cat && styles.catPillActive]}
              onPress={() => setSelectedCat(cat)}
            >
              <Text style={[styles.catText, selectedCat === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Mark all unavailable */}
        <TouchableOpacity style={styles.markAllBtn}>
          <Text style={styles.markAllText}>Mark all items unavailable</Text>
        </TouchableOpacity>

        {/* Items */}
        {items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemImagePlaceholder}>
              <Ionicons name="fast-food-outline" size={28} color="#ccc" />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDesc} numberOfLines={1}>{item.desc}</Text>
              <View style={styles.itemBottom}>
                <Text style={styles.itemPrice}>{item.price}</Text>
                {item.stock === 'Out'
                  ? <View style={styles.outBadge}><Text style={styles.outText}>Out</Text></View>
                  : <Text style={styles.itemStock}>{item.stock}</Text>}
              </View>
            </View>
            <View style={styles.itemActions}>
              <Switch
                value={item.available}
                onValueChange={() => toggleAvailable(item.id)}
                trackColor={{ true: Colors.primary, false: '#ccc' }}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
              <View style={styles.actionIcons}>
                <TouchableOpacity><Ionicons name="create-outline" size={20} color="#666" /></TouchableOpacity>
                <TouchableOpacity><Ionicons name="trash-outline" size={20} color="#E74C3C" /></TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#EEE' },
  headerText: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  headerSub: { fontSize: 12, color: '#888' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, gap: 4 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  scroll: { padding: 16, paddingBottom: 100 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, gap: 10, marginBottom: 16, borderWidth: 1, borderColor: '#EEE' },
  searchPlaceholder: { color: '#bbb', fontSize: 15 },
  catScroll: { marginBottom: 16 },
  catPill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EEE', marginRight: 10 },
  catPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: 14, color: '#555' },
  catTextActive: { color: '#fff', fontWeight: 'bold' },
  markAllBtn: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 20 },
  markAllText: { color: Colors.primary, fontWeight: '600' },
  itemCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center', elevation: 1 },
  itemImagePlaceholder: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemInfo: { flex: 1 },
  itemName: { fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  itemDesc: { color: '#888', fontSize: 12, marginBottom: 6 },
  itemBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemPrice: { color: Colors.primary, fontWeight: 'bold', fontSize: 14 },
  outBadge: { backgroundColor: '#FFE0B2', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  outText: { color: Colors.primary, fontSize: 11, fontWeight: '600' },
  itemStock: { color: '#888', fontSize: 12 },
  itemActions: { alignItems: 'center', gap: 8 },
  actionIcons: { flexDirection: 'row', gap: 10 },
});

export default MenuScreen;
