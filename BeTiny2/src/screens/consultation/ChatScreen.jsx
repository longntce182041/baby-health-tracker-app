import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';
import { useFocusEffect } from '@react-navigation/native';
import { io } from 'socket.io-client';
import {
  getConversation,
  sendMessageToDoctor,
} from '../../api/consultationApi';
import { SOCKET_URL } from '../../api/api';

const { fontFamily } = typography;

export default function ChatScreen({ route, navigation }) {
  const { doctor, doctorId } = route.params || {};
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationMissing, setConversationMissing] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [currentConsultationId, setCurrentConsultationId] = useState(null);
  const scrollViewRef = useRef(null);
  const socketRef = useRef(null);

  const mappedDoctorId = doctorId || doctor?._id || doctor?.doctor_id || doctor?.id;

  const doctorName = doctor?.full_name || 'Bác sĩ Nguyên';
  const displayName = doctorName.startsWith('Bác sĩ') ? doctorName : `BS. ${doctorName}`;
  const initial = (doctor?.full_name || 'B').charAt(0).toUpperCase();

  const toDisplayMessage = (item) => ({
    id: item?._id || `${item?.timestamp || Date.now()}-${Math.random()}`,
    from: item?.sender === 'doctor' ? 'dr' : 'user',
    text: item?.content || '',
    time: new Date(item?.timestamp || Date.now()).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  });

  const loadConversation = async (silent = false) => {
    if (!mappedDoctorId) {
      setLoading(false);
      setConversationMissing(true);
      return;
    }

    if (!silent) {
      setLoading(true);
    }
    try {
      const res = await getConversation(mappedDoctorId);
      const messageList = Array.isArray(res?.data?.messages)
        ? res.data.messages.map(toDisplayMessage)
        : [];

      setMessages(messageList);
      setCurrentConsultationId(res?.data?.consultation_id || null);
      setConversationMissing(false);
    } catch (error) {
      if (error?.response?.status === 404) {
        setConversationMissing(true);
        setMessages([]);
      } else {
        Alert.alert('Loi', 'Khong the tai tin nhan. Vui long thu lai.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadConversation();
  }, [mappedDoctorId]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !currentConsultationId) {
      return undefined;
    }

    socket.emit('join:consultation', currentConsultationId);

    const onIncomingMessage = (payload) => {
      if (payload?.consultation_id !== String(currentConsultationId)) {
        return;
      }
      if (payload?.conversation?.messages) {
        setMessages(payload.conversation.messages.map(toDisplayMessage));
      } else {
        loadConversation(true);
      }
    };

    socket.on('conversation:message', onIncomingMessage);

    return () => {
      socket.off('conversation:message', onIncomingMessage);
      socket.emit('leave:consultation', currentConsultationId);
    };
  }, [currentConsultationId]);

  useFocusEffect(
    React.useCallback(() => {
      if (!mappedDoctorId) return undefined;

      const pollId = setInterval(() => {
        if (!sending) {
          loadConversation(true);
        }
      }, 3000);

      return () => clearInterval(pollId);
    }, [mappedDoctorId, sending]),
  );

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event?.endCoordinates?.height || 0);
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 50);
    });

    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    if (!mappedDoctorId) {
      Alert.alert('Loi', 'Khong tim thay thong tin bac si.');
      return;
    }

    try {
      setSending(true);
      const content = inputText.trim();
      setInputText('');
      await sendMessageToDoctor(mappedDoctorId, content);
      await loadConversation();
    } catch (error) {
      const statusCode = error?.response?.status;
      const message = error?.response?.data?.message;
      if (statusCode === 404) {
        setConversationMissing(true);
        Alert.alert(
          'Chua the chat',
          'Ban can dat lich tu van truoc khi nhan tin voi bac si nay.',
        );
      } else {
        Alert.alert('Loi', message || 'Gui tin nhan that bai.');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={colors.white} barStyle="dark-content" />}
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <View style={[styles.chatHeader, { paddingTop: insets.top + 12, paddingBottom: 14 }]}>
          <View style={styles.drProfile}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
              <Ionicons name="chevron-back" size={24} color="#CCC" />
            </TouchableOpacity>
            <View style={styles.drAvatar}>
              <Text style={styles.drAvatarText}>{initial}</Text>
            </View>
            <View style={styles.drInfo}>
              <Text style={styles.drName} numberOfLines={1}>{displayName}</Text>
              <Text style={styles.drStatus}>● Đang trực tuyến</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionBtn} activeOpacity={0.7}>
              <Ionicons name="call-outline" size={22} color={colors.blueAccent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionBtn} activeOpacity={0.7}>
              <Ionicons name="videocam-outline" size={22} color={colors.blueAccent} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={[styles.chatContent, { paddingBottom: 16 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollToEnd({ animated: true });
            }
          }}
        >
          <View style={styles.datePill}>
            <Text style={styles.datePillText}>HÔM NAY</Text>
          </View>
          {loading && (
            <View style={styles.loadingInline}>
              <ActivityIndicator size="small" color={colors.pinkAccent} />
            </View>
          )}
          {!loading && conversationMissing && (
            <View style={styles.emptyStateBox}>
              <Text style={styles.emptyStateText}>
                Chua co cuoc tro chuyen. Hay dat lich tu van truoc de bat dau chat.
              </Text>
            </View>
          )}
          {!loading && !conversationMissing && messages.length === 0 && (
            <View style={styles.emptyStateBox}>
              <Text style={styles.emptyStateText}>
                Chua co tin nhan. Ban hay gui tin nhan dau tien.
              </Text>
            </View>
          )}
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[styles.msgBubble, msg.from === 'dr' ? styles.msgDr : styles.msgUser]}
            >
              <Text style={[styles.msgText, msg.from === 'user' && styles.msgTextUser]}>{msg.text}</Text>
              <Text style={[styles.msgTime, msg.from === 'user' && styles.msgTimeUser]}>{msg.time}</Text>
            </View>
          ))}
        </ScrollView>

        <View
          style={[
            styles.inputArea,
            {
              paddingBottom:
                insets.bottom +
                12 +
                (Platform.OS === 'android' ? keyboardHeight : 0),
            },
          ]}
        >
          <TouchableOpacity style={styles.attachBtn} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={28} color="#BBB" />
          </TouchableOpacity>
          <TextInput
            style={styles.inputBox}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
            onPress={sendMessage}
            activeOpacity={0.85}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={20} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboard: { flex: 1 },
  chatHeader: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 15 },
      android: { elevation: 4 },
    }),
  },
  drProfile: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
  backBtn: { padding: 4, marginRight: 4 },
  drAvatar: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: colors.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drAvatarText: { fontSize: 18, fontWeight: '700', color: colors.pinkAccent, fontFamily },
  drInfo: { marginLeft: 12, flex: 1, minWidth: 0 },
  drName: { fontSize: 15, fontFamily, fontWeight: '800', color: colors.text },
  drStatus: { fontSize: 12, fontFamily, fontWeight: '700', color: '#4CAF50', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerActionBtn: { padding: 6 },
  chatContainer: { flex: 1 },
  chatContent: { paddingHorizontal: 20, paddingTop: 20 },
  datePill: {
    alignSelf: 'center',
    backgroundColor: '#EEE',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  datePillText: { fontSize: 11, fontFamily, fontWeight: '600', color: '#AAA' },
  loadingInline: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateBox: {
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignSelf: 'center',
    maxWidth: '90%',
  },
  emptyStateText: {
    fontSize: 13,
    fontFamily,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  msgBubble: {
    maxWidth: '80%',
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 2, height: 5 }, shadowOpacity: 0.02, shadowRadius: 15 },
      android: { elevation: 2 },
    }),
  },
  msgDr: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  msgUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.pinkAccent,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 8,
    ...Platform.select({
      ios: { shadowColor: colors.pinkAccent, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 15 },
      android: { elevation: 4 },
    }),
  },
  msgText: { fontSize: 14, fontFamily, color: '#555', lineHeight: 22 },
  msgTextUser: { color: colors.white },
  msgTime: { fontSize: 11, fontFamily, color: colors.textMuted, marginTop: 6, textAlign: 'right' },
  msgTimeUser: { color: 'rgba(255,255,255,0.8)' },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.03, shadowRadius: 25 },
      android: { elevation: 8 },
    }),
  },
  attachBtn: { padding: 4, marginBottom: 6 },
  inputBox: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily,
    color: colors.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: colors.blueAccent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: colors.blueAccent, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  sendBtnDisabled: {
    opacity: 0.7,
  },
});
