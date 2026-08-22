import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  useWindowDimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRestaurants, getCustomerProfile, fetchIncomingCall } from '../services/api';
import { getAuthSession } from '../services/authStorage';
import CustomerBottomTab from './components/CustomerBottomTab';
import { useCart } from '../context/CartContext';

const SectionHeader = ({ title, showViewAll = false, onPress }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {showViewAll && <TouchableOpacity onPress={onPress}><Text style={styles.viewAll}>View all</Text></TouchableOpacity>}
  </View>
);

const SquareCard = ({ name, sub, rating, price, image, onPress, cardWidth }) => (
  <TouchableOpacity style={[styles.squareCard, cardWidth ? { width: cardWidth } : null]} onPress={onPress}>
    <Image source={{ uri: image }} style={styles.squareImage} />
    <View style={styles.squareInfo}>
      <Text style={styles.cardTitle} numberOfLines={1}>{name}</Text>
      <View style={styles.cardRow}>
        <Text style={styles.cardSub} numberOfLines={1}>{sub}</Text>
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
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web' || width >= 768;
  const contentWidth = Math.min(width, 1100);
  const cardWidth = isWeb 
    ? Math.min((contentWidth - 64) / (width >= 900 ? 4 : width >= 600 ? 3 : 2), 220)
    : (width - 44) / 2;
  const bannerWidth = isWeb ? Math.min(contentWidth * 0.85, 480) : width * 0.88;

  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [banners, setBanners] = useState([]);
  const [profile, setProfile] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('Lagos Island');
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const { cartItems } = useCart();
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let intervalId = null;
    let isSubscribed = true;

    const checkIncomingCalls = async () => {
      try {
        const session = await getAuthSession();
        if (!isSubscribed || !session || !session.user) return;
        const nameToQuery = session.user.name;
        if (!nameToQuery) return;

        const res = await fetchIncomingCall(nameToQuery);
        if (isSubscribed && res.success && res.call) {
          navigation.navigate('IncomingCall', {
            callId: res.call._id,
            callerName: res.call.callerName,
            phone: res.call.phone || '08123456789',
            orderId: res.call.orderId,
            subtitle: res.call.subtitle
          });
        }
      } catch (e) {
        // Silent error
      }
    };

    intervalId = setInterval(checkIncomingCalls, 3000);

    return () => {
      isSubscribed = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      let isSubscribed = true;
      getAuthSession().then(session => {
        if (!isSubscribed) return;
        if (!session || session.role !== 'customer') {
          navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
          return;
        }
      });
      return () => { isSubscribed = false; };
    }, [navigation])
  );

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [resVendors, resProfile] = await Promise.all([
          getRestaurants(),
          getCustomerProfile().catch(() => ({ success: false }))
        ]);
        if (resVendors.success) {
          setVendors(resVendors.data || []);
          if (resVendors.items) setItems(resVendors.items);
          if (resVendors.banners) setBanners(resVendors.banners);
        }
        if (resProfile.success) {
          setProfile(resProfile.data);
          if (resProfile.data.address) {
            setSelectedAddress(resProfile.data.address);
          } else if (resProfile.data.addresses?.length > 0) {
            setSelectedAddress(resProfile.data.addresses[0].addr || resProfile.data.addresses[0].label);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const userAddresses = profile?.addresses?.length > 0 
    ? profile.addresses 
    : [
        { _id: '1', label: 'Home', addr: profile?.address || '15 Admiralty Way, Lekki, Lagos', tag: 'Default' },
        { _id: '2', label: 'Work', addr: '42 Marina Street, Lagos Island', tag: 'Work' }
      ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.orangeHeader}>
          <SafeAreaView edges={['top']} style={styles.webHeaderInner}>
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
                <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.roundBtn}>
                  <Ionicons name="notifications-outline" size={22} color="#FFF" />
                </TouchableOpacity>
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
            <TouchableOpacity style={styles.locationLink} onPress={() => setAddressModalVisible(true)}>
               <Ionicons name="location" size={14} color="#FFF" />
               <Text style={styles.locationText} numberOfLines={1}>Deliver to {selectedAddress}</Text>
               <Ionicons name="chevron-down" size={12} color="#FFF" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Address Dropdown Selection Modal */}
        <Modal
          visible={addressModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setAddressModalVisible(false)}
        >
          <TouchableOpacity 
            style={[styles.modalOverlay, isWeb && styles.modalOverlayWeb]} 
            activeOpacity={1} 
            onPress={() => setAddressModalVisible(false)}
          >
            <View style={[styles.addressModalContent, isWeb && styles.addressModalContentWeb]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Delivery Address</Text>
                <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 300 }}>
                {userAddresses.map((item, idx) => {
                  const addrText = item.addr || item.label;
                  const isSelected = selectedAddress === addrText || selectedAddress.includes(item.label);
                  return (
                    <TouchableOpacity
                      key={item._id || idx}
                      style={[styles.addressItemRow, isSelected && styles.addressItemActive]}
                      onPress={() => {
                        setSelectedAddress(addrText);
                        setAddressModalVisible(false);
                      }}
                    >
                      <View style={styles.addressIconBox}>
                        <Ionicons 
                          name={item.label?.toLowerCase().includes('work') ? 'briefcase' : 'home'} 
                          size={20} 
                          color={isSelected ? Colors.primary : '#666'} 
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.addressLabelText}>{item.label || 'Saved Address'}</Text>
                          {item.tag && <View style={styles.tagBadge}><Text style={styles.tagText}>{item.tag}</Text></View>}
                        </View>
                        <Text style={styles.addressFullText} numberOfLines={2}>{item.addr || item.label}</Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity 
                style={styles.addAddressModalBtn}
                onPress={() => {
                  setAddressModalVisible(false);
                  navigation.navigate('CustomerProfile');
                }}
              >
                <Ionicons name="add" size={18} color="#FFF" />
                <Text style={styles.addAddressModalBtnText}>Manage Saved Addresses</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <View style={styles.main}>
          {/* Swipeable Banners */}
          <ScrollView 
            horizontal 
            snapToInterval={bannerWidth + 12}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.bannerScroll}
          >
            {/* Banner 1 */}
            <View style={[styles.bannerCard, { width: bannerWidth }]}>
              <View style={styles.bannerWrapper}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80' }} 
                  style={styles.bannerFullImg} 
                />
                <View style={styles.bannerGradient}>
                  <Text style={styles.bannerTitleFull}>Free delivery</Text>
                  <Text style={styles.bannerSubFull}>On your first 3 orders this week</Text>
                </View>
              </View>
            </View>

            {/* Banner 2 */}
            <View style={[styles.bannerCard, { width: bannerWidth }]}>
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

            {/* Banner 3 */}
            <View style={[styles.bannerCard, { width: bannerWidth }]}>
              <View style={styles.bannerWrapper}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80' }} 
                  style={styles.bannerFullImg} 
                />
                <View style={[styles.bannerGradient, { backgroundColor: 'rgba(39, 165, 114, 0.45)' }]}>
                  <Text style={styles.bannerTitleFull}>Daily Specials</Text>
                  <Text style={styles.bannerSubFull}>Explore new tastes every day with our chef specials</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Featured Vendors */}
          <SectionHeader title="Featured vendors" showViewAll onPress={() => navigation.navigate('Category', { category: 'Featured vendors' })} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
            {loading ? <ActivityIndicator color={Colors.primary} /> : vendors.map(v => (
              <SquareCard 
                key={v._id}
                cardWidth={cardWidth}
                name={v.businessName || v.name}
                sub={v.category || "Provisions"}
                rating={v.rating || "4.8"}
                image={v.logoUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400"}
                onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: v._id })}
              />
            ))}
          </ScrollView>

          {/* Cooked Foods */}
          <SectionHeader title="Cooked Foods" showViewAll onPress={() => navigation.navigate('Category', { category: 'Cooked Foods' })} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
             {items.filter(i => i.category === 'Cooked Foods' || !i.category).map(item => (
               <SquareCard 
                 key={item._id}
                 cardWidth={cardWidth}
                 name={item.name} 
                 sub={item.description} 
                 price={item.price?.toLocaleString()} 
                 image={item.image || "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=400&q=80"} 
                 onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: item.vendorId })} 
               />
             ))}
          </ScrollView>

          {/* Grilled Foods */}
          <SectionHeader title="Grilled Foods" showViewAll onPress={() => navigation.navigate('Category', { category: 'Grilled Foods' })} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
             {items.filter(i => i.category === 'Grilled Foods').map(item => (
               <SquareCard 
                 key={item._id}
                 cardWidth={cardWidth}
                 name={item.name} 
                 sub={item.description} 
                 price={item.price?.toLocaleString()} 
                 image={item.image || "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80"} 
                 onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: item.vendorId })} 
               />
             ))}
          </ScrollView>

          {/* Featured Orders */}
          <SectionHeader title="Featured orders" showViewAll onPress={() => navigation.navigate('Category', { category: 'Featured orders' })} />
          <View style={[styles.list, isWeb && styles.listWeb]}>
             {items.slice(0, 4).map(item => (
               <View key={item._id} style={isWeb && { width: '48%', minWidth: 280 }}>
                 <ListCard 
                   name={item.name} 
                   sub={item.description} 
                   price={item.price?.toLocaleString()} 
                   image={item.image || "https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=600&q=80"} 
                   onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: item.vendorId })} 
                 />
               </View>
             ))}
          </View>

          {/* Drinks */}
          <SectionHeader title="Drinks" showViewAll onPress={() => navigation.navigate('Category', { category: 'Drinks' })} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
             {items.filter(i => i.category === 'Drinks').length > 0 ? (
               items.filter(i => i.category === 'Drinks').map(item => (
                 <SquareCard 
                   key={item._id}
                   cardWidth={cardWidth}
                   name={item.name} 
                   sub={item.description} 
                   price={item.price?.toLocaleString()} 
                   image={item.image || "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80"} 
                   onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: item.vendorId })} 
                 />
               ))
             ) : (
               <>
                 <SquareCard cardWidth={cardWidth} name="Fresh Chapman" sub="Classic refreshing Chapman" price="1,000" image="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80" onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: vendors[0]?._id })} />
                 <SquareCard cardWidth={cardWidth} name="Fruit Juice" sub="Fresh squeezed orange juice" price="1,500" image="https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&q=80" onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: vendors[0]?._id })} />
                 <SquareCard cardWidth={cardWidth} name="Red Wine" sub="Premium aged red wine" price="12,000" image="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80" onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: vendors[0]?._id })} />
               </>
             )}
          </ScrollView>

          {/* Fruits */}
          <SectionHeader title="Fruits" showViewAll onPress={() => navigation.navigate('Category', { category: 'Fruits' })} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
             {items.filter(i => i.category === 'Fruits').length > 0 ? (
               items.filter(i => i.category === 'Fruits').map(item => (
                 <SquareCard 
                   key={item._id}
                   cardWidth={cardWidth}
                   name={item.name} 
                   sub={item.description} 
                   price={item.price?.toLocaleString()} 
                   image={item.image || "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80"} 
                   onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: item.vendorId })} 
                 />
               ))
             ) : (
               <>
                 <SquareCard cardWidth={cardWidth} name="Fresh Mango" sub="Juicy seasonal mango" price="1,000" image="https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80" onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: vendors[0]?._id })} />
                 <SquareCard cardWidth={cardWidth} name="Pineapple" sub="Sweet tropical pineapple" price="1,500" image="https://images.unsplash.com/photo-1550258114-68bd25f3dfc8?w=400&q=80" onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: vendors[0]?._id })} />
                 <SquareCard cardWidth={cardWidth} name="Watermelon" sub="Refreshing sliced watermelon" price="2,000" image="https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=400&q=80" onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: vendors[0]?._id })} />
               </>
             )}
          </ScrollView>

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
  webHeaderInner: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
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
  main: { 
    paddingVertical: 16,
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },

  bannerScroll: { paddingHorizontal: 16, marginBottom: 25 },
  bannerCard: { marginRight: 12 },
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
  
  squareCard: { backgroundColor: '#FFF' },
  squareImage: { width: '100%', height: 110, borderRadius: 15 },
  squareInfo: { marginTop: 8 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  cardSub: { fontSize: 11, color: '#999', flex: 1 },
  cardPrice: { fontSize: 13, fontWeight: '700', color: '#FF7D01', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 11, fontWeight: '700', color: '#444' },

  list: { gap: 15, paddingHorizontal: 16, marginBottom: 25 },
  listWeb: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  listCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 15, padding: 8, borderWidth: 1, borderColor: '#FAFAFA' },
  listImage: { width: 60, height: 60, borderRadius: 12 },
  listInfo: { flex: 1, marginLeft: 12 },
  listTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  listSub: { fontSize: 11, color: '#999', marginVertical: 2 },
  listPrice: { fontSize: 13, fontWeight: '700', color: '#FF7D01' },
  addBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', justifyContent: 'center', alignItems: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalOverlayWeb: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  addressModalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 34 },
  addressModalContentWeb: { maxWidth: 500, width: '100%', borderRadius: 24, paddingBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  addressItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#F0F0F0', backgroundColor: '#FAFAFA' },
  addressItemActive: { borderColor: Colors.primary, backgroundColor: '#FFF8F2' },
  addressIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  addressLabelText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  addressFullText: { fontSize: 12, color: '#777', marginTop: 2 },
  tagBadge: { backgroundColor: '#FF7D0120', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagText: { color: '#FF7D01', fontSize: 10, fontWeight: '700' },
  addAddressModalBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, marginTop: 12, gap: 6 },
  addAddressModalBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});

export default CustomerHomeScreen;
