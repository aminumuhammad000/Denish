import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileCard = ({ title, children, onEdit, showEdit = true }) => (
  <View style={styles.profileCard}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      {showEdit && (
        <TouchableOpacity onPress={onEdit}>
          <Text style={styles.editLink}>Edit {'>'}</Text>
        </TouchableOpacity>
      )}
    </View>
    <View style={styles.cardContent}>
      {children}
    </View>
  </View>
);

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const DocumentRow = ({ title, date, status }) => {
  const isApproved = status === 'Approved';
  return (
    <View style={styles.docRow}>
      <View>
        <Text style={styles.docTitle}>{title}</Text>
        <Text style={styles.docDate}>Expires {date}</Text>
      </View>
      <View style={[styles.docBanner, { backgroundColor: isApproved ? '#ECFDF5' : '#FFF7ED' }]}>
        <Text style={[styles.docStatus, { color: isApproved ? '#10B981' : '#F97316' }]}>{status}</Text>
      </View>
    </View>
  );
};

const NotificationRow = ({ title, sub, value, onToggle }) => (
  <View style={styles.notifRow}>
    <View style={{ flex: 1 }}>
      <Text style={styles.notifTitle}>{title}</Text>
      <Text style={styles.notifSub}>{sub}</Text>
    </View>
    <Switch 
      value={value} 
      onValueChange={onToggle}
      trackColor={{ false: '#E2E8F0', true: '#10B981' }}
      thumbColor={'#FFF'}
    />
  </View>
);

const DriverProfileScreen = ({ navigation }) => {
  const [notifs, setNotifs] = useState({
    orders: true,
    payouts: true,
    promos: false,
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* TOP PROFILE BOX */}
        <View style={styles.topCard}>
          <TouchableOpacity 
            style={styles.avatarWrapper}
            onPress={() => navigation.navigate('DriverEditProfile')}
          >
            <View style={styles.avatar}>
               <Text style={styles.avatarText}>BA</Text>
            </View>
            <View style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={12} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>Bayo Adeyemi</Text>
          <Text style={styles.userPhone}>+234847474848</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.statText}>4.8</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statText}>342 trips</Text>
            </View>
          </View>
        </View>

        {/* PERSONAL INFO */}
        <ProfileCard title="Personal information" onEdit={() => navigation.navigate('DriverEditProfile')}>
           <InfoRow label="Name" value="Bayo Adeyemi" />
           <View style={styles.divider} />
           <InfoRow label="Email" value="bayo.adeyemi@gmail.com" />
           <View style={styles.divider} />
           <InfoRow label="Phone" value="+2349085485747" />
        </ProfileCard>

        {/* VEHICLE DETAILS */}
        <ProfileCard title="Vehicle details" onEdit={() => navigation.navigate('DriverEditProfile')}>
           <InfoRow label="Type" value="Motorcycle" />
           <View style={styles.divider} />
           <InfoRow label="Make/model" value="Honda ACE 125" />
           <View style={styles.divider} />
           <InfoRow label="Plate" value="LSR-482-AB" />
           <View style={styles.divider} />
           <InfoRow label="Color" value="Red" />
        </ProfileCard>

        {/* BANK ACCOUNT */}
        <ProfileCard title="Bank account" onEdit={() => navigation.navigate('DriverEditProfile')}>
           <InfoRow label="Bank" value="GTBank" />
           <View style={styles.divider} />
           <InfoRow label="Account name" value="Bayo Adeyemi" />
           <View style={styles.divider} />
           <InfoRow label="Number" value="7474673733" />
        </ProfileCard>

        {/* DOCUMENTS */}
        <ProfileCard title="Documents" showEdit={false}>
          <DocumentRow title="National ID" date="2029-08-21" status="Approved" />
          <View style={styles.divider} />
          <DocumentRow title="Rider's License" date="2029-08-21" status="Approved" />
          <View style={styles.divider} />
          <DocumentRow title="Vehicle photo" date="2029-08-21" status="Approved" />
          <View style={styles.divider} />
          <DocumentRow title="Insurance" date="2029-08-21" status="Re-upload" />
        </ProfileCard>

        {/* NOTIFICATIONS */}
        <ProfileCard title="Notifications" showEdit={false}>
          <NotificationRow 
            title="Order requests" 
            sub="New deliveries near you" 
            value={notifs.orders} 
            onToggle={(v) => setNotifs({...notifs, orders: v})} 
          />
          <View style={styles.divider} />
          <NotificationRow 
            title="Payouts" 
            sub="When earnings are sent to your bank" 
            value={notifs.payouts} 
            onToggle={(v) => setNotifs({...notifs, payouts: v})} 
          />
          <View style={styles.divider} />
          <NotificationRow 
            title="Promotions" 
            sub="Bonuses & weekly challenges" 
            value={notifs.promos} 
            onToggle={(v) => setNotifs({...notifs, promos: v})} 
          />
        </ProfileCard>

        {/* HELP & SUPPORT */}
        <TouchableOpacity style={styles.helpItem}>
          <View style={styles.helpLeft}>
             <View style={styles.helpIconCircle}>
                <Ionicons name="alert-circle-outline" size={20} color="#64748B" />
             </View>
             <Text style={styles.helpText}>Help & support</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity style={styles.logoutBtnOuter}>
           <Ionicons name="log-out-outline" size={20} color="#EF4444" />
           <Text style={styles.logoutTextOuter}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backBtn: { padding: 5, marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  topCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  avatarWrapper: { position: 'relative', marginBottom: 15 },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#64748B' },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  userPhone: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statDivider: { width: 1, height: 10, backgroundColor: '#E2E8F0' },
  statText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  editLink: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  cardContent: { gap: 15 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 14, color: '#94A3B8' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1E293B', flex: 1, textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#F8FAFC' },
  docRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  docTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  docDate: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  docBanner: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  docStatus: { fontSize: 10, fontWeight: 'bold' },
  notifRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notifTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  notifSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  helpItem: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 20,
  },
  helpLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  helpIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  helpText: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  logoutBtnOuter: {
    height: 56,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#EF4444',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    marginVertical: 20,
  },
  logoutTextOuter: { color: '#EF4444', fontSize: 16, fontWeight: 'bold' },
});

export default DriverProfileScreen;
