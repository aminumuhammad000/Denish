import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateDriverProfile } from '../services/api';
import { clearAuthSession } from '../services/authStorage';

const EditCard = ({ title, subtitle, children, onSave, onCancel, loading }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
       <View style={{ flex: 1 }} />
       <TouchableOpacity onPress={onCancel}>
         <Ionicons name="close" size={20} color="#CBD5E1" />
       </TouchableOpacity>
    </View>
    <View style={styles.cardTitleContainer}>
       <Text style={styles.cardTitle}>{title}</Text>
       <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>

    <View style={styles.cardContent}>
       {children}
    </View>

    <View style={styles.cardFooter}>
       <TouchableOpacity 
         style={styles.saveBtn} 
         onPress={onSave}
         disabled={loading}
       >
         {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.saveBtnText}>Save</Text>}
       </TouchableOpacity>
       <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
         <Text style={styles.cancelBtnText}>Cancel</Text>
       </TouchableOpacity>
    </View>
  </View>
);

const FormField = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
    />
  </View>
);

const DriverEditProfileScreen = ({ route, navigation }) => {
  const { section = 'personal', driver = {} } = route.params || {};
  const [loading, setLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: driver.name || '',
    email: driver.email || '',
    phone: driver.phone || '',
    vehicleType: driver.vehicle?.type || 'Motorcycle',
    makeModel: driver.vehicle?.make || '',
    plate: driver.vehicle?.plate || '',
    color: driver.vehicle?.color || '',
    bank: driver.bank?.name || '',
    accountName: driver.bank?.accountName || '',
    accountNumber: driver.bank?.accountNumber || '',
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let payload = {};
      if (section === 'personal') {
        if (!formData.name || !formData.phone) {
          Alert.alert('Validation', 'Name and phone are required.');
          setLoading(false);
          return;
        }
        payload = { name: formData.name, email: formData.email, phone: formData.phone };
      } else if (section === 'vehicle') {
        payload = {
          vehicle: {
            type: formData.vehicleType,
            make: formData.makeModel,
            plate: formData.plate,
            color: formData.color
          }
        };
      } else if (section === 'bank') {
        if (!formData.accountNumber || !formData.bank) {
          Alert.alert('Validation', 'Bank name and account number are required.');
          setLoading(false);
          return;
        }
        payload = {
          bank: {
            name: formData.bank,
            accountName: formData.accountName,
            accountNumber: formData.accountNumber
          }
        };
      }

      const response = await updateDriverProfile(payload);
      if (response && response.success) {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', response?.message || 'Update failed. Please try again.');
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Could not connect to the server. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (section === 'personal') {
      return (
        <EditCard 
          title="Edit personal information" 
          subtitle="Changes are saved immediately"
          onSave={handleSave}
          onCancel={() => navigation.goBack()}
          loading={loading}
        >
          <FormField label="Name" value={formData.name} onChangeText={(v) => updateField('name', v)} />
          <FormField label="Email" value={formData.email} onChangeText={(v) => updateField('email', v)} keyboardType="email-address" />
          <FormField label="Phone" value={formData.phone} onChangeText={(v) => updateField('phone', v)} keyboardType="phone-pad" />
        </EditCard>
      );
    }

    if (section === 'vehicle') {
      return (
        <EditCard 
          title="Edit vehicle details" 
          subtitle="Changes are saved immediately"
          onSave={handleSave}
          onCancel={() => navigation.goBack()}
          loading={loading}
        >
          <FormField label="Type" value={formData.vehicleType} onChangeText={(v) => updateField('vehicleType', v)} />
          <FormField label="Make/model" value={formData.makeModel} onChangeText={(v) => updateField('makeModel', v)} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
               <FormField label="Plate" value={formData.plate} onChangeText={(v) => updateField('plate', v)} />
            </View>
            <View style={{ flex: 1 }}>
               <FormField label="Color" value={formData.color} onChangeText={(v) => updateField('color', v)} />
            </View>
          </View>
        </EditCard>
      );
    }

    if (section === 'bank') {
      return (
        <EditCard 
          title="Edit Bank details" 
          subtitle="Changes are saved immediately"
          onSave={handleSave}
          onCancel={() => navigation.goBack()}
          loading={loading}
        >
          <FormField label="Bank" value={formData.bank} onChangeText={(v) => updateField('bank', v)} />
          <FormField label="Account name" value={formData.accountName} onChangeText={(v) => updateField('accountName', v)} />
          <FormField label="Number" value={formData.accountNumber} onChangeText={(v) => updateField('accountNumber', v)} keyboardType="number-pad" />
        </EditCard>
      );
    }

    if (section === 'logout') {
      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>Logout?</Text>
            <Text style={styles.cardSubtitle}>You'll need to sign back in to receive deliveries.</Text>
          </View>
          <View style={styles.cardFooter}>
            <TouchableOpacity style={styles.saveBtn} onPress={async () => {
              await clearAuthSession();
              navigation.replace('DriverLogin');
            }}>
              <Text style={styles.saveBtnText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelBtnText}>Stay signed in</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1, justifyContent: 'center', padding: 20 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 },
  cardTitleContainer: { alignItems: 'center', marginBottom: 30 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  cardSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  cardContent: { gap: 15 },
  cardFooter: { marginTop: 30, gap: 12 },
  field: { marginBottom: 15 },
  label: { fontSize: 12, color: '#1E293B', fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#334155',
    backgroundColor: '#FAFAFA',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: { color: '#64748B', fontSize: 16, fontWeight: '600' },
});

export default DriverEditProfileScreen;
