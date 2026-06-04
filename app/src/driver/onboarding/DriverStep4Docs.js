import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const DriverStep4Docs = ({ navigation }) => {
  const DocItem = ({ title, status }) => (
    <TouchableOpacity style={styles.docItem}>
      <View style={styles.docInfo}>
        <Ionicons name="document-text-outline" size={24} color={Colors.primary} />
        <View>
          <Text style={styles.docTitle}>{title}</Text>
          <Text style={styles.docStatus}>{status}</Text>
        </View>
      </View>
      <Ionicons name="cloud-upload-outline" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepText}>Step 4 of 5 | <Text style={styles.stepTitle}>Documents</Text></Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarActive} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.mainTitle}>Upload documents</Text>
          <Text style={styles.subtitle}>We need these to verify your identity.</Text>

          <View style={styles.docList}>
            <DocItem title="Driver's License" status="Not uploaded" />
            <DocItem title="Vehicle Insurance" status="Not uploaded" />
            <DocItem title="Vehicle Proof of Ownership" status="Not uploaded" />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => navigation.navigate('DriverStep5Review')}
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
  progressBarContainer: { height: 4, backgroundColor: '#EEE', borderRadius: 2, width: '100%' },
  progressBarActive: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2, width: '80%' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', marginTop: 20, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  docList: { gap: 15 },
  docItem: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0' },
  docInfo: { flexDirection: 'row', gap: 15, alignItems: 'center' },
  docTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  docStatus: { fontSize: 12, color: '#999' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#FAFAFA' },
  continueButton: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 18, alignItems: 'center' },
  continueText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default DriverStep4Docs;
