import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Image, Dimensions, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const BANNER_HEIGHT = 200;

const OPENING_HOURS = [
  { day: 'Monday',    hours: '0800 - 1700' },
  { day: 'Tuesday',   hours: '0800 - 1700' },
  { day: 'Wednesday', hours: '0800 - 1700' },
  { day: 'Thursday',  hours: '0800 - 1700' },
  { day: 'Friday',    hours: '0800 - 1700' },
  { day: 'Saturday',  hours: 'Closed' },
  { day: 'Sunday',    hours: 'Closed' },
];

const DELIVERY_LOCATIONS = ['Victoria Island', 'Ikoyi', 'Lekki Phase 1', 'Ajah'];

const VendorProfileScreen = ({ navigation }) => {
  const [bannerUri] = useState(
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'
  );
  const [profileUri] = useState(
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'
  );

  const [notifications, setNotifications] = useState({
    newOrders: true,
    statusUpdates: true,
    payouts: false,
    promotions: true
  });

  const toggleNotif = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Banner ── */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: bannerUri }} style={styles.bannerImage} resizeMode="cover" />

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#1a1a1a" />
          </TouchableOpacity>

          {/* Camera icon on banner */}
          <TouchableOpacity style={styles.bannerCameraBtn}>
            <Ionicons name="camera" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* ── Profile row ── */}
        <View style={styles.profileRow}>
          {/* Profile image overlapping banner */}
          <View style={styles.profileImgWrapper}>
            <Image source={{ uri: profileUri }} style={styles.profileImg} resizeMode="cover" />
            <TouchableOpacity style={styles.profileCameraBtn}>
              <Ionicons name="camera" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Name & rating */}
          <View style={styles.profileInfo}>
            <Text style={styles.businessName}>Mama's Kitchen</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color="#F1C40F" />
              <Text style={styles.ratingText}>4.8</Text>
              <Text style={styles.ordersText}>  1248 orders</Text>
            </View>
          </View>
        </View>

        {/* ── Business Details ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Business details</Text>
            <TouchableOpacity>
              <Text style={styles.editLink}>Edit ›</Text>
            </TouchableOpacity>
          </View>

          {[
            { label: 'Category', value: 'Local dishes' },
            { label: 'Phone',    value: '+234800000000' },
            { label: 'Email',    value: 'info@mamaskitchen.ng' },
            { label: 'Address',  value: '14 Secretariat Avenue, Ikeja, La...' },
            { label: 'About',    value: 'Authentic Nigerian home-style cooking made fresh daily.' },
          ].map((item, idx, arr) => (
            <View key={item.label} style={[styles.detailRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.detailLabel}>{item.label}</Text>
              <Text style={[styles.detailValue, item.label === 'About' && { textAlign: 'right', flex: 1.5 }]}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Opening Hours ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Opening hours</Text>
            <TouchableOpacity>
              <Text style={styles.editLink}>Edit ›</Text>
            </TouchableOpacity>
          </View>

          {OPENING_HOURS.map((item, idx) => (
            <View key={item.day} style={[styles.detailRow, idx === OPENING_HOURS.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.detailLabel}>{item.day}</Text>
              <Text style={[
                styles.detailValue,
                item.hours === 'Closed' && { color: '#E74C3C', fontWeight: '600' }
              ]}>
                {item.hours}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Delivery Locations ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery locations</Text>
            <TouchableOpacity>
              <Text style={styles.editLink}>Edit ›</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.locationChips}>
            {DELIVERY_LOCATIONS.map((loc) => (
              <View key={loc} style={styles.chip}>
                <Text style={styles.chipText}>{loc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Payout Account ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payout account</Text>
            <TouchableOpacity>
              <Text style={styles.editLink}>Edit ›</Text>
            </TouchableOpacity>
          </View>
          {[
            { label: 'Bank', value: 'Access Bank' },
            { label: 'Account name', value: "Mama's Kitchen Ltd" },
            { label: 'Account number', value: '636363633663' },
          ].map((item, idx, arr) => (
            <View key={item.label} style={[styles.detailRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.detailLabel}>{item.label}</Text>
              <Text style={styles.detailValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* ── Notifications Preferences ── */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Notifications preferences</Text>
          
          {[
            { key: 'newOrders', title: 'New orders', sub: 'Get notified instantly' },
            { key: 'statusUpdates', title: 'Order status updates', sub: 'Driver pickup, delivery' },
            { key: 'payouts', title: 'Payouts', sub: 'When funds arrive in your account' },
            { key: 'promotions', title: 'Promotions & tips', sub: 'Marketing offers and growth tips' },
          ].map((item, idx, arr) => (
            <View key={item.key} style={[styles.notifRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifSub}>{item.sub}</Text>
              </View>
              <Switch
                value={notifications[item.key]}
                onValueChange={() => toggleNotif(item.key)}
                trackColor={{ true: '#27AE60', false: '#DDD' }}
                thumbColor="#FFF"
              />
            </View>
          ))}
        </View>

        {/* ── Help & Support ── */}
        <TouchableOpacity style={styles.helpRow}>
          <View style={styles.helpIconBg}>
            <Ionicons name="help-circle-outline" size={20} color="#666" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.helpTitle}>Help & support</Text>
            <Text style={styles.helpSub}>Talk to our team</Text>
          </View>
        </TouchableOpacity>

        {/* ── Logout ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.replace('Auth')}>
          <View style={styles.logoutContent}>
            <Ionicons name="log-out-outline" size={18} color="#E74C3C" />
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F4F4' },

  // Banner
  bannerContainer: {
    width,
    height: BANNER_HEIGHT,
    position: 'relative',
    backgroundColor: '#EEE',
  },
  bannerImage: { width: '100%', height: '100%' },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerCameraBtn: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF8C00',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Profile row
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    marginTop: -40,
    paddingTop: 0,
  },
  profileImgWrapper: {
    width: 80,
    height: 80,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#FF8C00',
    overflow: 'hidden',
    position: 'relative',
    marginTop: -20,
  },
  profileImg: { width: '100%', height: '100%' },
  profileCameraBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF8C00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { marginLeft: 14, paddingBottom: 4 },
  businessName: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', marginLeft: 4 },
  ordersText: { fontSize: 12, color: '#AAA' },

  // Section card
  sectionCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  editLink: { fontSize: 13, color: '#FF8C00', fontWeight: '500' },

  // Detail rows
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderColor: '#F8F8F8',
  },
  detailLabel: { fontSize: 13, color: '#AAA', flex: 1, fontWeight: '400' },
  detailValue: { fontSize: 13, color: '#1a1a1a', fontWeight: '500', textAlign: 'right', flex: 1 },

  // Chips
  locationChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFDEDE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { fontSize: 11, color: '#E74C3C', fontWeight: '500' },

  // Notifications
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F8F8F8',
  },
  notifTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  notifSub: { fontSize: 11, color: '#AAA', marginTop: 1 },

  // Help row
  helpRow: {
    backgroundColor: '#FFF',
    marginHorizontal: 14,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  helpIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  helpSub: { fontSize: 12, color: '#AAA' },

  // Logout
  logoutBtn: {
    marginHorizontal: 14,
    marginTop: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FADBD8',
    backgroundColor: '#FEF9F9',
    padding: 14,
  },
  logoutContent: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  logoutText: { color: '#E74C3C', fontSize: 14, fontWeight: '700' },
});

export default VendorProfileScreen;
