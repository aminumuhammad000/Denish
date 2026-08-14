import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getDriverChats } from '../services/api';

const DEFAULT_CHATS = [
  {
    id: '1',
    name: "John Doe (Customer)",
    lastMsg: "I'm standing by the white gate.",
    time: "12:30 PM",
    unread: 1,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
  },
  {
    id: '2',
    name: "Spice Avenue (Restaurant)",
    lastMsg: "Order is ready for pickup!",
    time: "12:15 PM",
    unread: 0,
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100'
  },
  {
    id: '3',
    name: "Denish Support",
    lastMsg: "We've received your inquiry. A representative will be with you.",
    time: "Yesterday",
    unread: 0,
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100'
  }
];

const DriverChatListScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const res = await getDriverChats();
      if (res && res.success && res.threads && res.threads.length > 0) {
        setChats(res.threads);
      } else {
        setChats(DEFAULT_CHATS);
      }
    } catch (e) {
      console.error('Error loading driver chats:', e);
      setChats(DEFAULT_CHATS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadChats();
  };

  const filteredChats = chats.filter(chat => 
    (chat.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (chat.lastMsg || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#AAA" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
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
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={item => item.id || item.name}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.chatRow} 
              onPress={() => navigation.navigate('ChatDetail', { name: item.name, role: 'Driver' })}
            >
              <Image source={{ uri: item.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' }} style={styles.avatar} />
              <View style={styles.chatInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
                <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMsg}</Text>
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
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#F5F5F5',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
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
  searchInput: { flex: 1, height: 45, fontSize: 15, color: '#1a1a1a' },
  list: { paddingBottom: 110 },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  chatRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#F9F9F9',
  },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EEE' },
  chatInfo: { flex: 1, marginLeft: 15 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
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

export default DriverChatListScreen;
