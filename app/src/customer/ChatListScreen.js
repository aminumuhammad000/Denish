import React from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const CHATS = [
  {
    id: '1',
    name: "Mama's Kitchen",
    lastMsg: "Your order is being prepared and will be with you shortly!",
    time: "12:30 PM",
    unread: 2,
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100'
  }
];

const ChatListScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={CHATS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatRow}>
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
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={60} color="#DDD" />
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        }
      />
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
  list: { paddingVertical: 10 },
  chatRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#FAFAFA',
  },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#EEE' },
  chatInfo: { flex: 1, marginLeft: 15 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  time: { fontSize: 12, color: '#AAA' },
  lastMsg: { fontSize: 13, color: '#888' },
  unreadBadge: {
    backgroundColor: '#FF8C00',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 10,
  },
  unreadText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#BBB', marginTop: 15, fontSize: 15 },
});

export default ChatListScreen;
