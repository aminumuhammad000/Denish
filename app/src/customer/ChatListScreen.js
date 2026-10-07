import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, Image, TextInput, RefreshControl, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomerBottomTab from './components/CustomerBottomTab';
import { fetchChatThreads } from '../services/api';
import { useIsFocused } from '@react-navigation/native';

const ChatListScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [search, setSearch] = useState('');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadThreads(true);
    }
  }, [isFocused]);

  // Live polling for new threads / unread count updates every 4 seconds while focused
  useEffect(() => {
    if (!isFocused) return;
    const interval = setInterval(() => {
      loadThreads(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [isFocused]);

  const loadThreads = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetchChatThreads();
      if (res && res.success && Array.isArray(res.threads)) {
        setChats(res.threads);
      }
    } catch (e) {
      console.error('Error loading chat threads:', e);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadThreads(false);
  };

  const filteredChats = chats.filter(chat => 
    (chat.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (chat.lastMsg || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#AAA" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
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
          <ActivityIndicator size="large" color="#FF8C00" />
        </View>
      ) : (
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
                type: item.role || 'Vendor',
                avatar: item.avatar
              })}
            >
              <Image 
                source={{ uri: item.avatar || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100' }} 
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF8C00']} />
          }
          contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={60} color="#DDD" />
              <Text style={styles.emptyText}>No conversations yet</Text>
            </View>
          }
        />
      )}
      <CustomerBottomTab activeTab="Chats" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#F5F5F5',
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  backBtn: { padding: 4 },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 15,
    color: '#1a1a1a',
  },

  list: { paddingBottom: 110 },
  chatRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#FAFAFA',
  },
  avatar: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#EEE' },
  chatInfo: { flex: 1, marginLeft: 15 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', flex: 1, marginRight: 8 },
  time: { fontSize: 12, color: '#AAA' },
  lastMsg: { fontSize: 14, color: '#888' },
  unreadBadge: {
    backgroundColor: '#FF8C00',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 10,
  },
  unreadText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#BBB', marginTop: 15, fontSize: 15 },
});

export default ChatListScreen;
