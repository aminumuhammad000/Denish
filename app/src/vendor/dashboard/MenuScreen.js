import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Image, TextInput, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { getVendorMenu, toggleVendorMenuItem } from '../../services/api';

const MenuScreen = () => {
  const [selectedCat, setSelectedCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '0',
    category: '',
    image: null,
    available: true
  });

  useEffect(() => {
    fetchMenu();
  }, []);

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
    setIsEdit(false);
    setForm({ name: '', description: '', price: '', stock: '0', category: categories[1] || '', image: null, available: true });
    setModalVisible(true);
  };

  const handleOpenEdit = (item) => {
    setIsEdit(true);
    setEditingId(item._id);
    setForm({
      name: item.name,
      description: item.description,
      price: (item.price || 0).toString(),
      stock: (item.stock || 0).toString(),
      category: item.category,
      image: item.image,
      available: item.available
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      alert('Required fields missing');
      return;
    }
    setModalVisible(false);
    // Add server call here later
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

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>{isEdit ? 'Edit item' : 'Add item'}</Text>
            <Text style={styles.modalSubtitle}>Changes are saved immediately</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput 
                  style={styles.modalInput} 
                  placeholder="e.g. Suya Platter"
                  value={form.name}
                  onChangeText={v => setForm({...form, name: v})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput 
                  style={[styles.modalInput, styles.textArea]} 
                  multiline 
                  numberOfLines={3}
                  placeholder="Tell customers about this item..."
                  value={form.description}
                  onChangeText={v => setForm({...form, description: v})}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Price (₦)</Text>
                  <TextInput 
                    style={styles.modalInput} 
                    keyboardType="numeric" 
                    placeholder="3,500"
                    value={form.price}
                    onChangeText={v => setForm({...form, price: v})}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Stock</Text>
                  <TextInput 
                    style={styles.modalInput} 
                    keyboardType="numeric" 
                    placeholder="24"
                    value={form.stock}
                    onChangeText={v => setForm({...form, stock: v})}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <TouchableOpacity style={styles.mockPicker}>
                  <Text style={styles.mockPickerText}>{form.category || 'Choose category'}</Text>
                  <Ionicons name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Image</Text>
                <TouchableOpacity style={styles.imagePickerBtn}>
                  <Ionicons name="camera-outline" size={18} color="#999" />
                  <Text style={styles.imagePickerText}>{form.image ? 'Change photo' : 'Choose photo'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.availableRow}>
                <View>
                  <Text style={styles.inputLabel}>Available</Text>
                  <Text style={styles.inputSubLabel}>Show on customer menu</Text>
                </View>
                <Switch 
                  value={form.available}
                  onValueChange={v => setForm({...form, available: v})}
                  trackColor={{ true: '#FF8C00', false: '#E0E0E0' }}
                  thumbColor={form.available ? '#FFFFFF' : '#F4F4F4'}
                />
              </View>

              <TouchableOpacity style={styles.mainSubmitBtn} onPress={handleSubmit}>
                <Text style={styles.mainSubmitBtnText}>{isEdit ? 'Save changes' : 'Add item'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  miniBtn: {
    padding: 4,
  },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, maxHeight: '90%' },
  modalCloseBtn: { alignSelf: 'flex-end', marginBottom: -10, padding: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a' },
  modalSubtitle: { textAlign: 'center', color: '#888', fontSize: 13, marginBottom: 25 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8 },
  inputSubLabel: { fontSize: 11, color: '#999' },
  modalInput: { 
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    borderRadius: 12, 
    padding: 14, 
    fontSize: 15, 
    color: '#333',
    backgroundColor: '#FAFAFA'
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  mockPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FAFAFA'
  },
  mockPickerText: { fontSize: 15, color: '#333' },
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FAFAFA',
    gap: 10,
    borderStyle: 'dashed'
  },
  imagePickerText: { fontSize: 14, color: '#999' },
  availableRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#F0F0F0'
  },
  mainSubmitBtn: { 
    backgroundColor: '#FF8C00', 
    borderRadius: 14, 
    padding: 16, 
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2
  },
  mainSubmitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#666', fontSize: 15, fontWeight: '600' },
});

export default MenuScreen;

