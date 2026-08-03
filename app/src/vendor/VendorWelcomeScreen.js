import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const VendorWelcomeScreen = ({ navigation }) => {
  const { width, height } = useWindowDimensions();

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
            icon={<Ionicons name="wallet-outline" size={28} color={Colors.primary} />}
            title="Fast Payouts"
            subtitle="Receive your earnings weekly."
            iconContainerColor="#FFF5E6"
          />
          <FeatureCard
            icon={<Ionicons name="calendar-outline" size={28} color={Colors.primary} />}
            title="Simple Management"
            subtitle="Manage everything conveniently."
            iconContainerColor="#FFF5E6"
          />
          <FeatureCard
            icon={<Ionicons name="shield-checkmark-outline" size={28} color={Colors.primary} />}
            title="Reliable Supports"
            subtitle="We've got you every time."
            iconContainerColor="#FFF5E6"
          />
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Signup')}
          >
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
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  illustrationContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: '80%',
    height: '100%',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  featuresContainer: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
    borderWidth: 0.8,
    borderColor: '#F0F0F0',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 15,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  approvalText: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 10,
  },
});

export default VendorWelcomeScreen;
