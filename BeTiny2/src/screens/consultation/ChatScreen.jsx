import React, { useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';

const { fontFamily } = typography;

const MOCK_MESSAGES = [
  { id: '1', from: 'dr', text: 'Bé hôm nay thế nào rồi ạ? Mẹ có thấy bé sốt thêm không?', time: '09:30' },
  { id: '2', from: 'user', text: 'Chào bác sĩ, bé ăn khỏe lắm ạ! Nhưng em thấy trên người bé có vài nốt mẩn đỏ.', time: '09:32' },
  { id: '3', from: 'dr', text: 'Mẹ chụp ảnh vùng da bị mẩn đỏ gửi bác xem nhé!', time: '09:33' },
];

export default function ChatScreen({ route, navigation }) {
  const { doctor } = route.params || {};
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');

  const doctorName = doctor?.full_name || 'Bác sĩ Nguyên';
  const displayName = doctorName.startsWith('Bác sĩ') ? doctorName : `BS. ${doctorName}`;
  const initial = (doctor?.full_name || 'B').charAt(0).toUpperCase();

  const sendMessage = () => {
    if (!inputText.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), from: 'user', text: inputText.trim(), time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setInputText('');
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={colors.white} barStyle="dark-content" />}
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
          style={styles.chatContainer}
          contentContainerStyle={[styles.chatContent, { paddingBottom: 16 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.datePill}>
            <Text style={styles.datePillText}>HÔM NAY</Text>
          </View>
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

        <View style={[styles.inputArea, { paddingBottom: insets.bottom + 12 }]}>
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
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} activeOpacity={0.85}>
            <Ionicons name="send" size={20} color={colors.white} />
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
});
