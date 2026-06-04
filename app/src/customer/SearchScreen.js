import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, Dimensions, StatusBar, Image, ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { searchAll } from '../services/api';

const { width } = Dimensions.get('window');

const SearchScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState({ vendors: [], items: [] });
  const [loading, setLoading] = useState(false);

  const trendingItems = [
    'Jollof Rice', 'Suya', 'Pizza', 'Smoothie', 'Pepper soup', 'Chapman'
  ];

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search.trim().length > 1) {
        performSearch();
      } else {
        setResults({ vendors: [], items: [] });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const res = await searchAll(search);
      if (res.success) {
        setResults(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* Search Input Container */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search vendors, dishes or raw foods..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
              autoFocus
              returnKeyType="search"
            />
            {loading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <TouchableOpacity>
                <MaterialCommunityIcons name="filter-variant" size={20} color="#1a1a1a" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {search.length <= 1 ? (
          /* Trending Section (Default state) */
          <View style={styles.trendingSection}>
            <View style={styles.trendingHeader}>
              <MaterialCommunityIcons name="pulse" size={18} color={Colors.primary || '#FF8C00'} />
              <Text style={styles.trendingTitle}>Trending</Text>
            </View>

            <View style={styles.trendingChips}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                {trendingItems.map((item, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    style={styles.chip}
                    onPress={() => setSearch(item)}
                  >
                    <Text style={styles.chipText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        ) : (
          /* Search Results */
          <View style={styles.resultsContainer}>
            {/* Vendors */}
            {results.vendors.length > 0 && (
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>Vendors</Text>
                {results.vendors.map(vendor => (
                  <TouchableOpacity 
                    key={vendor._id} 
                    style={styles.vendorRow}
                    onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: vendor._id })}
                  >
                    <Image 
                      source={{ uri: vendor.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100' }} 
                      style={styles.vendorLogo} 
                    />
                    <View style={styles.vendorDetails}>
                      <Text style={styles.vendorName}>{vendor.businessName}</Text>
                      <View style={styles.vendorMeta}>
                        <Text style={styles.vendorCat}>{vendor.category}</Text>
                        <View style={styles.dot} />
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.ratingText}>4.8</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#EEE" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Dishes / Menu Items */}
            {results.items.length > 0 && (
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>Dishes & Products</Text>
                {results.items.map(item => (
                  <TouchableOpacity 
                    key={item._id} 
                    style={styles.itemRow}
                    onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: item.vendorId?._id })}
                  >
                    <Image 
                      source={{ uri: item.image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?w=200' }} 
                      style={styles.itemImage} 
                    />
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemVendor}>at {item.vendorId?.businessName}</Text>
                      <Text style={styles.itemPrice}>₦{item.price.toLocaleString()}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#EEE" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {results.vendors.length === 0 && results.items.length === 0 && !loading && (
              <View style={styles.emptyResults}>
                <Ionicons name="search-outline" size={50} color="#EEE" />
                <Text style={styles.emptyResultsText}>No results found for "{search}"</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    height: 60,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  
  scroll: { paddingTop: 5, paddingBottom: 40 },
  
  searchContainer: { paddingHorizontal: 16, marginBottom: 20 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F7F8F9', 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    height: 44,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 10
  },
  searchInput: { flex: 1, fontSize: 13, color: '#1a1a1a', fontWeight: '500' },

  trendingSection: { paddingHorizontal: 16 },
  trendingHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  trendingTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  
  trendingChips: { marginLeft: -16, marginRight: -16 },
  chipsScroll: { paddingHorizontal: 16, gap: 8 },
  chip: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 10, 
    backgroundColor: '#FFF', 
    borderWidth: 1, 
    borderColor: '#F0F0F0' 
  },
  chipText: { fontSize: 12, color: '#666', fontWeight: '500' },

  resultsContainer: { paddingHorizontal: 16 },
  resultSection: { marginBottom: 24 },
  resultSectionTitle: { fontSize: 13, fontWeight: '800', color: '#AAA', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  
  vendorRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8F9FA' },
  vendorLogo: { width: 48, height: 48, borderRadius: 10, marginRight: 12, backgroundColor: '#F0F0F0' },
  vendorDetails: { flex: 1 },
  vendorName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  vendorMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  vendorCat: { fontSize: 13, color: '#999' },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#DDD', marginHorizontal: 8 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#444', marginLeft: 4 },

  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8F9FA' },
  itemImage: { width: 60, height: 60, borderRadius: 10, marginRight: 12, backgroundColor: '#F0F0F0' },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  itemVendor: { fontSize: 12, color: '#999', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '800', color: Colors.primary, marginTop: 4 },

  emptyResults: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyResultsText: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 15, lineHeight: 20 },
});

export default SearchScreen;
