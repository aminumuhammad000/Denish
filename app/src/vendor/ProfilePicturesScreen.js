import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ProgressBar } from '../components/OnboardingComponents';
import { uploadVendorImages } from '../services/api';
import AnimatedLoadingText from '../components/AnimatedLoadingText';
import { useOnboarding } from '../context/OnboardingContext';

const UploadBox = ({ label, height, image, onPress }) => (
  <View style={styles.uploadContainer}>
    <Text style={styles.uploadLabel}>{label}</Text>
    <TouchableOpacity 
      style={[styles.dashBox, { height }, image && { borderStyle: 'solid', padding: 0, overflow: 'hidden' }]} 
      onPress={onPress}
    >
      {image ? (
        <Image source={{ uri: image }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
      ) : (
        <>
          <Ionicons name="cloud-upload-outline" size={32} color={Colors.primary} />
          <Text style={styles.uploadText}>Tap to upload (max 5MB)</Text>
        </>
      )}
      {image && (
        <View style={styles.changeBadge}>
          <Text style={styles.changeBadgeText}>Change</Text>
        </View>
      )}
    </TouchableOpacity>
  </View>
);

const ProfilePicturesScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [coverImage, setCoverImage] = useState(onboardingData.coverUrl || null);
  const [profileImage, setProfileImage] = useState(onboardingData.logoUrl || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickImage = async (type) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'cover' ? [16, 9] : [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'cover') setCoverImage(result.assets[0].uri);
      else setProfileImage(result.assets[0].uri);
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      const result = await uploadVendorImages(profileImage, coverImage);
      if (result.success) {
        updateOnboardingData({ 
          logoUrl: result.logoUrl, 
          coverUrl: result.coverUrl 
        });
        navigation.navigate('Step4');
      } else {
        alert('Upload failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Network error during upload. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProgressBar currentStep={3} totalSteps={5} title="Profile" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Upload cover and profile pictures</Text>
          <Text style={styles.subtitle}>Clear photos help you stand out.</Text>
        </View>

        <UploadBox 
          label="Cover picture" 
          height={160} 
          image={coverImage} 
          onPress={() => pickImage('cover')} 
        />
        <View style={{ height: 24 }} />
        <UploadBox 
          label="Profile picture (Logo)" 
          height={220} 
          image={profileImage} 
          onPress={() => pickImage('profile')} 
        />

        <TouchableOpacity 
          style={[styles.button, (!coverImage || !profileImage || loading) && { opacity: 0.5 }]}
          onPress={handleContinue}
          disabled={!coverImage || !profileImage || loading}
        >
          {loading ? (
            <AnimatedLoadingText text="Uploading images" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  uploadContainer: {
    gap: 8,
  },
  uploadLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dashBox: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadText: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  changeBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changeBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ProfilePicturesScreen;
