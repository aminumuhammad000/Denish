import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadItemImage, fetchMessages, sendChatMessage, fetchDriverMessages, sendDriverChatMessage } from '../services/api';

const ChatDetailScreen = ({ route, navigation }) => {
  const { name = 'Temmy Store', type = 'Vendor', role = 'Customer' } = route?.params || {};
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  React.useEffect(() => {
    loadMessages();
  }, [name]);

  const loadMessages = async () => {
    try {
      const res = role === 'Driver' ? await fetchDriverMessages(name) : await fetchMessages(name);
      if (res.success && res.messages?.length > 0) {
        setMessages(res.messages);
      } else {
        setMessages([
          { id: '1', text: "I'm standing by the white gate.", time: "12:30 PM", sender: 'them' },
          { id: '2', text: "Okay, I'm almost there in 2 minutes.", time: "12:31 PM", sender: 'me' },
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (text, imageUrl = null, msgType = 'text', subText = '') => {
    if (!text && !imageUrl && msgType === 'text') return;
    
    // Optimistic UI update
    const newMessage = {
      id: Date.now().toString(),
      text: text,
      image: imageUrl,
      type: msgType,
      subText: subText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me'
    };
    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    try {
      if (role === 'Driver') {
        await sendDriverChatMessage({
          recipientName: name,
          text,
          imageUrl,
          type: msgType,
          subText
        });
      } else {
        await sendChatMessage({
          recipientName: name,
          text,
          imageUrl,
          type: msgType,
          subText
        });
      }
    } catch (e) {
      console.error('Failed to send message to backend:', e);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      handleImageUpload(result.assets[0].uri);
    }
  };

  const handleImageUpload = async (uri) => {
    setSending(true);
    try {
      const response = await uploadItemImage(uri);
      if (response.success) {
        sendMessage(null, response.imageUrl, 'image');
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (err) {
      Alert.alert('Upload Error', err.message);
    } finally {
      setSending(false);
    }
  };

  const handleCall = () => {
    sendMessage("Voice Call", null, 'call', 'Outgoing');
    navigation.navigate('Calling', { name, phone: '09123882672' });
  };

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
        <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
          <Ionicons name="call" size={20} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {messages.map((m) => (
            <View key={m.id} style={[styles.messageRow, m.sender === 'me' ? styles.meRow : styles.themRow]}>
              <View style={[
                styles.bubble, 
                m.sender === 'me' ? styles.meBubble : styles.themBubble,
                m.type === 'call' && styles.callBubble
              ]}>
                {m.type === 'call' ? (
                  <View style={styles.callMessageContainer}>
                    <Ionicons name="call" size={18} color={m.sender === 'me' ? "#FFF" : "#333"} />
                    <View style={styles.callMessageInfo}>
                      <Text style={[styles.messageText, m.sender === 'me' ? styles.meText : styles.themText]}>
                        {m.text}
                      </Text>
                      <Text style={[styles.callSubText, m.sender === 'me' ? styles.meTime : styles.themTime]}>
                        {m.subText}
                      </Text>
                    </View>
                  </View>
                ) : m.image ? (
                  <Image source={{ uri: m.image }} style={styles.messageImage} resizeMode="cover" />
                ) : (
                  <Text style={[styles.messageText, m.sender === 'me' ? styles.meText : styles.themText]}>
                    {m.text}
                  </Text>
                )}
                <Text style={[styles.timeText, m.sender === 'me' ? styles.meTime : styles.themTime]}>
                  {m.time}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity 
            style={styles.cameraBtn} 
            onPress={pickImage}
            disabled={sending}
          >
            <Ionicons name="camera-outline" size={24} color="#666" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder={sending ? "Uploading..." : "Type a message..."}
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#999"
            editable={!sending}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, sending && { opacity: 0.5 }]} 
            onPress={() => sendMessage(message)}
            disabled={sending}
          >
            {sending ? <ActivityIndicator size="small" color="#FF8C00" /> : <Ionicons name="send" size={18} color="#FF8C00" />}
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
    borderColor: '#EFEFEF',
  },
  callBubble: { 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    minWidth: 200,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  callMessageContainer: { flexDirection: 'row', alignItems: 'center' },
  callMessageInfo: { marginLeft: 12, flex: 1 },
  callSubText: { fontSize: 12, marginTop: 2, opacity: 0.8 },

  messageText: { fontSize: 14, lineHeight: 20 },
  meText: { color: '#FFF' },
  themText: { color: '#333' },

  timeText: { fontSize: 10, alignSelf: 'flex-end', marginTop: 5 },
  meTime: { color: 'rgba(255,255,255,0.7)' },
  themTime: { color: '#999' },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 5,
  },
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
