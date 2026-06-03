import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, TextInput, Image, KeyboardAvoidingView, Platform, Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { addVendorMenuItem, updateVendorMenuItem } from '../../services/api';

const ItemFormScreen = ({ navigation, route }) => {
  const { isEdit, item, categories = ['Main'] } = route.params || {};
  // Filter out "All" from categories
  const selectableCats = categories.filter(c => c !== 'All');

  const [loading, setLoading] = useState(false);
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [form, setForm] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price?.toString() || '',
    stock: item?.stock?.toString() || '0',
    category: item?.category || selectableCats[0] || 'Main',
    image: item?.image || null,
    available: item?.available ?? true
  });

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.category) {
      alert('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock)
      };

      if (isEdit) {
        await updateVendorMenuItem(item._id, payload);
      } else {
        await addVendorMenuItem(payload);
      }
      navigation.goBack();
    } catch (err) {
      console.error(err);
      alert('Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const selectCategory = (cat) => {
    setForm({...form, category: cat});
    setCatModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{isEdit ? 'Edit item' : 'Add item'}</Text>
          <Text style={styles.headerSubtitle}>Changes are saved immediately</Text>
        </View>
        <View style={{ width: 40 }} /> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Suya Platter"
              value={form.name}
              onChangeText={v => setForm({...form, name: v})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              multiline 
              numberOfLines={3}
              placeholder="Tell customers about this item..."
              value={form.description}
              onChangeText={v => setForm({...form, description: v})}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.inputLabel}>Price (₦)</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                placeholder="3,500"
                value={form.price}
                onChangeText={v => setForm({...form, price: v})}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Stock</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                placeholder="24"
                value={form.stock}
                onChangeText={v => setForm({...form, stock: v})}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <TouchableOpacity style={styles.mockPicker} onPress={() => setCatModalVisible(true)}>
              <Text style={styles.pickerText}>{form.category}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Image</Text>
            <TouchableOpacity style={styles.imagePicker}>
              {form.image ? (
                 <Image source={{ uri: form.image }} style={styles.previewImage} />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={24} color="#999" />
                  <Text style={styles.imagePickerText}>Choose photo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.availableRow}>
            <View>
              <Text style={styles.inputLabel}>Available</Text>
              <Text style={styles.inputSub}>Show on customer menu</Text>
            </View>
            <Switch 
              value={form.available}
              onValueChange={v => setForm({...form, available: v})}
              trackColor={{ true: '#FF8C00', false: '#E0E0E0' }}
              thumbColor="#FFF"
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.submitBtnText}>{loading ? 'Saving...' : (isEdit ? 'Save changes' : 'Add item')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Selection Modal */}
      <Modal visible={catModalVisible} transparent animationType="slide">
        <View style={styles.catModalOverlay}>
          <View style={styles.catModalContent}>
            <View style={styles.catModalHeader}>
              <Text style={styles.catModalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setCatModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList 
              data={selectableCats}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.catItem, form.category === item && styles.catItemActive]} 
                  onPress={() => selectCategory(item)}
                >
                  <Text style={[styles.catItemText, form.category === item && styles.catItemTextActive]}>{item}</Text>
                  {form.category === item && <Ionicons name="checkmark-circle" size={20} color="#FF8C00" />}
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#F5F5F5'
  },
  backBtn: { padding: 4 },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  headerSubtitle: { fontSize: 12, color: '#888' },
  scroll: { padding: 20, paddingBottom: 50 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8 },
  inputSub: { fontSize: 11, color: '#999' },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    padding: 15,
    fontSize: 16,
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
    borderRadius: 14,
    padding: 15,
    backgroundColor: '#FAFAFA'
  },
  pickerText: { fontSize: 16, color: '#333' },
  imagePicker: {
    height: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA'
  },
  imagePickerText: { fontSize: 14, color: '#999', marginTop: 8 },
  previewImage: { width: '100%', height: '100%', borderRadius: 14 },
  availableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F5F5F5',
    marginBottom: 30
  },
  submitBtn: {
    backgroundColor: '#FF8C00',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2
  },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { padding: 15, alignItems: 'center' },
  cancelBtnText: { color: '#666', fontSize: 15, fontWeight: '600' },
  // Category Modal Styles
  catModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  catModalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '60%' },
  catModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  catModalTitle: { fontSize: 18, fontWeight: 'bold' },
  catItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#F5F5F5' },
  catItemActive: { backgroundColor: '#FFF9F2' },
  catItemText: { fontSize: 16, color: '#333' },
  catItemTextActive: { color: '#FF8C00', fontWeight: 'bold' }
});

export default ItemFormScreen;

