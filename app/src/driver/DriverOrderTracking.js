import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const TraceStep = ({ number, title, subtitle, status }) => {
  const isDone = status === 'done';
  const isActive = status === 'active';

  return (
    <View style={styles.traceItem}>
      <View style={styles.traceLeft}>
        <View style={[
          styles.traceCircle, 
          isDone && styles.circleDone, 
          isActive && styles.circleActive
        ]}>
          {isDone ? (
            <Ionicons name="checkmark" size={16} color="#FFF" />
          ) : (
            <Text style={[styles.traceNumber, isActive && styles.textActive]}>{number}</Text>
          )}
        </View>
        {number !== 5 && <View style={[styles.traceLine, isDone && styles.lineDone]} />}
      </View>
      <View style={styles.traceRight}>
        <Text style={[styles.traceTitle, isActive && styles.titleActive]}>{title}</Text>
        {subtitle && <Text style={styles.traceSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const DriverOrderTracking = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Order ORD-005</Text>
          <Text style={styles.headerSubtitle}>3.5 km | ₦750</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* MAP PLACEHOLDER */}
        <View style={styles.mapWrapper}>
           <View style={styles.mapContainer}>
             {/* Stylized Map Background */}
             <View style={styles.mapGrid}>
               {/* Simplified map lines */}
               <View style={[styles.mapLine, { top: '20%', width: '100%', height: 2 }]} />
               <View style={[styles.mapLine, { top: '50%', width: '100%', height: 2 }]} />
               <View style={[styles.mapLine, { left: '30%', height: '100%', width: 2 }]} />
               <View style={[styles.mapLine, { left: '70%', height: '100%', width: 2 }]} />
               
               {/* Route Line */}
               <View style={styles.routeLine} />
               
               {/* Markers */}
               <View style={[styles.marker, { top: '35%', left: '38%' }]}>
                  <View style={styles.pulse} />
                  <View style={[styles.markerDot, { backgroundColor: '#FF8C00' }]} />
               </View>
               <View style={[styles.marker, { top: '55%', left: '68%' }]}>
                  <View style={[styles.markerDot, { backgroundColor: '#10B981' }]} />
               </View>
             </View>
           </View>
        </View>

        {/* TRACKING TIMELINE */}
        <View style={styles.card}>
          <TraceStep number={1} title="Heading to pickup" status="done" />
          <TraceStep number={2} title="At pick up" status="done" />
          <TraceStep number={3} title="Picked up" status="done" />
          <TraceStep number={4} title="Enroute" subtitle="Delivering to customer" status="active" />
          <TraceStep number={5} title="Delivered" status="pending" />
        </View>

        {/* LOCATIONS */}
        <View style={styles.locationContainer}>
          <View style={styles.miniCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="location" size={18} color="#FF8C00" />
            </View>
            <View style={styles.miniCardContent}>
              <Text style={styles.locationLabel}>PICKUP</Text>
              <Text style={styles.locationName}>Spice Avenue</Text>
              <Text style={styles.locationAddr}>9 Street name, Ikoyi</Text>
            </View>
          </View>

          <View style={styles.miniCard}>
            <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="location" size={18} color="#10B981" />
            </View>
            <View style={styles.miniCardContent}>
              <Text style={styles.locationLabel}>DROP OFF</Text>
              <Text style={styles.locationName}>Kola Adeleke</Text>
              <Text style={styles.locationAddr}>12 Marina Road, Lagos Island</Text>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="call-outline" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* PROOF OF DELIVERY */}
        <View style={[styles.card, { marginTop: 20 }]}>
           <Text style={styles.sectionTitle}>Proof of delivery (optional)</Text>
           <TouchableOpacity style={styles.uploadBox}>
             <Ionicons name="camera-outline" size={32} color="#999" />
             <Text style={styles.uploadText}>Tap to take photo</Text>
           </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>Mark as delivered</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* BOTTOM NAV SIMULATION */}
      <View style={styles.bottomTab}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home-outline" size={24} color="#64748B" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="truck" size={24} color={Colors.primary} />
          <Text style={[styles.tabLabel, { color: Colors.primary }]}>Deliveries</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="wallet-outline" size={24} color="#64748B" />
          <Text style={styles.tabLabel}>Earnings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#64748B" />
          <Text style={styles.tabLabel}>Chats</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
  },
  backBtn: {
    padding: 5,
    marginRight: 15,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  mapWrapper: {
    padding: 20,
  },
  mapContainer: {
    height: 350,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF8C00',
    overflow: 'hidden',
  },
  mapGrid: {
    flex: 1,
    backgroundColor: '#EEE',
  },
  mapLine: {
    position: 'absolute',
    backgroundColor: '#DDD',
  },
  routeLine: {
    position: 'absolute',
    top: '35%',
    left: '40%',
    width: '30%',
    height: '22%',
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#FF8C00',
  },
  marker: {
    position: 'absolute',
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  pulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,140,0,0.3)',
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  traceItem: {
    flexDirection: 'row',
    gap: 15,
  },
  traceLeft: {
    alignItems: 'center',
  },
  traceCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  circleDone: {
    backgroundColor: '#10B981',
  },
  circleActive: {
    backgroundColor: '#FF8C00',
  },
  traceNumber: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  textActive: {
    color: '#FFF',
  },
  traceLine: {
    width: 2,
    height: 30,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  lineDone: {
    backgroundColor: '#10B981',
  },
  traceRight: {
    flex: 1,
    paddingTop: 3,
  },
  traceTitle: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  titleActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  traceSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  locationContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  miniCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCardContent: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  locationName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },
  locationAddr: {
    fontSize: 12,
    color: '#666',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  uploadBox: {
    height: 120,
    borderWidth: 1,
    borderColor: '#CCC',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    gap: 10,
  },
  uploadText: {
    fontSize: 13,
    color: '#666',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    marginTop: 30,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomTab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingBottom: 15,
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
});

export default DriverOrderTracking;
