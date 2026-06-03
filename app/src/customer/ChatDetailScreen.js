import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const ChatDetailScreen = ({ route, navigation }) => {
  const { name = 'Kolawole Adeleke', type = 'Driver' } = route?.params || {};
  const [message, setMessage] = useState('');

  const messages = [
    { id: '1', text: "I'm delivering the items at your reception desk.", time: "14:01", sender: 'me' },
    { id: '2', text: "Thanks, the food was hot 🔥", time: "14:02", sender: 'them' },
    { id: '3', text: "You're welcome, sir.", time: "14:03", sender: 'me' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{name}</Text>
          <Text style={styles.headerSubtitle}>{type}</Text>
        </View>
        <TouchableOpacity style={styles.callBtn}>
          <Ionicons name="call" size={20} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {messages.map((m) => (
          <View key={m.id} style={[styles.messageRow, m.sender === 'me' ? styles.meRow : styles.themRow]}>
            <View style={[styles.bubble, m.sender === 'me' ? styles.meBubble : styles.themBubble]}>
              <Text style={[styles.messageText, m.sender === 'me' ? styles.meText : styles.themText]}>
                {m.text}
              </Text>
              <Text style={[styles.timeText, m.sender === 'me' ? styles.meTime : styles.themTime]}>
                {m.time}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input Bar */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.cameraBtn}>
            <Ionicons name="camera-outline" size={24} color="#666" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendBtn}>
            <Ionicons name="send" size={18} color="#FF8C00" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  backBtn: { padding: 4 },
  headerTitleContainer: { flex: 1, marginLeft: 15 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  headerSubtitle: { fontSize: 12, color: '#999', marginTop: 2 },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scroll: { padding: 20, paddingBottom: 40 },
  messageRow: { marginBottom: 15, flexDirection: 'row' },
  meRow: { justifyContent: 'flex-end' },
  themRow: { justifyContent: 'flex-start' },

  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    position: 'relative',
  },
  meBubble: {
    backgroundColor: '#FF8C00',
    borderBottomRightRadius: 4,
  },
  themBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },

  messageText: { fontSize: 14, lineHeight: 20 },
  meText: { color: '#FFF' },
  themText: { color: '#333' },

  timeText: { fontSize: 10, alignSelf: 'flex-end', marginTop: 5 },
  meTime: { color: 'rgba(255,255,255,0.7)' },
  themTime: { color: '#999' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
  },
  cameraBtn: { marginRight: 10 },
  input: {
    flex: 1,
    height: 45,
    backgroundColor: '#F5F5F5',
    borderRadius: 22,
    paddingHorizontal: 20,
    fontSize: 15,
    color: '#333',
  },
  sendBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#FFF2E6',
    borderRadius: 20,
  },
});

export default ChatDetailScreen;
