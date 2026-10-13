import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { useIsFocused } from '@react-navigation/native';
import { getDriverChats, fetchCallLogsApi } from '../services/api';

const DriverChatListScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' | 'calls'
  const [chats, setChats] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isFocused) {
      loadData(true);
    }
  }, [isFocused]);

  // Live polling every 4 seconds while focused
  useEffect(() => {
    if (!isFocused) return;
    const interval = setInterval(() => {
      loadData(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [isFocused]);

  const loadData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [threadsRes, logsRes] = await Promise.allSettled([
        getDriverChats(),
        fetchCallLogsApi()
      ]);

      if (threadsRes.status === 'fulfilled' && threadsRes.value?.success && Array.isArray(threadsRes.value.threads)) {
        setChats(threadsRes.value.threads);
      } else if (threadsRes.status === 'fulfilled') {
        setChats([]);
      }

      if (logsRes.status === 'fulfilled' && logsRes.value?.success && Array.isArray(logsRes.value.logs)) {
        setCallLogs(logsRes.value.logs);
      }
    } catch (e) {
      console.error('Error loading driver chats & calls:', e);
      setChats([]);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  const formatCallDate = (dateStr) => {
    if (!dateStr) return '';
    const m = moment(dateStr);
    const now = moment();
    if (m.isSame(now, 'day')) {
      return `Today, ${m.format('h:mm A')}`;
    }
    if (m.isSame(now.clone().subtract(1, 'day'), 'day')) {
      return `Yesterday, ${m.format('h:mm A')}`;
    }
    return m.format('MMM D, h:mm A');
  };

  const filteredChats = chats.filter(chat => 
    (chat.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (chat.lastMsg || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredCalls = callLogs.filter(call =>
    (call.otherPartyName || '').toLowerCase().includes(search.toLowerCase()) ||
    (call.otherPartyPhone || '').includes(search) ||
    (call.subtitle || '').toLowerCase().includes(search.toLowerCase()) ||
    (call.status || '').toLowerCase().includes(search.toLowerCase())
  );

  const renderCallItem = ({ item }) => {
    const isMissed = item.status === 'missed' || (item.direction === 'incoming' && item.status === 'declined');
    let statusText = '';
    let statusColor = '#10B981';

    if (item.direction === 'outgoing') {
      if (item.status === 'accepted' || item.status === 'ended') {
        statusText = item.durationFormatted ? `Outgoing • ${item.durationFormatted}` : 'Outgoing • Completed';
      } else if (item.status === 'declined') {
        statusText = 'Outgoing • Declined';
        statusColor = '#EF4444';
      } else if (item.status === 'missed') {
        statusText = 'Outgoing • No Answer';
        statusColor = '#F59E0B';
      } else {
        statusText = 'Outgoing';
      }
    } else {
      if (item.status === 'missed') {
        statusText = 'Missed Call';
        statusColor = '#EF4444';
      } else if (item.status === 'declined') {
        statusText = 'Declined';
        statusColor = '#EF4444';
      } else {
        statusText = item.durationFormatted ? `Incoming • ${item.durationFormatted}` : 'Incoming • Answered';
      }
    }

    return (
      <View style={styles.callRow}>
        <View style={[
          styles.callAvatarBadge, 
          item.direction === 'outgoing' ? styles.callAvatarOutgoing : (isMissed ? styles.callAvatarMissed : styles.callAvatarIncoming)
        ]}>
          <Ionicons 
            name={item.direction === 'outgoing' ? "arrow-up-forward" : (isMissed ? "call-outline" : "call")} 
            size={18} 
            color="#FFF" 
          />
        </View>

        <View style={styles.callInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{item.otherPartyName || 'Contact'}</Text>
            <Text style={styles.time}>{formatCallDate(item.createdAt)}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Ionicons 
              name={item.direction === 'outgoing' ? "arrow-up-forward" : (isMissed ? "arrow-down-left" : "arrow-down")} 
              size={13} 
              color={statusColor} 
              style={{ marginRight: 4 }} 
            />
            <Text style={[styles.callStatusText, { color: statusColor }]} numberOfLines={1}>
              {statusText}
            </Text>
            {item.otherPartyRole ? (
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>{item.otherPartyRole}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.directCallBtn}
          onPress={() => navigation.navigate('Calling', {
            name: item.otherPartyName,
            phone: item.otherPartyPhone,
            receiverId: item.otherPartyId,
            orderId: item.orderId || 'Voice Call',
            subtitle: item.subtitle || `${item.otherPartyRole || 'Contact'}`
          })}
        >
          <Ionicons name="call" size={18} color="#FF6B52" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages & Calls</Text>
      </View>

      {/* Segmented Switcher: Messages vs Call Logs */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'messages' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('messages')}
        >
          <Ionicons 
            name="chatbubble-ellipses-outline" 
            size={15} 
            color={activeTab === 'messages' ? '#FFF' : '#666'} 
          />
          <Text style={[styles.segmentText, activeTab === 'messages' && styles.segmentTextActive]}>
            Messages
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'calls' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('calls')}
        >
          <Ionicons 
            name="call-outline" 
            size={15} 
            color={activeTab === 'calls' ? '#FFF' : '#666'} 
          />
          <Text style={[styles.segmentText, activeTab === 'calls' && styles.segmentTextActive]}>
            Call Logs{callLogs.length > 0 ? ` (${callLogs.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#AAA" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={activeTab === 'messages' ? 'Search chats...' : 'Search call history...'}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#BBB"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#CCC" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#FF6B52" />
        </View>
      ) : activeTab === 'messages' ? (
        <FlatList
          data={filteredChats}
          keyExtractor={item => item.conversationId || item.id || item.name}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.chatRow} 
              onPress={() => navigation.navigate('ChatDetail', { 
                name: item.name, 
                conversationId: item.conversationId || item.id,
                recipientId: item.recipientId,
                role: 'Driver',
                type: item.role || 'Customer',
                avatar: item.avatar
              })}
            >
              <Image 
                source={{ uri: item.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' }} 
                style={styles.avatar} 
              />
              <View style={styles.chatInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
                <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMsg || 'No messages yet'}</Text>
              </View>
              {item.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B52']} />
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={60} color="#DDD" />
              <Text style={styles.emptyText}>No messages found</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredCalls}
          keyExtractor={item => item.id || item.callId || `${item.createdAt}-${Math.random()}`}
          renderItem={renderCallItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B52']} />
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="call-outline" size={60} color="#DDD" />
              <Text style={styles.emptyText}>No call history found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F5F5F5',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },

  // Segment Tab Bar
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#FF6B52',
    shadowColor: '#FF6B52',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  segmentTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 42, fontSize: 14, color: '#1a1a1a' },
  list: { paddingBottom: 110 },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  chatRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#F9F9F9',
  },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#EEE' },
  chatInfo: { flex: 1, marginLeft: 14 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', flex: 1, marginRight: 8 },
  time: { fontSize: 12, color: '#AAA' },
  lastMsg: { fontSize: 13, color: '#888' },
  unreadBadge: {
    backgroundColor: '#FF6B52',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 10,
  },
  unreadText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },

  // Call Logs Row
  callRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  callAvatarBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callAvatarOutgoing: { backgroundColor: '#3B82F6' },
  callAvatarIncoming: { backgroundColor: '#10B981' },
  callAvatarMissed: { backgroundColor: '#EF4444' },
  callInfo: { flex: 1, marginLeft: 14 },
  callStatusText: { fontSize: 12, fontWeight: '500' },
  roleTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  roleTagText: { fontSize: 10, color: '#6B7280', fontWeight: '600' },
  directCallBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF0ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#BBB', marginTop: 15, fontSize: 15 },
});

export default DriverChatListScreen;
