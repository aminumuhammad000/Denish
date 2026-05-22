import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const FeatureCard = ({ icon, title, subtitle, iconContainerColor }) => (
  <View style={styles.card}>
    <View style={[styles.iconContainer, { backgroundColor: iconContainerColor }]}>
      {icon}
    </View>
    <View style={styles.cardTextContainer}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
  </View>
);

const VendorWelcomeScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sell with Denish</Text>
          <Text style={styles.subtitle}>Grow your business on your terms</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <FeatureCard
            icon={<Ionicons name="wallet-outline" size={28} color="#FF8C00" />}
            title="Fast Payouts"
            subtitle="Receive your earnings weekly."
            iconContainerColor="#FFF5E6"
          />
          <FeatureCard
            icon={<Ionicons name="calendar-outline" size={28} color="#FF8C00" />}
            title="Simple Management"
            subtitle="Manage everything conveniently."
            iconContainerColor="#FFF5E6"
          />
          <FeatureCard
            icon={<Ionicons name="shield-checkmark-outline" size={28} color="#FF8C00" />}
            title="Reliable Supports"
            subtitle="We've got you every time."
            iconContainerColor="#FFF5E6"
          />
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Get started</Text>
          </TouchableOpacity>
          <Text style={styles.approvalText}>Approval typically takes 24 hours.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    fontWeight: '500',
  },
  featuresContainer: {
    gap: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#666',
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 10,
    alignItems: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  approvalText: {
    color: '#AAA',
    fontSize: 14,
  },
});

export default VendorWelcomeScreen;
