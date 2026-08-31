import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const { width, height } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image 
              source={require('../assets/icon.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome to Denish</Text>
            <Text style={styles.subtitle}>How would you like to use the app today?</Text>
          </View>

          <View style={styles.rolesContainer}>
            <RoleCard
              icon={<Ionicons name="fast-food-outline" size={24} color={Colors.primary} />}
              title="Customer"
              subtitle="Order delicious meals to your door"
              onPress={() => navigation.navigate('CustomerLogin')}
            />
            <RoleCard
              icon={<MaterialCommunityIcons name="store-outline" size={24} color={Colors.primary} />}
              title="Vendor"
              subtitle="Grow your food business with us"
              onPress={() => navigation.navigate('Login')}
            />
            <RoleCard
              icon={<FontAwesome5 name="bicycle" size={22} color={Colors.primary} />}
              title="Driver"
              subtitle="Earn money by delivering orders"
              onPress={() => navigation.navigate('DriverLogin')}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  rolesContainer: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFF5E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  footer: {
    marginTop: 60,
    alignItems: 'center',
  },
  footerText: {
    color: '#CCC',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '600',
  },
});

export default RoleSelectionScreen;
