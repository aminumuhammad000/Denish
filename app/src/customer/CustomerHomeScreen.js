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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRestaurants, getCustomerProfile } from '../services/api';
import { ActivityIndicator } from 'react-native';

const { width } = Dimensions.get('window');

const FeaturedCard = ({ name, category, rating, image, onPress }) => (
  <TouchableOpacity style={styles.featuredCard} onPress={onPress}>
    <Image source={{ uri: image }} style={styles.featuredImage} />
    <View style={styles.featuredInfo}>
      <View style={styles.featuredTextRow}>
        <Text style={styles.featuredName}>{name}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      </View>
      <Text style={styles.featuredCategory}>{category}</Text>
    </View>
  </TouchableOpacity>
);

const FoodCard = ({ name, image }) => (
  <TouchableOpacity style={styles.foodCard}>
    <Image source={{ uri: image }} style={styles.foodImage} />
    <Text style={styles.foodName}>{name}</Text>
  </TouchableOpacity>
);

const CustomerHomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [vendors, setVendors] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [resVendors, resProfile] = await Promise.all([
          getRestaurants(),
          getCustomerProfile().catch(() => ({ success: false })) // Don't block if profile fails
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

        {/* --- ORANGE HEADER --- */}
        <View style={styles.headerBackground}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.profileRow} onPress={() => navigation.navigate('CustomerProfile')}>
                <Image
                  source={{ uri: profile?.profilePic || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' }}
                  style={styles.profilePic}
                />
                <View>
                  <Text style={styles.greetingText}>Good afternoon,</Text>
                  <Text style={styles.userName}>{profile?.name?.split(' ')[0] || 'Member'}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.headerIcons}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('ChatList')}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFF" />
                  </View>
                  <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="cart-outline" size={22} color="#FFF" />
                  </View>
                  <View style={styles.badge}><Text style={styles.badgeText}>2</Text></View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchSection}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#999" style={{ marginLeft: 5 }} />
                <TextInput
                  placeholder="Search items, dishes or vendors"
                  placeholderTextColor="#999"
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                />
              </View>
              <TouchableOpacity style={styles.locationContainer}>
                <Ionicons name="location-sharp" size={14} color="#FFF" style={{ opacity: 0.9 }} />
                <Text style={styles.locationText}>Deliver to Lagos Island</Text>
                <Ionicons name="chevron-down" size={12} color="#FFF" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* --- MAIN CONTENT --- */}
        <View style={styles.content}>

          {/* Hero Banner */}
          <View style={styles.heroBanner}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1610412140134-933333333333?w=800&q=80&q=motorbike+helmet+delivery' }}
              style={styles.heroImage}
            />
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle}>Free delivery</Text>
              <Text style={styles.heroSubtitle}>On your first 3 orders this week</Text>
            </View>
          </View>

          {/* Featured Vendors */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured vendors</Text>
            <TouchableOpacity><Text style={styles.viewAll}>View all</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {loading ? (
              <ActivityIndicator color={Colors.primary} style={{ marginLeft: 20 }} />
            ) : (
              vendors.map((v) => (
                <FeaturedCard
                  key={v._id}
                  name={v.businessName || v.name}
                  category={v.category || "Provisions"}
                  rating="4.8"
                  image={v.logoUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400"}
                  onPress={() => navigation.navigate('CustomerRestaurant', { restaurantId: v._id })}
                />
              ))
            )}
          </ScrollView>

          {/* Cooked Foods */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cooked Foods</Text>
          </View>
          <View style={styles.gridRow}>
            <FoodCard
              name="Jollof Rice Special"
              image="https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?w=400"
            />
            <FoodCard
              name="Grilled Fish"
              image="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400"
            />
          </View>

        </View>
      </ScrollView>

      {/* --- BOTTOM TAB BAR --- */}
      <View style={[styles.bottomTab, { paddingBottom: Math.max(insets.bottom, 10), height: 60 + insets.bottom }]}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home-outline" size={24} color={Colors.primary} />
          <Text style={[styles.tabLabel, { color: Colors.primary }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <MaterialCommunityIcons name="shopping-outline" size={24} color="#999" />
          <Text style={styles.tabLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ChatList')}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#999" />
          <Text style={styles.tabLabel}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('CustomerProfile')}>
          <Ionicons name="person-outline" size={24} color="#999" />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerBackground: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profilePic: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  greetingText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  userName: {
    color: '#FFF',
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: -2,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    position: 'relative',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF3B30',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF8C00',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  searchSection: {
    gap: 12,
  },
  searchBar: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  locationText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: 20,
  },
  heroBanner: {
    width: '100%',
    height: 160,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 25,
    backgroundColor: '#F5F5F5',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.95,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 25,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: -0.3,
  },
  viewAll: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  horizontalScroll: {
    paddingRight: 20,
    gap: 16,
    marginBottom: 30,
  },
  featuredCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    width: width * 0.44,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 120,
  },
  featuredInfo: {
    padding: 12,
  },
  featuredTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  featuredName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  featuredCategory: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#444',
  },
  foodCard: {
    width: (width - 44) / 2,
  },
  foodImage: {
    width: '100%',
    height: 110,
    borderRadius: 12,
    marginBottom: 6,
  },
  foodName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  bottomTab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: 5,
  },
  tabItem: {
    alignItems: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
  },
});

export default CustomerHomeScreen;
