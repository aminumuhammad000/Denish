import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, Image, TouchableOpacity,
  Dimensions, ScrollView, StatusBar, ActivityIndicator, Alert, Modal, TextInput
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { fetchOrderTracking, submitOrderReview } from '../services/api';
import GoogleMapView from '../components/GoogleMapView';

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
  const [driverRating, setDriverRating] = useState(5);
  const [driverReview, setDriverReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadTracking();
    const interval = setInterval(loadTracking, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const loadTracking = async () => {
    try {
      const res = await fetchOrderTracking(orderId);
      if (res.success && res.data) {
        setTrackingData(res.data);
        setArrivalTime(res.data.estimatedArrival);
        if (res.data.rating) setRating(Number(res.data.rating));
        if (res.data.review) setReview(res.data.review);
        if (res.data.driverRating) setDriverRating(Number(res.data.driverRating));
        if (res.data.driverReview) setDriverReview(res.data.driverReview);
      }
    } catch (err) {
      console.error('Tracking fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = trackingData?.status || 'placed'; // Live MongoDB order status

  const steps = [
    { title: 'Order confirmed', sub: 'Vendor has accepted your order', status: ['placed', 'accepted', 'preparing', 'assigned', 'on the way', 'delivered'].includes(currentStatus) ? 'completed' : 'pending' },
    { title: 'Vendor preparing', sub: 'Your items are being packaged', status: ['preparing', 'assigned', 'on the way', 'delivered'].includes(currentStatus) ? 'completed' : 'pending' },
    { title: 'Driver assigned', sub: 'Driver is heading to pickup', status: ['assigned', 'on the way', 'delivered'].includes(currentStatus) ? 'completed' : 'pending' },
    { title: 'On the way', sub: 'Driver is heading to you', status: ['on the way', 'delivered'].includes(currentStatus) ? 'completed' : 'pending' },
    { title: 'Delivered', sub: 'Enjoy your meal!', status: currentStatus === 'delivered' ? 'completed' : 'pending' },
  ];

  const handleCallDriver = () => {
    navigation.navigate('Calling', {
      name: trackingData?.driverName || 'Delivery Partner',
      phone: trackingData?.driverPhone || '',
      receiverId: trackingData?.driverId || undefined,
      orderId,
      subtitle: trackingData?.totalAmount ? `Order ₦${Number(trackingData.totalAmount).toLocaleString()}` : `Order #${orderId}`
    });
  };

  const handleReviewSubmit = async () => {
    if (!rating || rating < 1 || rating > 5) {
      Alert.alert('Rating Required', 'Please select a rating between 1 and 5 stars.');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await submitOrderReview(orderId, {
        rating,
        review: review.trim(),
        driverRating: trackingData?.driverName ? driverRating : undefined,
        driverReview: trackingData?.driverName ? driverReview.trim() : undefined,
      });

      if (res?.success) {
        setTrackingData(prev => ({
          ...prev,
          isReviewed: true,
          rating,
          review: review.trim(),
          driverRating: trackingData?.driverName ? driverRating : undefined,
          driverReview: trackingData?.driverName ? driverReview.trim() : undefined,
        }));
        setShowReviewModal(false);
        Alert.alert('Review Submitted ⭐', 'Thank you for rating your order and sharing your feedback!');
      } else {
        Alert.alert('Unable to Submit', res?.error || 'Failed to submit review. Please try again.');
      }
    } catch (err) {
      console.error('Submit review error:', err);
      Alert.alert('Error', err?.response?.data?.error || err?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
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
        <TouchableOpacity onPress={() => navigation.navigate('CustomerHome')} style={styles.backBtn}>
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
          <GoogleMapView 
            origin={trackingData?.pickupCoordinates || { latitude: 6.4474, longitude: 3.4723 }}
            destination={trackingData?.deliveryCoordinates || { latitude: 6.4549, longitude: 3.3947 }}
            driverLocation={trackingData?.driverCoordinates}
            distanceText={trackingData?.distance || `${arrivalTime || 25} min`}
            height={height * 0.35}
            navigationButtonLabel="Live Google Maps"
          />
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusLabel}>{currentStatus === 'delivered' ? 'Delivered' : 'Arriving in'}</Text>
              <Text style={styles.statusTime}>{currentStatus === 'delivered' ? 'Today' : `${arrivalTime || 25} min`}</Text>
            </View>
            <View style={styles.statusInfoRight}>
              <Text style={styles.statusLabelSmall}>Status</Text>
              <Text style={[styles.statusMain, currentStatus === 'delivered' && { color: '#27A572' }]}>
                {currentStatus === 'delivered' ? 'Delivered successfully' : currentStatus === 'on the way' ? 'Driver heading to you' : 'Order placed'}
              </Text>
            </View>
          </View>
        </View>

        {/* Driver Info Card */}
        <View style={styles.driverCard}>
          <Image source={{ uri: trackingData?.driverPic || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' }} style={styles.driverPic} />
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{trackingData?.driverName || 'Delivery Partner'}</Text>
            <View style={styles.driverMeta}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.driverRating}>4.8</Text>
              <View style={styles.dot} />
              <Text style={styles.driverVehicle}>Honda CB | LSR-432-AB</Text>
            </View>
          </View>
          <View style={styles.driverActions}>
             <TouchableOpacity style={styles.driverActionBtn} onPress={handleCallDriver}>
               <Ionicons name="call" size={18} color="#27A572" />
             </TouchableOpacity>
             <TouchableOpacity 
               style={styles.driverActionBtnChat} 
               onPress={() => navigation.navigate('ChatDetail', { 
                 name: trackingData?.driverName || 'Delivery Partner', 
                 recipientId: trackingData?.driverId || trackingData?.order?.driverId,
                 type: 'Driver' 
               })}
             >
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
            {trackingData?.isReviewed && (
              <View style={styles.reviewedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#27A572" />
                <Text style={styles.reviewedBadgeText}>
                  You rated this order {trackingData.rating || rating} ★
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={[styles.rateBtn, trackingData?.isReviewed && styles.rateBtnSecondary]} 
              onPress={() => setShowReviewModal(true)}
            >
              <Ionicons 
                name={trackingData?.isReviewed ? "create-outline" : "star"} 
                size={18} 
                color={trackingData?.isReviewed ? Colors.primary : "#FFF"} 
                style={{ marginRight: 6 }} 
              />
              <Text style={[styles.rateBtnText, trackingData?.isReviewed && styles.rateBtnSecondaryText]}>
                {trackingData?.isReviewed ? 'Update review' : 'Rate & review'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.orderAgainBtn} onPress={() => navigation.navigate('CustomerHome')}>
              <Text style={styles.orderAgainText}>Order again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primary }]} onPress={() => navigation.navigate('CustomerHome')}>
            <Text style={styles.actionBtnText}>Back to Home</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Review Modal */}
      <Modal visible={showReviewModal} transparent animationType="fade" onRequestClose={() => setShowReviewModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.reviewContent}>
            <TouchableOpacity style={styles.closeModal} onPress={() => setShowReviewModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
              <Text style={styles.reviewMainTitle}>
                {trackingData?.isReviewed ? 'Update Your Review' : 'Rate & Review Order'}
              </Text>
              <Text style={styles.reviewSub}>
                How was your meal from {trackingData?.vendorName || 'the restaurant'}?
              </Text>
              
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity key={s} onPress={() => setRating(s)} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
                    <Ionicons name="star" size={34} color={s <= rating ? "#FFB800" : "#E2E8F0"} />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.reviewInput}
                placeholder="Share your thoughts about the food quality and taste..."
                placeholderTextColor="#999"
                multiline
                value={review}
                onChangeText={setReview}
              />

              {Boolean(trackingData?.driverName) && (
                <View style={styles.driverReviewBox}>
                  <Text style={styles.driverReviewHeading}>Rate Delivery ({trackingData.driverName})</Text>
                  <View style={styles.driverStarsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <TouchableOpacity key={s} onPress={() => setDriverRating(s)} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
                        <Ionicons name="star" size={26} color={s <= driverRating ? "#FFB800" : "#E2E8F0"} />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={styles.driverReviewInput}
                    placeholder="Delivery feedback (optional)..."
                    placeholderTextColor="#999"
                    value={driverReview}
                    onChangeText={setDriverReview}
                  />
                </View>
              )}

              <TouchableOpacity 
                style={[styles.submitReviewBtn, submittingReview && { opacity: 0.7 }]} 
                onPress={handleReviewSubmit}
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitReviewText}>
                    {trackingData?.isReviewed ? 'Update Review' : 'Submit Review'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
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
  reviewedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FAF6', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, gap: 6 },
  reviewedBadgeText: { fontSize: 13, fontWeight: '600', color: '#27A572' },
  rateBtn: { backgroundColor: '#FF7D01', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  rateBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  rateBtnSecondary: { backgroundColor: '#FFF5EB', borderWidth: 1, borderColor: '#FFD7B0' },
  rateBtnSecondaryText: { color: '#FF7D01' },
  orderAgainBtn: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#DDD' },
  orderAgainText: { color: '#333', fontSize: 16, fontWeight: '700' },
  actionBtn: { backgroundColor: '#FF7D01', padding: 18, borderRadius: 12, alignItems: 'center', opacity: 0.5 },
  actionBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  reviewContent: { backgroundColor: '#FFF', width: '100%', maxWidth: 420, maxHeight: height * 0.85, borderRadius: 20, padding: 24, position: 'relative' },
  closeModal: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 4 },
  reviewMainTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginTop: 5 },
  reviewSub: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 6, marginBottom: 4 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginVertical: 14 },
  reviewInput: { backgroundColor: '#F9F9F9', borderRadius: 12, padding: 14, height: 100, textAlignVertical: 'top', fontSize: 14, color: '#333', borderWidth: 1, borderColor: '#E8E8E8' },
  driverReviewBox: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  driverReviewHeading: { fontSize: 13, fontWeight: '600', color: '#555', textAlign: 'center' },
  driverStarsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 10 },
  driverReviewInput: { backgroundColor: '#F9F9F9', borderRadius: 10, padding: 10, fontSize: 13, color: '#333', borderWidth: 1, borderColor: '#E8E8E8' },
  submitReviewBtn: { backgroundColor: '#FF7D01', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 18 },
  submitReviewText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default TrackOrderScreen;
