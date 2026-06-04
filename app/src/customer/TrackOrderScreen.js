import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, Image, TouchableOpacity,
  Dimensions, ScrollView, StatusBar, ActivityIndicator, Alert, Modal, TextInput
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { fetchOrderTracking } from '../services/api';

const { width, height } = Dimensions.get('window');

const TrackOrderScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const orderId = route?.params?.orderId || 'ORD-7917';
  
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState(null);
  const [arrivalTime, setArrivalTime] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  useEffect(() => {
    loadTracking();
    const interval = setInterval(loadTracking, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  const loadTracking = async () => {
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

  const currentStatus = trackingData?.status || 'delivered'; // Mocking 'delivered' for this task

  const steps = [
    { title: 'Order confirmed', sub: 'Vendor has accepted your order', status: 'completed' },
    { title: 'Vendor preparing', sub: 'Your items are being packaged', status: ['preparing', 'ready', 'assigned', 'on the way', 'delivered'].includes(currentStatus) ? 'completed' : 'pending' },
    { title: 'Driver assigned', sub: 'Driver is heading to pickup', status: ['assigned', 'on the way', 'delivered'].includes(currentStatus) ? 'completed' : 'pending' },
    { title: 'On the way', sub: 'Driver is heading to you', status: ['on the way', 'delivered'].includes(currentStatus) ? 'completed' : 'pending' },
    { title: 'Delivered', sub: 'Enjoy your meal!', status: currentStatus === 'delivered' ? 'completed' : 'pending' },
  ];

  const handleReviewSubmit = () => {
    Alert.alert('Success', 'Thank you for your feedback!');
    setShowReviewModal(false);
  };

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
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Track order</Text>
          <Text style={styles.headerOrderId}>{orderId}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.mapContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80' }}
            style={styles.mapImage}
          />
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusLabel}>{currentStatus === 'delivered' ? 'Delivered' : 'Arriving in'}</Text>
              <Text style={styles.statusTime}>{currentStatus === 'delivered' ? 'Today' : `${arrivalTime} min`}</Text>
            </View>
            <View style={styles.statusInfoRight}>
              <Text style={styles.statusLabelSmall}>Status</Text>
              <Text style={[styles.statusMain, currentStatus === 'delivered' && { color: '#27A572' }]}>
                {currentStatus === 'delivered' ? 'Delivered successfully' : 'Driver heading to you'}
              </Text>
            </View>
          </View>
        </View>

        {/* Driver Info Card */}
        <View style={styles.driverCard}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' }} style={styles.driverPic} />
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>Kola Adeleke</Text>
            <View style={styles.driverMeta}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.driverRating}>4.8</Text>
              <View style={styles.dot} />
              <Text style={styles.driverVehicle}>Honda CB | LSR-432-AB</Text>
            </View>
          </View>
          <View style={styles.driverActions}>
             <TouchableOpacity style={styles.driverActionBtn} onPress={() => Alert.alert('Call', 'Calling driver...')}>
               <Ionicons name="call" size={18} color="#27A572" />
             </TouchableOpacity>
             <TouchableOpacity style={styles.driverActionBtnChat} onPress={() => navigation.navigate('ChatDetail', { name: 'Kola Adeleke', type: 'Driver' })}>
               <Ionicons name="chatbubble-ellipses" size={18} color="#FF7D01" />
             </TouchableOpacity>
          </View>
        </View>

        <View style={styles.timeline}>
          {steps.map((step, idx) => (
            <View key={idx} style={styles.stepContainer}>
              <View style={styles.indicatorCol}>
                <View style={[styles.circle, step.status === 'completed' ? styles.circleActive : styles.circlePending]}>
                  {step.status === 'completed' && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </View>
                {idx !== steps.length - 1 && <View style={[styles.line, step.status === 'completed' ? styles.lineActive : styles.linePending]} />}
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={[styles.stepTitle, step.status === 'pending' && styles.textPending]}>{step.title}</Text>
                <Text style={styles.stepSub}>{step.sub}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 15) }]}>
        {currentStatus === 'delivered' ? (
          <View style={{ gap: 10 }}>
            <TouchableOpacity style={styles.rateBtn} onPress={() => setShowReviewModal(true)}>
              <Text style={styles.rateBtnText}>Rate & review</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.orderAgainBtn} onPress={() => navigation.navigate('CustomerHome')}>
              <Text style={styles.orderAgainText}>Order again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.actionBtn} disabled>
            <Text style={styles.actionBtnText}>Placing order</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Review Modal */}
      <Modal visible={showReviewModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.reviewContent}>
            <TouchableOpacity style={styles.closeModal} onPress={() => setShowReviewModal(false)}>
              <Ionicons name="close" size={24} color="#CCC" />
            </TouchableOpacity>
            <Text style={styles.reviewMainTitle}>Rate & Review Order</Text>
            <Text style={styles.reviewSub}>You'll need to sign back in to receive orders.</Text>
            
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Ionicons name="star" size={32} color={s <= rating ? "#FFD700" : "#EEE"} />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="write something..."
              multiline
              value={review}
              onChangeText={setReview}
            />

            <TouchableOpacity style={styles.submitReviewBtn} onPress={handleReviewSubmit}>
              <Text style={styles.submitReviewText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#FFF', height: 80, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { padding: 4 },
  headerInfo: { alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  headerOrderId: { fontSize: 11, color: '#999', marginTop: 2 },
  scroll: { paddingBottom: 120 },
  mapContainer: { width: '100%', height: height * 0.35, backgroundColor: '#EEE' },
  mapImage: { width: '100%', height: '100%', opacity: 0.5 },
  statusCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, width: width - 32, alignSelf: 'center', marginTop: -40, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { fontSize: 11, color: '#999', fontWeight: '500' },
  statusTime: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginTop: 4 },
  statusInfoRight: { alignItems: 'flex-end' },
  statusLabelSmall: { fontSize: 10, color: '#999', fontWeight: '500' },
  statusMain: { fontSize: 15, fontWeight: '700', color: '#FF7D01', marginTop: 4 },
  driverCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, width: width - 32, alignSelf: 'center', marginTop: 15, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  driverPic: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#000' },
  driverInfo: { flex: 1, marginLeft: 12 },
  driverName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  driverMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  driverRating: { fontSize: 11, color: '#999', marginLeft: 3 },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#CCC', marginHorizontal: 6 },
  driverVehicle: { fontSize: 11, color: '#999' },
  driverActions: { flexDirection: 'row', gap: 10 },
  driverActionBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F0FAF6', justifyContent: 'center', alignItems: 'center' },
  driverActionBtnChat: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF5F0', justifyContent: 'center', alignItems: 'center' },
  timeline: { padding: 30, paddingTop: 30 },
  stepContainer: { flexDirection: 'row', minHeight: 70 },
  indicatorCol: { alignItems: 'center', width: 30, marginRight: 15 },
  circle: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  circleActive: { backgroundColor: '#27A572' },
  circlePending: { backgroundColor: '#F0F0F0' },
  line: { width: 2, flex: 1, backgroundColor: '#F0F0F0' },
  lineActive: { backgroundColor: '#27A572' },
  linePending: { backgroundColor: '#F0F0F0' },
  stepTextContainer: { flex: 1, paddingTop: 0 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  stepSub: { fontSize: 12, color: '#999', marginTop: 2 },
  textPending: { color: '#CCC' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#FFF' },
  rateBtn: { backgroundColor: '#FF7D01', padding: 16, borderRadius: 12, alignItems: 'center' },
  rateBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  orderAgainBtn: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#DDD' },
  orderAgainText: { color: '#333', fontSize: 16, fontWeight: '700' },
  actionBtn: { backgroundColor: '#FF7D01', padding: 18, borderRadius: 12, alignItems: 'center', opacity: 0.5 },
  actionBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  reviewContent: { backgroundColor: '#FFF', width: width * 0.85, borderRadius: 20, padding: 25, position: 'relative' },
  closeModal: { position: 'absolute', top: 20, right: 20 },
  reviewMainTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginTop: 10 },
  reviewSub: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 8 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 20 },
  reviewInput: { backgroundColor: '#F9F9F9', borderRadius: 10, padding: 15, height: 120, textAlignVertical: 'top', fontSize: 14, color: '#333', borderWidth: 1, borderColor: '#EEE' },
  submitReviewBtn: { backgroundColor: '#FF7D01', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  submitReviewText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default TrackOrderScreen;
