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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* --- ORANGE HEADER --- */}
        <View style={styles.headerBackground}>
          <SafeAreaView>
            <View style={styles.headerTop}>
              <View style={styles.profileRow}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' }}
                  style={styles.profilePic}
                />
                <View>
                  <Text style={styles.greetingText}>Good afternoon,</Text>
                  <Text style={styles.userName}>Emeka</Text>
                </View>
              </View>
              <View style={styles.headerIcons}>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="chatbubble-ellipses-outline" size={24} color="#FFF" />
                  <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="cart-outline" size={26} color="#FFF" />
                  <View style={styles.badge}><Text style={styles.badgeText}>2</Text></View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchSection}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={22} color="#999" />
                <TextInput
                  placeholder="Search items, dishes or vendors"
                  placeholderTextColor="#999"
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                />
              </View>
              <TouchableOpacity style={styles.locationContainer}>
                <Ionicons name="location-sharp" size={16} color="#FFF" style={{ opacity: 0.7 }} />
                <Text style={styles.locationText}>Deliver to Lagos Island</Text>
                <Ionicons name="chevron-down" size={14} color="#FFF" />
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
            <FeaturedCard
              name="Temmy Store"
              category="Provisions"
              rating="4.8"
              image="https://images.unsplash.com/photo-1542838132-92c53300491e?w=400"
            />
            <FeaturedCard
              name="Mama's Kitchen"
              category="Local Dishes"
              rating="4.9"
              image="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400"
            />
            <FeaturedCard
              name="Gourmet Hub"
              category="Continental"
              rating="4.7"
              image="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400"
            />
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
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#999" />
          <Text style={styles.tabLabel}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 15,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  greetingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
  userName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    padding: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: Colors.primary,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 7,
    fontWeight: 'bold',
  },
  searchSection: {
    gap: 10,
  },
  searchBar: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  locationText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  content: {
    padding: 16,
  },
  heroBanner: {
    width: '100%',
    height: 150,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#000',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAll: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  horizontalScroll: {
    paddingRight: 20,
    gap: 15,
    marginBottom: 25,
  },
  featuredCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: width * 0.45,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 110,
  },
  featuredInfo: {
    padding: 8,
  },
  featuredTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  featuredName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  featuredCategory: {
    fontSize: 10,
    color: '#888',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
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
