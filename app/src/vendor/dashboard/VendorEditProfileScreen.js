import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { updateVendorProfile } from '../../services/api';

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

  const handleSave = async () => {
    setLoading(true);
    try {
      let payload = {};
      if (type === 'business') {
        payload = {
          businessName: formData.businessName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          about: formData.about,
          category: formData.category
        };
      } else if (type === 'payout') {
        payload = { payoutAccount: formData };
      } else if (type === 'hours') {
        payload = { openingHours: formData };
      } else if (type === 'locations') {
        payload = { deliveryLocations: formData };
      }

      const response = await updateVendorProfile(payload);
      if (response.success) {
        Alert.alert('Success', 'Profile updated successfully!');
        navigation.goBack();
      } else {
        throw new Error(response.error || 'Failed to update');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const renderFields = () => {
    if (type === 'business') {
      return (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Name</Text>
            <TextInput
              style={styles.input}
              value={formData.businessName}
              onChangeText={(t) => setFormData({ ...formData, businessName: t })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={(t) => setFormData({ ...formData, category: t })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              keyboardType="phone-pad"
              onChangeText={(t) => setFormData({ ...formData, phone: t })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(t) => setFormData({ ...formData, email: t })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              value={formData.address}
              multiline
              onChangeText={(t) => setFormData({ ...formData, address: t })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>About</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              value={formData.about}
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
              value={formData.bank}
              onChangeText={(t) => setFormData({ ...formData, bank: t })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Name</Text>
            <TextInput
              style={styles.input}
              value={formData.accountName}
              onChangeText={(t) => setFormData({ ...formData, accountName: t })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              style={styles.input}
              value={formData.accountNumber}
              keyboardType="numeric"
              maxLength={10}
              onChangeText={(t) => setFormData({ ...formData, accountNumber: t })}
            />
          </View>
        </>
      );
    }

    if (type === 'hours') {
      return (
        <View style={{ gap: 15 }}>
          <Text style={{ fontSize: 13, color: '#888', marginBottom: 15 }}>
            Enter hours (e.g., "08:00 - 17:00" or "Closed") for each day:
          </Text>
          {(Array.isArray(formData) ? formData : []).map((item, index) => (
            <View key={item.day} style={{ borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 15, marginBottom: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8 }}>{item.day}</Text>
              <TextInput
                style={styles.input}
                value={item.hours}
                onChangeText={(text) => {
                  const updated = [...formData];
                  updated[index] = { ...updated[index], hours: text };
                  setFormData(updated);
                }}
                placeholder="e.g. 08:00 - 17:00"
              />
            </View>
          ))}
        </View>
      );
    }

    if (type === 'locations') {
      return (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Delivery Locations (Comma-separated)</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            value={Array.isArray(formData) ? formData.join(', ') : ''}
            multiline
            placeholder="e.g. Victoria Island, Lekki Phase 1, Ajah"
            onChangeText={(t) => {
              const list = t.split(',').map(item => item.trim()).filter(item => item.length > 0);
              setFormData(list);
            }}
          />
        </View>
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.title}>{getTitle()}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
          {renderFields()}

          <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#EEE' },
  title: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  backBtn: { padding: 4 },
  scroll: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8 },
  input: { backgroundColor: '#F8F8F8', borderRadius: 12, borderWidth: 1, borderColor: '#EEE', padding: 14, fontSize: 15, color: '#1a1a1a' },
  saveBtn: { backgroundColor: '#FF8C00', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 20, shadowColor: '#FF8C00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  placeholder: { alignItems: 'center', marginTop: 100 },
  placeholderText: { color: '#AAA', marginTop: 12, fontSize: 15 },
});

export default VendorEditProfileScreen;
