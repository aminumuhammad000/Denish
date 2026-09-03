import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ProgressBar } from '../components/OnboardingComponents';
import { uploadVendorImages } from '../services/api';
import AnimatedLoadingText from '../components/AnimatedLoadingText';
import { useOnboarding } from '../context/OnboardingContext';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';
const DEFAULT_LOGO = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80';

const UploadBox = ({ label, hint, height, image, onPress }) => (
  <View style={styles.uploadContainer}>
    <Text style={styles.uploadLabel}>{label}</Text>
    {hint ? <Text style={styles.uploadHint}>{hint}</Text> : null}
    <TouchableOpacity 
      style={[styles.dashBox, { height }, image && { borderStyle: 'solid', padding: 0, overflow: 'hidden' }]} 
      onPress={onPress}
    >
      {image ? (
        <Image source={{ uri: image }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
      ) : (
        <>
          <Ionicons name="cloud-upload-outline" size={32} color={Colors.primary} />
          <Text style={styles.uploadText}>Tap to upload photo (max 5MB)</Text>
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
          // Non-blocking permission alert
        }
      }
    })();
  }, []);

  const pickImage = async (type) => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: type === 'cover' ? [16, 9] : [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (type === 'cover') setCoverImage(result.assets[0].uri);
        else setProfileImage(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Image pick error:', e);
    }
  };

  const handleUseDefaults = () => {
    setCoverImage(DEFAULT_COVER);
    setProfileImage(DEFAULT_LOGO);
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      let finalCover = coverImage || DEFAULT_COVER;
      let finalLogo = profileImage || DEFAULT_LOGO;

      // Only upload if local file URI
      const isLocalCover = finalCover && !finalCover.startsWith('http');
      const isLocalLogo = finalLogo && !finalLogo.startsWith('http');

      if (isLocalCover || isLocalLogo) {
        const result = await uploadVendorImages(
          isLocalLogo ? finalLogo : null, 
          isLocalCover ? finalCover : null
        );
        if (result.success) {
          if (result.logoUrl) finalLogo = result.logoUrl;
          if (result.coverUrl) finalCover = result.coverUrl;
        }
      }

      updateOnboardingData({ 
        logoUrl: finalLogo, 
        coverUrl: finalCover 
      });
      navigation.navigate('Step4');
    } catch (error) {
      console.warn('Upload error, continuing with available images:', error);
      updateOnboardingData({ 
        logoUrl: profileImage || DEFAULT_LOGO, 
        coverUrl: coverImage || DEFAULT_COVER 
      });
      navigation.navigate('Step4');
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
          <Text style={styles.subtitle}>These photos represent your brand to hungry customers.</Text>
        </View>

        <UploadBox 
          label="Cover picture (Storefront Banner)" 
          hint="Wide header photo (16:9) displayed at the top of your restaurant page."
          height={160} 
          image={coverImage} 
          onPress={() => pickImage('cover')} 
        />
        <View style={{ height: 24 }} />
        <UploadBox 
          label="Profile picture (Business Logo)" 
          hint="Square avatar (1:1) displayed in search results, orders, and restaurant listings."
          height={200} 
          image={profileImage} 
          onPress={() => pickImage('profile')} 
        />

        {(!coverImage || !profileImage) && (
          <TouchableOpacity 
            style={styles.defaultBtn} 
            onPress={handleUseDefaults}
          >
            <Ionicons name="sparkles-outline" size={16} color={Colors.primary} />
            <Text style={styles.defaultBtnText}>Use Default Food Brand Photos</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleContinue}
          disabled={loading}
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
    fontWeight: '700',
    color: '#1a1a1a',
  },
  uploadHint: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  defaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  defaultBtnText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
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
