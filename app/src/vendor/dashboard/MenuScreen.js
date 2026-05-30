import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Switch, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { getVendorMenu, toggleVendorMenuItem } from '../../services/api';

const MenuScreen = () => {
  const [selectedCat, setSelectedCat] = useState('All');
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await getVendorMenu();
      if (response.success) {
        setItems(response.data.items || []);
        setCategories(response.data.categories || []);
        setStatus(response.data.status || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isPending = status === 'Pending';

  const toggleAvailable = async (id) => {
    if (isPending) return; // Prevent action if pending
    // Optimistic UI update
    setItems(items.map(item => item._id === id ? { ...item, available: !item.available } : item));
    try {
      await toggleVendorMenuItem(id);
    } catch (err) {
      // Unwind if server fails
      console.error('Failed to toggle', err);
      setItems(items.map(item => item._id === id ? { ...item, available: !item.available } : item));
    }
  };

  const filteredItems = selectedCat === 'All' ? items : items.filter(i => i.category === selectedCat);

  if (loading && items.length === 0) {
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
        <Ionicons name="arrow-back" size={24} color="#000" />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Menu</Text>
          <Text style={styles.headerSub}>Available items for order</Text>
        </View>
        <TouchableOpacity 
          style={[styles.addBtn, isPending && { backgroundColor: '#ccc' }]} 
          disabled={isPending}
        >
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
        {filteredItems.map((item) => (
          <View key={item._id} style={styles.itemCard}>
            <View style={styles.itemImagePlaceholder}>
              <Ionicons name="fast-food-outline" size={28} color="#ccc" />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDesc} numberOfLines={1}>{item.description}</Text>
              <View style={styles.itemBottom}>
                <Text style={styles.itemPrice}>₦{item.price.toLocaleString()}</Text>
                {item.stock === 0
                  ? <View style={styles.outBadge}><Text style={styles.outText}>Out</Text></View>
                  : <Text style={styles.itemStock}>{item.stock} left</Text>}
              </View>
            </View>
            <View style={styles.itemActions}>
              <Switch
                value={item.available}
                onValueChange={() => toggleAvailable(item._id)}
                disabled={isPending}
                trackColor={{ true: Colors.primary, false: '#ccc' }}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
              <View style={styles.actionIcons}>
                <TouchableOpacity disabled={isPending} style={{ opacity: isPending ? 0.4 : 1 }}>
                  <Ionicons name="create-outline" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity disabled={isPending} style={{ opacity: isPending ? 0.4 : 1 }}>
                  <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                </TouchableOpacity>
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
