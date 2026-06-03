import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const CustomerProfileScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState({
    orders: true,
    promotions: true,
    recommendations: false,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* User Info Card */}
        <View style={styles.userCard}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' }} 
            style={styles.avatar} 
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Emeka Nobis</Text>
            <Text style={styles.userMeta}>emeka.okafor@example.com</Text>
            <Text style={styles.userMeta}>+2349033030303</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <MaterialCommunityIcons name="square-edit-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Loyalty Card */}
        <View style={styles.loyaltyCard}>
          <MaterialCommunityIcons name="gift-outline" size={40} color="#FFF" />
          <Text style={styles.loyaltyLabel}>Loyalty points</Text>
          <Text style={styles.loyaltyPoints}>340</Text>
        </View>

        {/* Saved Addresses */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={20} color="#FF8C00" />
            <Text style={styles.sectionTitle}>Saved addresses</Text>
          </View>
          <TouchableOpacity><Text style={styles.addText}>+ Add</Text></TouchableOpacity>
        </View>
        <View style={styles.card}>
          <View style={styles.addressRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.row}>
                <Text style={styles.addressName}>Home</Text>
                <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View>
              </View>
              <Text style={styles.addressText}>12 Marina Road, Lagos Island, Lagos</Text>
            </View>
            <View style={styles.addressActions}>
              <TouchableOpacity><MaterialCommunityIcons name="square-edit-outline" size={20} color="#666" /></TouchableOpacity>
              <TouchableOpacity><MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF5252" /></TouchableOpacity>
            </View>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.addressRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressName}>Office</Text>
              <Text style={styles.addressText}>Plot 8, Akin Adesola Street, Victoria Island</Text>
              <Text style={styles.setDefaultText}>Set default</Text>
            </View>
            <TouchableOpacity><MaterialCommunityIcons name="square-edit-outline" size={20} color="#666" /></TouchableOpacity>
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.addressRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressName}>Mum's</Text>
              <Text style={styles.addressText}>23 Allen Avenue, Ikeja, Lagos</Text>
            </View>
            <View style={styles.addressActions}>
              <TouchableOpacity><MaterialCommunityIcons name="square-edit-outline" size={20} color="#666" /></TouchableOpacity>
              <TouchableOpacity><MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF5252" /></TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="wallet-outline" size={20} color="#FF8C00" />
            <Text style={styles.sectionTitle}>Payment method</Text>
          </View>
          <TouchableOpacity><Text style={styles.addText}>+ Add card</Text></TouchableOpacity>
        </View>
        <View style={styles.card}>
          <View style={styles.paymentRow}>
            <MaterialCommunityIcons name="credit-card-outline" size={24} color="#333" />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.paymentName}>Visa ● ● ● ● 4242</Text>
              <Text style={styles.paymentMeta}>Expires 09/27</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.paymentRow}>
            <MaterialCommunityIcons name="cash" size={24} color="#333" />
            <Text style={[styles.paymentName, { marginLeft: 15 }]}>Cash on delivery</Text>
          </TouchableOpacity>
        </View>

        {/* Notification Preferences */}
        <View style={styles.cardContainer}>
          <Text style={styles.containerTitle}>Notification preferences</Text>
          <View style={styles.card}>
            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefTitle}>Order updates</Text>
                <Text style={styles.prefSubtitle}>Status, driver, delivery</Text>
              </View>
              <Switch 
                value={notifications.orders} 
                onValueChange={(v) => setNotifications({...notifications, orders: v})}
                trackColor={{ true: '#4CD964', false: '#EEE' }}
                thumbColor="#FFF"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefTitle}>Promotion & offers</Text>
                <Text style={styles.prefSubtitle}>Discount and codes</Text>
              </View>
              <Switch 
                value={notifications.promotions} 
                onValueChange={(v) => setNotifications({...notifications, promotions: v})}
                trackColor={{ true: '#4CD964', false: '#EEE' }}
                thumbColor="#FFF"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefTitle}>Recommendations</Text>
                <Text style={styles.prefSubtitle}>Spots you might like</Text>
              </View>
              <Switch 
                value={notifications.recommendations} 
                onValueChange={(v) => setNotifications({...notifications, recommendations: v})}
                trackColor={{ true: '#4CD964', false: '#EEE' }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </View>

        {/* Other Options */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.optionRow}>
            <MaterialCommunityIcons name="gift-outline" size={22} color="#FF8C00" />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.optionTitle}>Refer and earn</Text>
              <Text style={styles.optionSubtitle}>Code: EMEKA340</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.optionRow}>
            <MaterialCommunityIcons name="file-document-outline" size={22} color="#FF8C00" />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.optionTitle}>Terms of service</Text>
              <Text style={styles.optionSubtitle}>Read our terms</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.optionRow}>
            <MaterialCommunityIcons name="shield-outline" size={22} color="#FF8C00" />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.optionTitle}>Privacy policy</Text>
              <Text style={styles.optionSubtitle}>How we use your data</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.optionRow}>
            <MaterialCommunityIcons name="help-circle-outline" size={22} color="#FF8C00" />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.optionTitle}>Help & support</Text>
              <Text style={styles.optionSubtitle}>Talk to our team</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#FF5252" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  backBtn: { padding: 4 },
  scroll: { padding: 16, paddingBottom: 40 },
  
  userCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  avatar: { width: 65, height: 65, borderRadius: 32.5 },
  userInfo: { flex: 1, marginLeft: 15 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  userMeta: { fontSize: 13, color: '#888', marginTop: 2 },
  editBtn: { padding: 8 },

  loyaltyCard: {
    backgroundColor: '#FF8C00',
    borderRadius: 20,
    padding: 24,
    marginBottom: 25,
    alignItems: 'flex-start',
  },
  loyaltyLabel: { color: '#FFF', fontSize: 16, marginTop: 15, opacity: 0.9 },
  loyaltyPoints: { color: '#FFF', fontSize: 48, fontWeight: '900', marginTop: 5 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  addText: { fontSize: 13, color: '#FF8C00', fontWeight: 'bold' },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 25,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  defaultBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  defaultText: { fontSize: 10, color: '#2E7D32', fontWeight: 'bold' },
  addressText: { fontSize: 13, color: '#888', marginTop: 4, lineHeight: 18 },
  addressActions: { flexDirection: 'row', gap: 12 },
  setDefaultText: { fontSize: 12, color: '#FF8C00', marginTop: 6, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 8 },

  paymentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  paymentName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  paymentMeta: { fontSize: 12, color: '#888', marginTop: 2 },

  cardContainer: { marginBottom: 25 },
  containerTitle: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12, paddingHorizontal: 4 },
  prefRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  prefTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  prefSubtitle: { fontSize: 11, color: '#AAA', marginTop: 2 },

  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  optionSubtitle: { fontSize: 12, color: '#AAA', marginTop: 2 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF5252',
    borderRadius: 12,
    padding: 15,
  },
  logoutText: { color: '#FF5252', fontSize: 16, fontWeight: 'bold' },
});

export default CustomerProfileScreen;
