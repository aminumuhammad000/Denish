import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from './constants/Colors';

const RoleCard = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.iconContainer}>
      {icon}
    </View>
    <View style={styles.cardTextContainer}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#CCC" />
  </TouchableOpacity>
);

const RoleSelectionScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Denish</Text>
          <Text style={styles.subtitle}>How would you like to use the app today?</Text>
        </View>

        <View style={styles.rolesContainer}>
          <RoleCard
            icon={<Ionicons name="fast-food-outline" size={24} color={Colors.primary} />}
            title="Customer"
            subtitle="Order delicious meals to your door"
            onPress={() => navigation.navigate('CustomerWelcome')}
          />
          <RoleCard
            icon={<MaterialCommunityIcons name="store-outline" size={24} color={Colors.primary} />}
            title="Vendor"
            subtitle="Grow your food business with us"
            onPress={() => navigation.navigate('Welcome')}
          />
          <RoleCard
            icon={<FontAwesome5 name="bicycle" size={22} color={Colors.primary} />}
            title="Driver"
            subtitle="Earn money by delivering orders"
            onPress={() => navigation.navigate('DriverWelcome')}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
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
    padding: 16,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  rolesContainer: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF5E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#888',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#AAA',
    fontSize: 10,
    letterSpacing: 1,
  },
});

export default RoleSelectionScreen;
