import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchSystemContent } from '../services/api';

const SystemContentScreen = ({ navigation, route }) => {
  const { key, title } = route.params;
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [key]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await fetchSystemContent(key);
      if (res.success) {
        setContentData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{contentData?.title || title || 'Information'}</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#FF7A00" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <Text style={styles.contentText}>
              {contentData?.content || 'No content available.'}
            </Text>

            {key === 'help_and_support' && (
              <View style={styles.contactContainer}>
                <Text style={styles.contactHeader}>Contact Us</Text>
                <View style={styles.contactRow}>
                  <MaterialCommunityIcons name="email-outline" size={22} color="#FF7A00" />
                  <Text style={styles.contactValue}>{contentData?.contactEmail || 'support@denish.com'}</Text>
                </View>
                <View style={styles.contactRow}>
                  <MaterialCommunityIcons name="phone-outline" size={22} color="#FF7A00" />
                  <Text style={styles.contactValue}>{contentData?.contactPhone || '+234 800 336 4741'}</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  backBtn: { padding: 4 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  contentText: { fontSize: 15, color: '#4A4A4A', lineHeight: 24 },
  contactContainer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: '#EAEAEA',
  },
  contactHeader: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  contactValue: { fontSize: 15, color: '#1A1A1A', fontWeight: '500' }
});

export default SystemContentScreen;
