import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const VendorEditProfileScreen = ({ route, navigation }) => {
  const { type, initialData } = route.params || {};
  const [formData, setFormData] = useState(initialData || {});
  const [loading, setLoading] = useState(false);

  const getTitle = () => {
    switch (type) {
      case 'business': return 'Edit Business Details';
      case 'hours':    return 'Edit Opening Hours';
      case 'locations': return 'Edit Delivery Locations';
      case 'payout':   return 'Edit Payout Account';
      default:         return 'Edit Profile';
    }
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    }, 1000);
  };

  const renderFields = () => {
    if (type === 'business') {
      return (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Name</Text>
            <TextInput
              style={styles.input}
              value={formData.businessName || "Mama's Kitchen"}
              onChangeText={(t) => setFormData({ ...formData, businessName: t })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.phone || "+234800000000"}
              keyboardType="phone-pad"
              onChangeText={(t) => setFormData({ ...formData, phone: t })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={formData.email || "info@mamaskitchen.ng"}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(t) => setFormData({ ...formData, email: t })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              value={formData.address || "14 Secretariat Avenue, Ikeja, Lagos"}
              multiline
              onChangeText={(t) => setFormData({ ...formData, address: t })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>About</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              value={formData.about || "Authentic Nigerian home-style cooking made fresh daily."}
              multiline
              onChangeText={(t) => setFormData({ ...formData, about: t })}
            />
          </View>
        </>
      );
    }

    if (type === 'payout') {
      return (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bank Name</Text>
            <TextInput
              style={styles.input}
              value={formData.bankName || "Access Bank"}
              onChangeText={(t) => setFormData({ ...formData, bankName: t })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Name</Text>
            <TextInput
              style={styles.input}
              value={formData.accountName || "Mama's Kitchen Ltd"}
              onChangeText={(t) => setFormData({ ...formData, accountName: t })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              style={styles.input}
              value={formData.accountNumber || "636363633663"}
              keyboardType="numeric"
              maxLength={10}
              onChangeText={(t) => setFormData({ ...formData, accountNumber: t })}
            />
          </View>
        </>
      );
    }

    return (
      <View style={styles.placeholder}>
        <Ionicons name="construct-outline" size={40} color="#CCC" />
        <Text style={styles.placeholderText}>Editing for {type} is coming soon!</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.title}>{getTitle()}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
          {renderFields()}

          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  title: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  backBtn: { padding: 4 },
  scroll: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8 },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    padding: 14,
    fontSize: 15,
    color: '#1a1a1a',
  },
  saveBtn: {
    backgroundColor: '#FF8C00',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  placeholder: { alignItems: 'center', marginTop: 100 },
  placeholderText: { color: '#AAA', marginTop: 12, fontSize: 15 },
});

export default VendorEditProfileScreen;
