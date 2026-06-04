import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../../constants/Colors';
import { useOnboarding } from '../../context/OnboardingContext';

const DriverStep4Docs = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [docs, setDocs] = useState(onboardingData.docs || {
    nationalId: null,
    vehiclePhoto: null,
    license: null,
  });

  const handlePick = (type) => {
    Alert.alert(
      "Upload Document",
      "Choose a source for your file",
      [
        { text: "Photo Library", onPress: () => pickImage(type) },
        { text: "Files / Documents", onPress: () => pickFile(type) },
        { text: "Cancel", style: "cancel" }
      ],
      { cancelable: true }
    );
  };

  const pickImage = async (type) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Allow access to your photos to upload documents.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const fileName = uri.split('/').pop();
      const newDocs = { ...docs, [type]: { uri, name: fileName, format: 'image' } };
      setDocs(newDocs);
      updateOnboardingData({ docs: newDocs });
    }
  };

  const pickFile = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'], // Allow PDF and common images
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        const newDocs = { ...docs, [type]: { uri: file.uri, name: file.name, format: 'document' } };
        setDocs(newDocs);
        updateOnboardingData({ docs: newDocs });
      }
    } catch (err) {
      Alert.alert("Error", "Could not pick document. Please try again.");
    }
  };

  const removeDoc = (type) => {
    const newDocs = { ...docs, [type]: null };
    setDocs(newDocs);
    updateOnboardingData({ docs: newDocs });
  };

  const UploadBox = ({ label, type, value }) => {
    const isUploaded = !!value;

    return (
      <View style={styles.uploadCard}>
        <Text style={styles.uploadLabel}>{label}</Text>
        
        {isUploaded ? (
          <View style={styles.uploadedBox}>
            <Ionicons 
              name={value.format === 'image' ? "image-outline" : "document-outline"} 
              size={20} 
              color="#2E7D32" 
              style={{ marginRight: 10 }}
            />
            <Text style={styles.fileName} numberOfLines={1}>{value.name}</Text>
            <TouchableOpacity onPress={() => removeDoc(type)}>
              <Ionicons name="close-circle" size={20} color="#2E7D32" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.dashedBox, type === 'vehiclePhoto' && styles.orangeDashedBox]} 
            onPress={() => handlePick(type)}
          >
            <Ionicons name="cloud-upload-outline" size={24} color={type === 'vehiclePhoto' ? Colors.primary : '#999'} />
            <Text style={styles.uploadText}>Tap to upload image or PDF</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Step Header */}
        <View style={styles.stepHeader}>
          <Text style={styles.stepText}>Step 3 of 5 | <Text style={styles.stepTitle}>Documents</Text></Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarActive, { width: '60%' }]} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.mainTitle}>Upload documents</Text>
          <Text style={styles.subtitle}>Clear photos or PDF files help us verify you faster.</Text>

          <View style={styles.form}>
            <UploadBox 
              label="National ID (NIN/Passport/Voter's Card)" 
              type="nationalId" 
              value={docs.nationalId} 
            />
            <UploadBox 
              label="Photo of your vehicle" 
              type="vehiclePhoto" 
              value={docs.vehiclePhoto} 
            />
            <UploadBox 
              label="Rider's/Driver's License" 
              type="license" 
              value={docs.license} 
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.continueButton, (!docs.nationalId || !docs.vehiclePhoto || !docs.license) && styles.disabledBtn]}
            onPress={() => navigation.navigate('DriverStep4Payout')}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1 },
  stepHeader: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  stepText: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 10 },
  stepTitle: { fontWeight: '600', color: '#333' },
  progressBarContainer: { height: 4, backgroundColor: '#EEE', borderRadius: 2, width: '100%', overflow: 'hidden' },
  progressBarActive: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', marginTop: 20, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  form: { gap: 20 },
  uploadCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  dashedBox: {
    height: 100,
    borderWidth: 1,
    borderColor: '#CCC',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    gap: 8,
  },
  orangeDashedBox: {
    borderColor: Colors.primary,
    backgroundColor: '#FDECE2',
  },
  uploadText: {
    fontSize: 13,
    color: '#666',
  },
  uploadedBox: {
    height: 48,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  fileName: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '500',
    flex: 1,
  },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#FAFAFA' },
  continueButton: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 18, alignItems: 'center' },
  continueText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  disabledBtn: { opacity: 0.6 },
});

export default DriverStep4Docs;
