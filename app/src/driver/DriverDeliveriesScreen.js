import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDriverDeliveries } from '../services/api';

const { width } = Dimensions.get('window');

const DeliveryRequestCard = ({ restaurant, price, distance, dropoff, timer, progress, onAccept }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.statusRow}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>New delivery request</Text>
      </View>
      <View style={styles.timerRow}>
        <Ionicons name="time-outline" size={14} color="#FFD700" />
        <Text style={styles.timerText}>{timer}</Text>
      </View>
    </View>

    <View style={styles.cardMain}>
      <View style={styles.mainLeft}>
        <Text style={styles.restaurantName}>{restaurant}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color="#94A3B8" />
          <Text style={styles.infoText}>{distance} away from you</Text>
        </View>
        <Text style={styles.dropoffText}>Drop off: {dropoff}</Text>
      </View>
      <Text style={styles.priceText}>{price}</Text>
    </View>

    <View style={styles.progressWrapper}>
      <View style={[styles.progressActive, { width: `${progress}%` }]} />
    </View>

    <View style={styles.cardActions}>
      <TouchableOpacity style={styles.declineBtn}>
        <Ionicons name="close" size={18} color="#64748B" />
        <Text style={styles.declineText}>Decline</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
        <Ionicons name="checkmark" size={18} color="#FFF" />
        <Text style={styles.acceptText}>Accept</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const DriverDeliveriesScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Available');
  const [deliveries, setDeliveries] = useState({ available: [], active: [], completed: [] });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const res = await getDriverDeliveries();
      if (res.success) {
        setDeliveries(res.data);
      }
    } catch (e) {
      console.error('Fetch driver deliveries error:', e);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { label: 'Available', count: deliveries.available?.length || 0 },
    { label: 'Active', count: deliveries.active?.length || 0 },
    { label: 'Completed', count: deliveries.completed?.length || 0 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Deliveries</Text>
          <Text style={styles.headerSubtitle}>Manage your trips</Text>
        </View>
      </View>

      {/* SEGMENTED CONTROL */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.label}
              onPress={() => setActiveTab(tab.label)}
              style={[
                styles.tab,
                activeTab === tab.label && styles.activeTab
              ]}
            >
              <Text style={[
                styles.tabLabel,
                activeTab === tab.label && styles.activeTabLabel
              ]}>
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {activeTab === 'Available' && (
            deliveries.available?.length > 0 ? (
              deliveries.available.map((item) => (
                <DeliveryRequestCard 
                  key={item._id || item.id}
                  restaurant={item.restaurant}
                  price={`₦${item.amount?.toLocaleString()}`}
                  distance={item.distance || '3.5 km'}
                  dropoff={item.dropoffAddress}
                  timer="25s"
                  progress={80}
                  onAccept={() => navigation.navigate('DriverOrderTracking', { orderId: item._id || item.id })}
                />
              ))
            ) : (
              <View style={{ padding: 30, alignItems: 'center' }}>
                <Ionicons name="bicycle-outline" size={48} color="#CCC" />
                <Text style={{ marginTop: 10, color: '#666' }}>No new delivery requests right now.</Text>
              </View>
            )
          )}

          {activeTab === 'Active' && (
            deliveries.active?.length > 0 ? (
              deliveries.active.map((item) => (
                <TouchableOpacity 
                  key={item._id || item.id} 
                  style={styles.card}
                  onPress={() => navigation.navigate('DriverOrderTracking', { orderId: item._id || item.id })}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.restaurantName}>{item.restaurant}</Text>
                    <Text style={styles.priceText}>₦{item.amount?.toLocaleString()}</Text>
                  </View>
                  <Text style={styles.dropoffText}>Drop off: {item.dropoffAddress}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 }}>
                    <Ionicons name="location" size={16} color={Colors.primary} />
                    <Text style={{ color: Colors.primary, fontWeight: '600' }}>{item.status}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={{ padding: 30, alignItems: 'center' }}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#CCC" />
                <Text style={{ marginTop: 10, color: '#666' }}>No active deliveries right now.</Text>
              </View>
            )
          )}

          {activeTab === 'Completed' && (
            deliveries.completed?.length > 0 ? (
              deliveries.completed.map((item) => (
                <View key={item._id || item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.restaurantName}>{item.restaurant}</Text>
                    <Text style={styles.priceText}>₦{item.amount?.toLocaleString()}</Text>
                  </View>
                  <Text style={{ color: '#666', marginTop: 4 }}>Customer: {item.customer}</Text>
                  <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{item.date}</Text>
                </View>
              ))
            ) : (
              <View style={{ padding: 30, alignItems: 'center' }}>
                <Ionicons name="time-outline" size={48} color="#CCC" />
                <Text style={{ marginTop: 10, color: '#666' }}>No completed deliveries yet.</Text>
              </View>
            )
          )}
        </ScrollView>
      )}
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
    padding: 20,
    backgroundColor: '#FFF',
  },
  backBtn: {
    marginRight: 15,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
  },
  tabsWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeTabLabel: {
    color: '#1E293B',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    paddingBottom: 5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '700',
  },
  cardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  mainLeft: {
    flex: 1,
    gap: 5,
  },
  restaurantName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  infoText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  dropoffText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  progressWrapper: {
    height: 5,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },
  progressActive: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  cardActions: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  declineBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
  },
  declineText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  acceptBtn: {
    flex: 1.5,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  acceptText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 15,
    marginTop: 10,
  },
});

export default DriverDeliveriesScreen;
