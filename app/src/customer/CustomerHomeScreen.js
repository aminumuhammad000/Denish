import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Image, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const categories = [
  { id: '1', name: 'Rice', icon: '🍚' },
  { id: '2', name: 'Soups', icon: '🍲' },
  { id: '3', name: 'Grills', icon: '🍢' },
  { id: '4', name: 'Drinks', icon: '🥤' },
  { id: '5', name: 'Snacks', icon: '🥨' }
];

const popularVendors = [
  { id: '1', name: "Mama's Kitchen", rating: 4.8, time: '15-25 min', delivery: '₦500', tags: ['Local', 'Rice'] },
  { id: '2', name: 'The Suya Spot', rating: 4.5, time: '20-30 min', delivery: '₦400', tags: ['Grills', 'Spicy'] },
  { id: '3', name: 'Calabar Pot', rating: 4.9, time: '30-45 min', delivery: '₦800', tags: ['Soups', 'Premium'] },
];

const CustomerHomeScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');

  const renderVendor = ({ item }) => (
    <TouchableOpacity 
      style={styles.vendorCard}
      onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: item.id })}
    >
      <View style={styles.vendorImagePlaceholder}>
        <Ionicons name="restaurant-outline" size={32} color="#aaa" />
      </View>
      <View style={styles.vendorInfo}>
        <Text style={styles.vendorName}>{item.name}</Text>
        <Text style={styles.vendorTags}>{item.tags.join(' • ')}</Text>
        <View style={styles.vendorMetaRow}>
          <View style={styles.metaBadge}>
            <Ionicons name="star" size={12} color="#f5c518" />
            <Text style={styles.metaText}>{item.rating}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Ionicons name="time-outline" size={12} color="#666" />
            <Text style={styles.metaText}>{item.time}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Ionicons name="bicycle-outline" size={12} color="#666" />
            <Text style={styles.metaText}>{item.delivery}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.deliverTo}>Deliver to</Text>
          <TouchableOpacity style={styles.locationRow}>
            <Text style={styles.locationText}>14 Secretariat Avenue...</Text>
            <Ionicons name="chevron-down" size={16} color="#000" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.profileAvatar}
          onPress={() => navigation.navigate('CustomerLogin')}
        >
          <Ionicons name="person-outline" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food, restaurants..."
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Free Delivery!</Text>
            <Text style={styles.promoSub}>On your first 3 orders today</Text>
            <TouchableOpacity style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>Order now</Text>
            </TouchableOpacity>
          </View>
          <Ionicons name="fast-food" size={60} color="#FFDBB5" style={{ opacity: 0.8 }} />
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryCard}>
              <View style={styles.categoryIconCircle}>
                <Text style={styles.categoryEmoji}>{cat.icon}</Text>
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Near You */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular near you</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>
        
        <FlatList
          data={popularVendors}
          keyExtractor={item => item.id}
          renderItem={renderVendor}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false} // since it's inside a ScrollView
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#fff' },
  deliverTo: { fontSize: 12, color: '#888', fontWeight: 'bold' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
  profileAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 100 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', margin: 12, gap: 10 },
  searchInput: { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 10, paddingLeft: 42, paddingRight: 16, fontSize: 13, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 3 },
  searchIcon: { position: 'absolute', left: 14, top: 14, zIndex: 1 },
  filterBtn: { backgroundColor: '#FFF5E6', padding: 14, borderRadius: 12, elevation: 1 },
  promoBanner: { backgroundColor: Colors.primary, marginHorizontal: 12, borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
  promoContent: { flex: 1 },
  promoTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  promoSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginBottom: 16 },
  promoBtn: { backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignSelf: 'flex-start' },
  promoBtnText: { color: Colors.primary, fontWeight: 'bold', fontSize: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 12, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a' },
  seeAll: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  categoriesScroll: { paddingHorizontal: 12, marginBottom: 16 },
  categoryCard: { alignItems: 'center', marginRight: 20 },
  categoryIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 3, marginBottom: 8 },
  categoryEmoji: { fontSize: 22 },
  categoryName: { fontSize: 11, fontWeight: '500', color: '#333' },
  vendorCard: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 12, marginBottom: 12, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 3 },
  vendorImagePlaceholder: { width: '100%', height: 120, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  vendorInfo: { padding: 12 },
  vendorName: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  vendorTags: { fontSize: 11, color: '#888', marginBottom: 12 },
  vendorMetaRow: { flexDirection: 'row', gap: 16 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  metaText: { fontSize: 10, fontWeight: '600', color: '#444' },
});

export default CustomerHomeScreen;
