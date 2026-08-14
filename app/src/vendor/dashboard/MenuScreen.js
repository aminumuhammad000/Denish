import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Image, TextInput, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { getVendorMenu, toggleVendorMenuItem } from '../../services/api';

const MenuScreen = ({ navigation }) => {
  const [selectedCat, setSelectedCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMenu();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await getVendorMenu();
      if (response.success) {
        setItems(response.data.items || []);
        const apiCats = response.data.categories || [];
        setCategories(['All', ...apiCats.filter(c => c !== 'All')]);
        setStatus(response.data.status || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isPending = status === 'Pending';

  const handleOpenAdd = () => {
    navigation.navigate('ItemForm', { isEdit: false, categories });
  };

  const handleOpenEdit = (item) => {
    navigation.navigate('ItemForm', { isEdit: true, item, categories });
  };

  const toggleAvailable = async (id) => {
    if (isPending) return;
    setItems(items.map(item => item._id === id ? { ...item, available: !item.available } : item));
    try {
      await toggleVendorMenuItem(id);
    } catch (err) {
      console.error('Failed to toggle', err);
      setItems(items.map(item => item._id === id ? { ...item, available: !item.available } : item));
    }
  };

  const filteredItems = items.filter(item => {
    const matchesCat = selectedCat === 'All' || item.category === selectedCat;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (loading && items.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Menu Management</Text>
          <Text style={styles.headerSub}>Manage your restaurant items</Text>
        </View>
        <TouchableOpacity 
          style={[styles.addBtn, isPending && { opacity: 0.5 }]} 
          disabled={isPending}
          onPress={handleOpenAdd}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your menu..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#BBB"
          />
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

        {/* Items List */}
        {filteredItems.map((item) => (
          <View key={item._id} style={styles.itemCard}>
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
                style={styles.itemImage}
                defaultSource={{ uri: 'https://via.placeholder.com/150' }}
              />
              {!item.available && (
                <View style={styles.unavailableOverlay}>
                  <Text style={styles.unavailableText}>OFF</Text>
                </View>
              )}
            </View>
            
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDesc} numberOfLines={2}>{item.description || 'No description available'}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.itemPrice}>₦{(item.price || 0).toLocaleString()}</Text>
                {item.stock !== undefined && <Text style={styles.stockCount}>{item.stock} in stock</Text>}
              </View>
            </View>

            <View style={styles.actionContainer}>
              <Switch
                value={item.available}
                onValueChange={() => toggleAvailable(item._id)}
                disabled={isPending}
                trackColor={{ true: '#FF8C00', false: '#E0E0E0' }}
                thumbColor={item.available ? '#FFFFFF' : '#F4F4F4'}
                ios_backgroundColor="#E0E0E0"
                style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
              />
              <View style={styles.editButtons}>
                <TouchableOpacity style={styles.miniBtn} onPress={() => handleOpenEdit(item)}>
                  <Ionicons name="create-outline" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.miniBtn}>
                  <Ionicons name="trash-outline" size={16} color="#FF6F61" />
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
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderColor: '#F0F0F0' 
  },
  headerText: { flex: 1, marginLeft: 15 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  headerSub: { fontSize: 12, color: '#888', marginTop: 2 },
  addBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FF8C00', // Coral Color
    borderRadius: 12, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    gap: 6,
    elevation: 2,
  },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  scroll: { padding: 16, paddingBottom: 100 },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 14, 
    paddingHorizontal: 15, 
    marginBottom: 20,
    borderWidth: 1, 
    borderColor: '#F0F0F0',
    height: 50,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },
  catScroll: { marginBottom: 20 },
  catPill: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 25, 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#F0F0F0', 
    marginRight: 10,
  },
  catPillActive: { backgroundColor: '#FF8C00', borderColor: '#FF8C00' },
  catText: { fontSize: 14, color: '#666', fontWeight: '600' },
  catTextActive: { color: '#fff', fontWeight: 'bold' },
  itemCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 12, 
    marginBottom: 15, 
    alignItems: 'center', 
    // Removed shadows as requested for a flatter look
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  imageContainer: { 
    width: 80, 
    height: 80, 
    borderRadius: 12, 
    backgroundColor: '#F8F8F8',
    overflow: 'hidden',
    marginRight: 15,
  },
  itemImage: { width: '100%', height: '100%' },
  unavailableOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableText: { fontSize: 10, fontWeight: '900', color: '#FF8C00' },
  itemInfo: { flex: 1, gap: 4 },
  itemName: { fontWeight: 'bold', fontSize: 16, color: '#1a1a1a' },
  itemDesc: { color: '#888', fontSize: 12, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  itemPrice: { color: '#FF8C00', fontWeight: '800', fontSize: 15 },
  stockCount: { color: '#AAA', fontSize: 11 },
  actionContainer: { alignItems: 'center', gap: 12, paddingLeft: 10 },
  editButtons: { flexDirection: 'row', gap: 15 },
  scroll: {
    paddingBottom: 110,
  },
});

export default MenuScreen;

