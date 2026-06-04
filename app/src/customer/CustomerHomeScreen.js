import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRestaurants, getCustomerProfile } from '../services/api';
import CustomerBottomTab from './components/CustomerBottomTab';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

const SectionHeader = ({ title, showViewAll = false }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {showViewAll && <TouchableOpacity><Text style={styles.viewAll}>View all</Text></TouchableOpacity>}
  </View>
);

const SquareCard = ({ name, sub, rating, price, image, onPress }) => (
  <TouchableOpacity style={styles.squareCard} onPress={onPress}>
    <Image source={{ uri: image }} style={styles.squareImage} />
    <View style={styles.squareInfo}>
      <Text style={styles.cardTitle}>{name}</Text>
      <View style={styles.cardRow}>
        <Text style={styles.cardSub}>{sub}</Text>
        {rating && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        )}
      </View>
      {price && <Text style={styles.cardPrice}>₦{price}</Text>}
    </View>
  </TouchableOpacity>
);

const ListCard = ({ name, sub, price, image, onPress }) => (
  <TouchableOpacity style={styles.listCard} onPress={onPress}>
    <Image source={{ uri: image }} style={styles.listImage} />
    <View style={styles.listInfo}>
      <Text style={styles.listTitle}>{name}</Text>
      <Text style={styles.listSub} numberOfLines={1}>{sub}</Text>
      <Text style={styles.listPrice}>₦{price}</Text>
    </View>
    <TouchableOpacity style={styles.addBtn} onPress={onPress}>
      <Ionicons name="add" size={20} color={Colors.primary} />
    </TouchableOpacity>
  </TouchableOpacity>
);

const CustomerHomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [vendors, setVendors] = useState([]);
  const [profile, setProfile] = useState(null);
  const { cartItems } = useCart();
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [resVendors, resProfile] = await Promise.all([
          getRestaurants(),
          getCustomerProfile().catch(() => ({ success: false }))
        ]);
        if (resVendors.success) setVendors(resVendors.data);
        if (resProfile.success) setProfile(resProfile.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.orangeHeader}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.profileBox} onPress={() => navigation.navigate('CustomerProfile')}>
                <Image
                  source={{ uri: profile?.profilePic || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' }}
                  style={styles.profilePic}
                />
                <View>
                  <Text style={styles.greeting}>Good afternoon,</Text>
                  <Text style={styles.name}>{profile?.name?.split(' ')[0] || 'User'}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={() => navigation.navigate('ChatList')} style={styles.roundBtn}>
                  <Ionicons name="chatbubble-ellipses-outline" size={22} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.roundBtn}>
                  <Ionicons name="cart-outline" size={22} color="#FFF" />
                  {cartItemCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartItemCount}</Text></View>}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#999" />
              <TextInput 
                placeholder="Search menu, dishes or vendors" 
                placeholderTextColor="#999"
                style={styles.searchInput}
                onFocus={() => navigation.navigate('Search')}
              />
            </View>
            <View style={styles.locationLink}>
               <Ionicons name="location" size={14} color="#FFF" />
               <Text style={styles.locationText}>Deliver to Lagos Island</Text>
               <Ionicons name="chevron-down" size={12} color="#FFF" />
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.main}>
          {/* Swipeable Banners */}
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.bannerScroll}
          >
            {/* Banner 1 */}
            <View style={styles.bannerCard}>
              <View style={styles.bannerWrapper}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1590604153093-ae4fc2909f90?w=1200&q=80' }} 
                  style={styles.bannerFullImg} 
                />
                <View style={styles.bannerGradient}>
                  <Text style={styles.bannerTitleFull}>Free delivery</Text>
                  <Text style={styles.bannerSubFull}>On your first 3 orders this week</Text>
                </View>
              </View>
            </View>

            {/* Banner 2 */}
            <View style={styles.bannerCard}>
              <View style={styles.bannerWrapper}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80' }} 
                  style={styles.bannerFullImg} 
                />
                <View style={[styles.bannerGradient, { backgroundColor: 'rgba(255, 30, 30, 0.4)' }]}>
                  <Text style={styles.bannerTitleFull}>50% Discount</Text>
                  <Text style={styles.bannerSubFull}>Get huge discounts on your favorite meals</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Featured Vendors */}
          <SectionHeader title="Featured vendors" showViewAll />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
            {loading ? <ActivityIndicator color={Colors.primary} /> : vendors.map(v => (
              <SquareCard 
                key={v._id}
                name={v.businessName || v.name}
                sub={v.category || "Provisions"}
                rating="4.8"
                image={v.logoUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400"}
                onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: v._id })}
              />
            ))}
          </ScrollView>

          {/* Cooked Foods */}
          <SectionHeader title="Cooked Foods" />
          <View style={styles.grid}>
             <SquareCard name="Chunky Rice" sub="Smokey party cooked jollof rice" price="2,500" image="https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?w=400" onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: vendors[0]?._id })} />
             <SquareCard name="Jollof Rice" sub="Smokey party cooked jollof rice" price="2,500" image="https://images.unsplash.com/photo-1574484284002-952d92456975?w=400" onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: vendors[0]?._id })} />
          </View>

          {/* Grilled Foods */}
          <SectionHeader title="Grilled Foods" />
          <View style={styles.grid}>
             <SquareCard name="Grilled Meat" sub="Smokey party grilled meat" price="3,200" image="https://images.unsplash.com/photo-1544025162-d76694265947?w=400" onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: vendors[0]?._id })} />
             <SquareCard name="Grilled Fish" sub="Smokey party grilled fish" price="3,500" image="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400" onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: vendors[0]?._id })} />
          </View>

          {/* Featured Orders */}
          <SectionHeader title="Featured orders" showViewAll />
          <View style={styles.list}>
             <ListCard name="Jollof Rice" sub="Smokey party cooked jollof rice" price="2,500" image="https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?w=200" onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: vendors[0]?._id })} />
             <ListCard name="Agoyin Beans" sub="Smokey party cooked jollof rice" price="2,200" image="https://images.unsplash.com/photo-1593361876527-2ee3b4e6b72a?w=200" onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: vendors[0]?._id })} />
             <ListCard name="White Rice" sub="Smokey party cooked jollof rice" price="2,500" image="https://images.unsplash.com/photo-1516684732162-798a0062be99?w=200" onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: vendors[0]?._id })} />
             <ListCard name="Raw Carrots" sub="Smokey party cooked jollof rice" price="1,200" image="https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200" onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: vendors[0]?._id })} />
          </View>

          {/* Drinks */}
          <SectionHeader title="Drinks" />
          <View style={styles.grid}>
             <SquareCard name="Fresh Chapman" sub="Smokey party jollof rice" price="1,000" image="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400" onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: vendors[0]?._id })} />
             <SquareCard name="Home-made Juice" sub="Smokey party jollof rice" price="1,500" image="https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400" onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: vendors[0]?._id })} />
          </View>

          {/* Fruits */}
          <SectionHeader title="Fruits" />
          <View style={styles.grid}>
             <SquareCard name="Fresh Mango" sub="Smokey party jollof rice" price="1,000" image="https://images.unsplash.com/photo-1553279768-865429fa0078?w=400" onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: vendors[0]?._id })} />
             <SquareCard name="Fresh Pepper" sub="Smokey party jollof rice" price="2,500" image="https://images.unsplash.com/photo-1588252303782-cb80119cb665?w=400" onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: vendors[0]?._id })} />
          </View>

        </View>
      </ScrollView>

      <CustomerBottomTab activeTab="Home" navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  orangeHeader: { 
    backgroundColor: '#FF7D01', 
    borderBottomLeftRadius: 40, 
    borderBottomRightRadius: 40, 
    paddingHorizontal: 20, 
    paddingBottom: 30 
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  profileBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  profilePic: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  name: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 10 },
  roundBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: 0, right: 0, backgroundColor: 'red', width: 14, height: 14, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  
  searchBox: { 
    backgroundColor: '#FFF', 
    borderRadius: 25, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    height: 45, 
    gap: 10 
  },
  searchInput: { flex: 1, fontSize: 13, color: '#333' },
  locationLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 15 },
  locationText: { color: '#FFF', fontSize: 12, fontWeight: '500' },

  scrollContent: { paddingBottom: 100 },
  main: { paddingVertical: 16 },

  bannerScroll: { marginBottom: 25 },
  bannerCard: { width: width, paddingHorizontal: 16 },
  bannerWrapper: { width: '100%', height: 160, borderRadius: 25, overflow: 'hidden', position: 'relative' },
  bannerFullImg: { width: '100%', height: '100%' },
  bannerGradient: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: '100%', 
    backgroundColor: 'rgba(255, 125, 1, 0.45)', 
    justifyContent: 'flex-end', 
    padding: 20 
  },
  bannerTitleFull: { color: '#FFF', fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  bannerSubFull: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600', marginTop: 4 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 10, marginBottom: 15 },
  sectionTitle: { fontSize: 13, color: '#888', fontWeight: '400' },
  viewAll: { fontSize: 11, color: '#FF7D01', fontWeight: '500' },

  horizontal: { gap: 12, paddingHorizontal: 16, marginBottom: 15 },
  grid: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 20 },
  
  squareCard: { width: (width - 44) / 2, backgroundColor: '#FFF' },
  squareImage: { width: '100%', height: 110, borderRadius: 15 },
  squareInfo: { marginTop: 8 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  cardSub: { fontSize: 11, color: '#999', flex: 1 },
  cardPrice: { fontSize: 13, fontWeight: '700', color: '#FF7D01', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 11, fontWeight: '700', color: '#444' },

  list: { gap: 15, paddingHorizontal: 16, marginBottom: 25 },
  listCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 15, padding: 8, borderWidth: 1, borderColor: '#FAFAFA' },
  listImage: { width: 60, height: 60, borderRadius: 12 },
  listInfo: { flex: 1, marginLeft: 12 },
  listTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  listSub: { fontSize: 11, color: '#999', marginVertical: 2 },
  listPrice: { fontSize: 13, fontWeight: '700', color: '#FF7D01' },
  addBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', justifyContent: 'center', alignItems: 'center' },
});

export default CustomerHomeScreen;
