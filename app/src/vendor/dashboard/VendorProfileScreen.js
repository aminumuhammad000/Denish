import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Image, Dimensions, Switch, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getVendorDashboardData, updateVendorProfile, uploadVendorImages } from '../../services/api';
import { clearAuthSession } from '../../services/authStorage';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');
const BANNER_HEIGHT = 200;

const VendorProfileScreen = ({ navigation }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await getVendorDashboardData();
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const toggleNotif = async (key) => {
    try {
      const updatedNotifs = { ...data.notifications, [key]: !data.notifications[key] };
      // Optimistic UI
      setData({ ...data, notifications: updatedNotifs });
      await updateVendorProfile({ notifications: updatedNotifs });
    } catch (err) {
      console.error(err);
      fetchProfile(); // Revert on error
    }
  };

  const pickImage = async (type) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: type === 'logo' ? [1, 1] : [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      handleImageUpload(type, result.assets[0].uri);
    }
  };

  const [uploading, setUploading] = useState(false);
  const isDarkMode = false;

  const handleImageUpload = async (type, uri) => {
    setUploading(true);
    try {
      const logoUri = type === 'logo' ? uri : null;
      const coverUri = type === 'cover' ? uri : null;
      
      const response = await uploadVendorImages(logoUri, coverUri);
      if (response.success) {
        // Persist to database
        const payload = {};
        if (type === 'logo') payload.logoUrl = response.logoUrl;
        if (type === 'cover') payload.coverUrl = response.coverUrl;
        
        await updateVendorProfile(payload);
        
        // Refresh profile to show new image
        fetchProfile();
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Upload Error', err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  if (!data) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>

        {/* ── Banner ── */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: data.coverUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80' }} style={styles.bannerImage} resizeMode="cover" />

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#1a1a1a" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.bannerCameraBtn} onPress={() => pickImage('cover')} disabled={uploading}>
            {uploading ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="camera" size={18} color="#FFF" />}
          </TouchableOpacity>
        </View>

        {/* ── Profile row ── */}
        <View style={styles.profileRow}>
          <View style={styles.profileImgWrapper}>
            <Image source={{ uri: data.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80' }} style={styles.profileImg} resizeMode="cover" />
            <TouchableOpacity style={styles.profileCameraBtn} onPress={() => pickImage('logo')} disabled={uploading}>
              {uploading ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="camera" size={14} color="#FFF" />}
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.businessName}>{data.businessName || "Mama's Kitchen"}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color="#F1C40F" />
              <Text style={styles.ratingText}>4.8</Text>
              <Text style={styles.ordersText}>  {data.earnings?.totalOrders || 1248} orders</Text>
            </View>
          </View>
        </View>

        {/* ── Business Details ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Business details</Text>
            <TouchableOpacity onPress={() => navigation.navigate('VendorEditProfile', { type: 'business', initialData: data })}>
              <Text style={styles.editLink}>Edit ›</Text>
            </TouchableOpacity>
          </View>

          {[
            { label: 'Category', value: data.category || 'Local dishes' },
            { label: 'Phone',    value: data.phone || '+234800000000' },
            { label: 'Email',    value: data.email || 'info@mamaskitchen.ng' },
            { label: 'Address',  value: (data.address || '14 Secretariat Avenue...').substring(0, 30) + '...' },
            { label: 'About',    value: data.about || 'Authentic Nigerian home-style...' },
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
            <TouchableOpacity onPress={() => navigation.navigate('VendorEditProfile', { type: 'hours', initialData: data.openingHours })}>
              <Text style={styles.editLink}>Edit ›</Text>
            </TouchableOpacity>
          </View>

          {(data.openingHours || []).map((item, idx) => (
            <View key={item.day} style={[styles.detailRow, idx === (data.openingHours?.length - 1) && { borderBottomWidth: 0 }]}>
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
            <TouchableOpacity onPress={() => navigation.navigate('VendorEditProfile', { type: 'locations', initialData: data.deliveryLocations })}>
              <Text style={styles.editLink}>Edit ›</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.locationChips}>
            {(data.deliveryLocations || []).map((loc) => (
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
            <TouchableOpacity onPress={() => navigation.navigate('VendorEditProfile', { type: 'payout', initialData: data.payoutAccount })}>
              <Text style={styles.editLink}>Edit ›</Text>
            </TouchableOpacity>
          </View>
          {[
            { label: 'Bank', value: data.payoutAccount?.bank || 'Access Bank' },
            { label: 'Account name', value: data.payoutAccount?.accountName || "Mama's Kitchen Ltd" },
            { label: 'Account number', value: data.payoutAccount?.accountNumber || '636363633663' },
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
                value={data.notifications?.[item.key] || false}
                onValueChange={() => toggleNotif(item.key)}
                trackColor={{ true: '#27AE60', false: '#DDD' }}
                thumbColor="#FFF"
              />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.helpRow}>
          <View style={styles.helpIconBg}>
            <Ionicons name="help-circle-outline" size={20} color="#666" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.helpTitle}>Help & support</Text>
            <Text style={styles.helpSub}>Talk to our team</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={async () => {
          await clearAuthSession();
          navigation.reset({
            index: 0,
            routes: [{ name: 'RoleSelection' }],
          });
        }}>
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
  bannerContainer: { width, height: BANNER_HEIGHT, position: 'relative', backgroundColor: '#EEE' },
  bannerImage: { width: '100%', height: '100%' },
  backBtn: { position: 'absolute', top: 50, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  bannerCameraBtn: { position: 'absolute', top: 50, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF8C00', alignItems: 'center', justifyContent: 'center' },
  profileRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 14, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#F0F0F0', marginTop: -40, paddingTop: 0 },
  profileImgWrapper: { width: 80, height: 80, borderRadius: 14, borderWidth: 3, borderColor: '#FF8C00', overflow: 'hidden', position: 'relative', marginTop: -20 },
  profileImg: { width: '100%', height: '100%' },
  profileCameraBtn: { position: 'absolute', bottom: 4, right: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FF8C00', alignItems: 'center', justifyContent: 'center' },
  profileInfo: { marginLeft: 14, paddingBottom: 4 },
  businessName: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', marginLeft: 4 },
  ordersText: { fontSize: 12, color: '#AAA' },
  sectionCard: { backgroundColor: '#FFF', marginHorizontal: 14, marginTop: 14, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#EFEFEF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  editLink: { fontSize: 13, color: '#FF8C00', fontWeight: '500' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 11, borderBottomWidth: 1, borderColor: '#F8F8F8' },
  detailLabel: { fontSize: 13, color: '#AAA', flex: 1, fontWeight: '400' },
  detailValue: { fontSize: 13, color: '#1a1a1a', fontWeight: '500', textAlign: 'right', flex: 1 },
  locationChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FFDEDE', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontSize: 11, color: '#E74C3C', fontWeight: '500' },
  notifRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F8F8F8' },
  notifTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  notifSub: { fontSize: 11, color: '#AAA', marginTop: 1 },
  helpRow: { backgroundColor: '#FFF', marginHorizontal: 14, marginTop: 20, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EFEFEF' },
  helpIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8F8F8', justifyContent: 'center', alignItems: 'center' },
  helpTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  helpSub: { fontSize: 12, color: '#AAA' },
  logoutBtn: { marginHorizontal: 14, marginTop: 24, borderRadius: 12, borderWidth: 1, borderColor: '#FADBD8', backgroundColor: '#FEF9F9', padding: 14 },
  logoutContent: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  logoutText: { color: '#E74C3C', fontSize: 14, fontWeight: '700' },
});

export default VendorProfileScreen;
