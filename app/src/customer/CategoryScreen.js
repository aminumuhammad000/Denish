import React from 'react';
import {
  StyleSheet, Text, View, Image, TouchableOpacity,
  Dimensions, FlatList, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const CATEGORY_DATA = {
  'Cooked Foods': [
    { id: '1', name: 'Chunky Rice', sub: 'Smokey party cooked rice', price: '2,500', image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=400&q=80' },
    { id: '2', name: 'Jollof Rice', sub: 'Smokey party cooked rice', price: '2,500', image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=400&q=80' },
    { id: '3', name: 'Fried Rice', sub: 'Smokey party cooked rice', price: '2,500', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80' },
    { id: '4', name: 'Coconut Rice', sub: 'Smokey party cooked rice', price: '2,800', image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&q=80' },
    { id: '5', name: 'White Rice & Stew', sub: 'Delicious home-cooked rice', price: '2,000', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80' },
    { id: '6', name: 'Agoyin Beans', sub: 'Lagos famous agoyin beans', price: '2,200', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80' },
  ],
  'Grilled Foods': [
    { id: '1', name: 'Grilled Meat', sub: 'Smokey party grilled meat', price: '3,200', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80' },
    { id: '2', name: 'Grilled Fish', sub: 'Smokey party grilled fish', price: '3,500', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80' },
    { id: '3', name: 'Suya Meat', sub: 'Smokey party grilled meat', price: '2,000', image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80' },
    { id: '4', name: 'BBQ Chicken', sub: 'Smokey party grilled chicken', price: '4,500', image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80' },
    { id: '5', name: 'Grilled Corn', sub: 'Fresh grilled sweet corn', price: '500', image: 'https://images.unsplash.com/photo-1601476099843-5d3a85c5d1e3?w=400&q=80' },
    { id: '6', name: 'Pepper Steak', sub: 'Seasoned grilled steak', price: '5,000', image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&q=80' },
  ],
  'Drinks': [
    { id: '1', name: 'Fresh Chapman', sub: 'Classic Nigerian Chapman', price: '1,000', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80' },
    { id: '2', name: 'Juice', sub: 'Fresh squeezed juice', price: '1,500', image: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&q=80' },
    { id: '3', name: 'Red Wine', sub: 'Premium red wine', price: '12,000', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80' },
    { id: '4', name: 'Cold Beer', sub: 'Ice cold lager', price: '1,200', image: 'https://images.unsplash.com/photo-1532635241-17e820acc59f?w=400&q=80' },
    { id: '5', name: 'Zobo Drink', sub: 'Nigerian hibiscus drink', price: '800', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80' },
    { id: '6', name: 'Kunu', sub: 'Traditional millet drink', price: '700', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80' },
  ],
  'Fruits': [
    { id: '1', name: 'Fresh Mango', sub: 'Juicy seasonal mango', price: '1,000', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80' },
    { id: '2', name: 'Fresh Pepper', sub: 'Hot chili peppers', price: '2,500', image: 'https://images.unsplash.com/photo-1590644365607-1c5a519a7a37?w=400&q=80' },
    { id: '3', name: 'Pineapple', sub: 'Sweet tropical pineapple', price: '1,500', image: 'https://images.unsplash.com/photo-1550258114-68bd25f3dfc8?w=400&q=80' },
    { id: '4', name: 'Watermelon', sub: 'Refreshing watermelon', price: '2,000', image: 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=400&q=80' },
    { id: '5', name: 'Banana', sub: 'Fresh organic banana', price: '500', image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400&q=80' },
    { id: '6', name: 'Papaya', sub: 'Sweet tropical papaya', price: '1,200', image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=400&q=80' },
  ],
  'Featured vendors': [],
  'Featured orders': [
    { id: '1', name: 'Jollof Rice', sub: 'Smokey party cooked jollof rice', price: '2,500', image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=400&q=80' },
    { id: '2', name: 'Agoyin Beans', sub: 'Smokey party cooked beans', price: '2,200', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80' },
    { id: '3', name: 'White Rice', sub: 'Smokey party cooked rice', price: '2,500', image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&q=80' },
    { id: '4', name: 'Raw Carrots', sub: 'Fresh organic carrots', price: '1,200', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80' },
    { id: '5', name: 'Fried Plantain', sub: 'Crispy sweet plantain', price: '800', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80' },
    { id: '6', name: 'Moi Moi', sub: 'Steamed bean pudding', price: '1,000', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80' },
  ],
};

const CategoryScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { category } = route.params;
  const items = CATEGORY_DATA[category] || [];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: item.id })}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardSub} numberOfLines={1}>{item.sub}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>₦{item.price}</Text>
          <TouchableOpacity style={styles.addBtn}>
            <Ionicons name="add" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category}</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={22} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={i => i.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="restaurant-outline" size={50} color="#DDD" />
            <Text style={styles.emptyText}>No items in this category yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 60, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  filterBtn: { padding: 4 },
  list: { padding: 16, paddingBottom: 60 },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  card: { width: CARD_WIDTH, backgroundColor: '#FFF', borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardImage: { width: '100%', height: 130 },
  cardBody: { padding: 10 },
  cardName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  cardSub: { fontSize: 11, color: '#999', marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  cardPrice: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  addBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyText: { color: '#CCC', fontSize: 15, marginTop: 12 },
});

export default CategoryScreen;
