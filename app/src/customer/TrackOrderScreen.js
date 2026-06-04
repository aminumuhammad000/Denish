import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, Image, TouchableOpacity,
  Dimensions, ScrollView, StatusBar, ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { fetchOrderTracking } from '../services/api';

const { width, height } = Dimensions.get('window');

const TrackOrderScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const orderId = route?.params?.orderId;
  
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState(null);
  const [arrivalTime, setArrivalTime] = useState(0);

  useEffect(() => {
    loadTracking();
    // Poll for updates every 30 seconds
    const interval = setInterval(loadTracking, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  const loadTracking = async () => {
    if (!orderId) return;
    try {
      const res = await fetchOrderTracking(orderId);
      if (res.success) {
        setTrackingData(res.data);
        setArrivalTime(res.data.estimatedArrival);
      }
    } catch (err) {
      console.error('Tracking fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Order placed';
      case 'preparing': return 'Preparing your meal';
      case 'ready': return 'Order is ready';
      case 'assigned': return 'Driver picking up';
      case 'on the way': return 'Driver on the way';
      case 'delivered': return 'Order delivered';
      default: return 'Order confirmed';
    }
  };

  const steps = [
    { title: 'Order confirmed', status: 'completed' },
    { title: 'Vendor preparing', status: ['preparing', 'ready', 'assigned', 'on the way', 'delivered'].includes(trackingData?.status) ? 'completed' : 'pending' },
    { title: 'Driver assigned', status: ['assigned', 'on the way', 'delivered'].includes(trackingData?.status) ? 'completed' : 'pending' },
    { title: 'On the way', status: ['on the way', 'delivered'].includes(trackingData?.status) ? 'completed' : 'pending' },
    { title: 'Delivered', status: trackingData?.status === 'delivered' ? 'completed' : 'pending' },
  ];

  if (loading && !trackingData) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, height: insets.top + 70 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <Text style={styles.headerOrderId}>ID: {orderId}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mapContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80' }}
          style={styles.mapImage}
        />
        <View style={styles.mapOverlay} />
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View>
            <Text style={styles.statusLabel}>Arriving in</Text>
            <Text style={styles.statusTime}>{arrivalTime} min</Text>
          </View>
          <View style={styles.statusInfoRight}>
            <Text style={styles.statusLabelSmall}>Status</Text>
            <Text style={styles.statusMain}>{getStatusText(trackingData?.status)}</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.timeline}>
          {steps.map((step, idx) => (
            <View key={idx} style={styles.stepContainer}>
              <View style={styles.indicatorCol}>
                <View style={[
                  styles.dot, 
                  step.status === 'completed' ? styles.dotActive : styles.dotPending
                ]}>
                  {step.status === 'completed' && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </View>
                {idx !== steps.length - 1 && (
                  <View style={[
                    styles.line, 
                    step.status === 'completed' ? styles.lineActive : styles.linePending
                  ]} />
                )}
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={[styles.stepTitle, step.status === 'pending' && styles.textPending]}>
                  {step.title}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 15) }]}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('CustomerHome')}>
          <Text style={styles.actionBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', zIndex: 10 },
  backBtn: { padding: 4 },
  headerInfo: { alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a', letterSpacing: -0.5 },
  headerOrderId: { fontSize: 11, color: '#666', fontWeight: '600', marginTop: 2, textTransform: 'uppercase' },

  mapContainer: { width: '100%', height: height * 0.3, backgroundColor: '#EEE' },
  mapImage: { width: '100%', height: '100%', opacity: 0.4 },
  mapOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.2)' },

  statusCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, width: width - 32, alignSelf: 'center', marginTop: -30, borderWidth: 1, borderColor: '#EEE' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { fontSize: 11, color: '#AAA', fontWeight: '500' },
  statusTime: { fontSize: 22, fontWeight: '900', color: '#1a1a1a', marginTop: 2 },
  statusInfoRight: { alignItems: 'flex-end' },
  statusLabelSmall: { fontSize: 10, color: '#AAA', fontWeight: '500' },
  statusMain: { fontSize: 14, fontWeight: '700', color: Colors.primary, marginTop: 2 },

  scroll: { padding: 16, paddingTop: 20, paddingBottom: 100 },
  timeline: { paddingHorizontal: 8 },
  stepContainer: { flexDirection: 'row', minHeight: 60 },
  indicatorCol: { alignItems: 'center', width: 40, marginRight: 12 },
  dot: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  dotActive: { backgroundColor: '#27A572' },
  dotPending: { backgroundColor: '#F0F0F0' },
  line: { width: 2, flex: 1, marginTop: -2, marginBottom: -2 },
  lineActive: { backgroundColor: '#27A572' },
  linePending: { backgroundColor: '#F5F5F5' },
  stepTextContainer: { flex: 1, paddingTop: 4 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  textPending: { color: '#999', fontWeight: '500' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'transparent' },
  actionBtn: { backgroundColor: Colors.primary, padding: 18, borderRadius: 15, alignItems: 'center' },
  actionBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default TrackOrderScreen;
