import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const DriverDashboard = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Driver Portal</Text>
        <TouchableOpacity style={styles.statusBadge}>
          <Text style={styles.statusText}>Online</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₦0.00</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.emptyState}>
          <Ionicons name="bicycle-outline" size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>No active orders</Text>
          <Text style={styles.emptySubtitle}>We'll notify you when a new delivery is available near you.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  topBar: { padding: 16, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#EEE' },
  title: { fontSize: 20, fontWeight: 'bold' },
  statusBadge: { backgroundColor: '#27AE60', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  container: { padding: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, elevation: 1 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 8 },
});

export default DriverDashboard;
