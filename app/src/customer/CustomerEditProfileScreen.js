import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { updateCustomerProfile, uploadCustomerProfilePic } from '../services/api';
import { Colors } from '../constants/Colors';

const CustomerEditProfileScreen = ({ route, navigation }) => {
  const { initialData } = route.params || {};
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    profilePic: initialData?.profilePic || '',
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      handleImageUpload(result.assets[0].uri);
    }
  };

  const handleImageUpload = async (uri) => {
    setUploadingImage(true);
    try {
      const response = await uploadCustomerProfilePic(uri);
      if (response.success) {
        setFormData({ ...formData, profilePic: response.imageUrl });
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (err) {
      Alert.alert('Upload Error', err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return Alert.alert('Error', 'Name is required');
    
    setLoading(true);
    try {
      const response = await updateCustomerProfile(formData);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Profile Image Section */}
          <View style={styles.imageSection}>
            <View style={styles.imageWrapper}>
              <Image 
                source={{ uri: formData.profilePic || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' }} 
                style={styles.avatar} 
              />
              <TouchableOpacity style={styles.cameraBtn} onPress={pickImage} disabled={uploadingImage}>
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons name="camera" size={20} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.imageHint}>Tap camera to change photo</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              placeholder="Enter your name"
              onChangeText={(t) => setFormData({ ...formData, name: t })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              keyboardType="phone-pad"
              placeholder="Enter phone number"
              onChangeText={(t) => setFormData({ ...formData, phone: t })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, { opacity: 0.7 }]}
              value={formData.email}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false} // Usually email is locked
            />
            <Text style={styles.inputHint}>Email cannot be changed</Text>
          </View>

          <TouchableOpacity 
            style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSave} 
            disabled={loading || uploadingImage}
          >
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
  imageSection: { alignItems: 'center', marginBottom: 30 },
  imageWrapper: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0F0F0' },
  cameraBtn: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    backgroundColor: Colors.primary, 
    width: 34, 
    height: 34, 
    borderRadius: 17, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF'
  },
  imageHint: { fontSize: 12, color: '#888', marginTop: 10 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8 },
  input: { backgroundColor: '#F8F8F8', borderRadius: 12, borderWidth: 1, borderColor: '#EEE', padding: 14, fontSize: 15, color: '#1a1a1a' },
  inputHint: { fontSize: 11, color: '#AAA', marginTop: 6 },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 20, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default CustomerEditProfileScreen;
