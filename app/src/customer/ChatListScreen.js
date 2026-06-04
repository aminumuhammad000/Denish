import React, { useState } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, Image, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomerBottomTab from './components/CustomerBottomTab';

const CHATS = [
  {
    id: '1',
    name: "Mama's Kitchen",
    lastMsg: "Your order is being prepared and will be with you shortly!",
    time: "12:30 PM",
    unread: 2,
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100'
  },
  {
    id: '2',
    name: "Temmy Store",
    lastMsg: "Thank you for shopping with us. Your provisions are ready.",
    time: "Yesterday",
    unread: 0,
    avatar: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'
  },
  {
    id: '3',
    name: "Gourmet Hub",
    lastMsg: "We just updated our continental menu. Check it out!",
    time: "Monday",
    unread: 0,
    avatar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'
  }
];

const ChatListScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');

  const filteredChats = CHATS.filter(chat => 
    chat.name.toLowerCase().includes(search.toLowerCase()) ||
    chat.lastMsg.toLowerCase().includes(search.toLowerCase())
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

      <FlatList
        data={filteredChats}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.chatRow} 
            onPress={() => navigation.navigate('ChatDetail', { name: item.name, type: item.id === '1' ? 'Driver' : 'Vendor' })}
          >
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
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
        contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={60} color="#DDD" />
            <Text style={styles.emptyText}>No messages found</Text>
          </View>
        }
      />
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

  list: { paddingBottom: 20 },
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

export default ChatListScreen;
