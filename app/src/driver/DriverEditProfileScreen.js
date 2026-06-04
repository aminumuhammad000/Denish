import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

const EditField = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#AAA"
        keyboardType={keyboardType}
      />
    </View>
  </View>
);

const DriverEditProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // Form State
  const [name, setName] = useState('Bayo Adeyemi');
  const [email, setEmail] = useState('bayo.adeyemi@gmail.com');
  const [phone, setPhone] = useState('+2349085485747');
  
  const [vehicleType, setVehicleType] = useState('Motorcycle');
  const [makeModel, setMakeModel] = useState('Honda ACE 125');
  const [plate, setPlate] = useState('LSR-482-AB');
  const [color, setColor] = useState('Red');

  const [bank, setBank] = useState('GTBank');
  const [accountName, setAccountName] = useState('Bayo Adeyemi');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.saveBtn}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* AVATAR EDIT */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarText}>BA</Text>
                )}
              </View>
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={16} color="#FFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarSubtext}>Tap to change profile picture</Text>
          </View>

          {/* PERSONAL INFORMATION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <EditField label="Full Name" value={name} onChangeText={setName} />
            <EditField label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <EditField label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>

          {/* VEHICLE DETAILS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Details</Text>
            <EditField label="Vehicle Type" value={vehicleType} onChangeText={setVehicleType} />
            <EditField label="Make & Model" value={makeModel} onChangeText={setMakeModel} />
            <EditField label="Plate Number" value={plate} onChangeText={setPlate} />
            <EditField label="Vehicle Color" value={color} onChangeText={setColor} />
          </View>

          {/* BANK DETAILS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bank Account</Text>
            <EditField label="Bank Name" value={bank} onChangeText={setBank} />
            <EditField label="Account Name" value={accountName} onChangeText={setAccountName} />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  saveBtn: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: Colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatarSubtext: {
    fontSize: 12,
    color: '#64748B',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingHorizontal: 15,
    height: 50,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
});

export default DriverEditProfileScreen;
