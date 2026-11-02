import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import {
  getAppNotifications,
  markAppNotificationRead,
  markAllAppNotificationsRead,
} from '../services/api';
import { getAuthSession } from '../services/authStorage';

// ─── Helper: relative time ────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000); // seconds

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 172800) return 'Yesterday';
  const days = Math.floor(diff / 86400);
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

// ─── Icon/color map per notification type ────────────────────────────────────
const TYPE_CONFIG = {
  order:   { icon: 'cart-outline',        color: '#FF8C00', label: 'Orders' },
  payment: { icon: 'wallet-outline',      color: '#10B981', label: 'Payment' },
  promo:   { icon: 'gift-outline',        color: '#EF4444', label: 'Promo' },
  system:  { icon: 'settings-outline',    color: '#3B82F6', label: 'System' },
  driver:  { icon: 'car-outline',         color: '#8B5CF6', label: 'Driver' },
  dispute: { icon: 'alert-circle-outline',color: '#F59E0B', label: 'Dispute' },
};

// ─── Single Notification Card ────────────────────────────────────────────────
const NotificationCard = ({ item, onMarkRead, onOpenDetail }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.system;
  const isLong = (item.message || '').length > 70;

  const handleCardPress = () => {
    onMarkRead(item);
    onOpenDetail(item);
  };

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    onMarkRead(item);
    setExpanded(prev => !prev);
  };

  return (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.unreadCard]}
      activeOpacity={0.75}
      onPress={handleCardPress}
    >
      <View style={[styles.iconBg, { backgroundColor: cfg.color }]}>
        <Ionicons name={cfg.icon} size={20} color="#FFF" />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text style={[styles.cardTitle, !item.read && styles.unreadTitle]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardTime}>{timeAgo(item.createdAt)}</Text>
        </View>
        <Text 
          style={styles.cardMessage} 
          numberOfLines={expanded ? undefined : 2}
        >
          {item.message}
        </Text>
        {isLong && (
          <TouchableOpacity onPress={handleToggleExpand} style={styles.expandToggleBtn}>
            <Text style={styles.expandToggleText}>
              {expanded ? 'Show less' : 'View full message'}
            </Text>
            <Ionicons 
              name={expanded ? 'chevron-up' : 'chevron-down'} 
              size={13} 
              color={Colors.primary} 
            />
          </TouchableOpacity>
        )}
      </View>

      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
const TABS = ['All', 'Orders', 'Payment', 'System'];

const TAB_FILTERS = {
  All:     null,
  Orders:  'order',
  Payment: 'payment',
  System:  'system',
};

const NotificationsScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab]       = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);

  const [currentRole, setCurrentRole]   = useState(route?.params?.role || null);
  const unreadCountRef = useRef(0);
  unreadCountRef.current = notifications.filter(n => !n.read).length;

  useEffect(() => {
    let isMounted = true;
    async function determineRole() {
      if (route?.params?.role) {
        if (isMounted) setCurrentRole(route.params.role);
      } else {
        const session = await getAuthSession();
        if (isMounted) setCurrentRole(session?.role || 'customer');
      }
    }
    determineRole();
    return () => { isMounted = false; };
  }, [route?.params?.role]);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (!currentRole) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const res = await getAppNotifications(currentRole);
      if (res?.success && Array.isArray(res.data)) {
        // Extra safeguard: Only customer accounts should ever see personal wallet/payment notifications
        const sanitized = currentRole === 'customer'
          ? res.data
          : res.data.filter(n => n.type !== 'payment' && !/wallet|customer balance/i.test(n.title || ''));
        setNotifications(sanitized);
        // Automatically mark all as read when viewing the notifications screen
        if (sanitized.some(n => !n.read)) {
          markAllAppNotificationsRead(currentRole).catch(e => console.error('Auto mark read error:', e));
        }
      } else {
        setError('Could not load notifications.');
      }
    } catch (err) {
      setError('Network error. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentRole]);

  useEffect(() => {
    if (currentRole) {
      fetchNotifications();
    }
  }, [fetchNotifications, currentRole]);

  useEffect(() => {
    return () => {
      // When the user leaves the notifications screen, automatically mark unread as read
      if (currentRole && unreadCountRef.current > 0) {
        markAllAppNotificationsRead(currentRole).catch(() => {});
      }
    };
  }, [currentRole]);

  const handleMarkRead = async (item) => {
    const itemId = item._id || item.id;
    if (item.read || !itemId) return;
    // Optimistically mark as read in UI
    setNotifications(prev =>
      prev.map(n => (n._id === itemId || n.id === itemId) ? { ...n, read: true } : n)
    );
    try {
      await markAppNotificationRead(itemId, currentRole);
    } catch (e) {
      // Revert on failure
      setNotifications(prev =>
        prev.map(n => (n._id === itemId || n.id === itemId) ? { ...n, read: false } : n)
      );
    }
  };

  const handleMarkAllRead = async () => {
    const hasUnread = notifications.some(n => !n.read);
    if (!hasUnread) return;
    // Optimistically update UI
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      const res = await markAllAppNotificationsRead(currentRole);
      if (!res || !res.success) {
        throw new Error('Failed to mark all as read');
      }
    } catch (e) {
      console.error('Mark all read error:', e);
      Alert.alert('Error', 'Could not mark all as read. Please try again.');
      fetchNotifications(); // Revert to server state
    }
  };

  const filteredNotifications = activeTab === 'All'
    ? notifications
    : notifications.filter(n => n.type === TAB_FILTERS[activeTab]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconBg}>
        <Ionicons name="notifications-off-outline" size={54} color="#CBD5E1" />
      </View>
      <Text style={styles.emptyTitle}>No notifications</Text>
      <Text style={styles.emptySub}>
        {activeTab === 'All'
          ? "You're all caught up! We'll notify you when something happens."
          : `No ${activeTab.toLowerCase()} notifications yet.`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.markAllBtn, unreadCount === 0 && { opacity: 0.4 }]}
          onPress={handleMarkAllRead}
          disabled={unreadCount === 0}
        >
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading notifications…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorState}>
          <Ionicons name="cloud-offline-outline" size={48} color="#CBD5E1" />
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchNotifications()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={item => item._id || item.id || String(Math.random())}
          renderItem={({ item }) => (
            <NotificationCard 
              item={item} 
              onMarkRead={handleMarkRead} 
              onOpenDetail={(notif) => {
                handleMarkRead(notif);
                setSelectedNotification(notif);
              }}
            />
          )}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            filteredNotifications.length === 0 && { flex: 1 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications(true)}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}

      {/* ── Full Notification Message Reader Modal ── */}
      <Modal
        visible={!!selectedNotification}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedNotification(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View style={[
                styles.modalIconBg, 
                { backgroundColor: (TYPE_CONFIG[selectedNotification?.type] || TYPE_CONFIG.system).color }
              ]}>
                <Ionicons 
                  name={(TYPE_CONFIG[selectedNotification?.type] || TYPE_CONFIG.system).icon} 
                  size={24} 
                  color="#FFF" 
                />
              </View>
              <View style={styles.modalHeaderInfo}>
                <View style={styles.modalTypePill}>
                  <Text style={styles.modalTypePillText}>
                    {(TYPE_CONFIG[selectedNotification?.type] || TYPE_CONFIG.system).label}
                  </Text>
                </View>
                <Text style={styles.modalTimeText}>
                  {selectedNotification && new Date(selectedNotification.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })} • {selectedNotification && new Date(selectedNotification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setSelectedNotification(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={styles.modalTitleText}>{selectedNotification?.title}</Text>

            {/* Full Message Body */}
            <ScrollView style={styles.modalMessageScroll} showsVerticalScrollIndicator={true}>
              <Text style={styles.modalFullMessageText}>
                {selectedNotification?.message}
              </Text>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActionsRow}>
              {selectedNotification?.type === 'order' && (
                <TouchableOpacity
                  style={styles.modalActionBtn}
                  onPress={() => {
                    setSelectedNotification(null);
                    navigation.navigate('CustomerOrders');
                  }}
                >
                  <Ionicons name="receipt-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.modalActionBtnText}>View Orders</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.modalDismissBtn,
                  selectedNotification?.type !== 'order' && { flex: 1 }
                ]}
                onPress={() => setSelectedNotification(null)}
              >
                <Text style={styles.modalDismissBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 4 },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  markAllBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  markAllText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 6,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  activeTab: { backgroundColor: Colors.primary },
  tabText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  activeTabText: { color: '#FFF' },

  // List
  listContent: {
    padding: 16,
    paddingBottom: 60,
  },

  // Notification Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
    position: 'relative',
  },
  unreadCard: {
    borderColor: 'rgba(255, 140, 0, 0.25)',
    backgroundColor: '#FFFCF7',
  },
  iconBg: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  cardContent: { flex: 1 },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: { fontWeight: '700', color: '#0F172A' },
  cardTime: { fontSize: 11, color: '#94A3B8', flexShrink: 0 },
  cardMessage: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  expandToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  expandToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Colors.primary,
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 22,
    width: '100%',
    maxWidth: 480,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 25,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconBg: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalHeaderInfo: {
    flex: 1,
  },
  modalTypePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  modalTypePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  modalTimeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    lineHeight: 22,
  },
  modalMessageScroll: {
    maxHeight: 280,
    marginVertical: 4,
    paddingRight: 4,
  },
  modalFullMessageText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalActionBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActionBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalDismissBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDismissBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },

  // States
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  loadingText: { fontSize: 14, color: '#94A3B8' },

  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 10,
  },
  errorTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B', marginTop: 4 },
  errorSub: { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyIconBg: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsScreen;
