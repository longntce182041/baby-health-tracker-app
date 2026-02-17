import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';

const { fontFamily } = typography;

const NOTES = [
  {
    id: '1',
    title: 'Không tiêm khi sốt',
    detail: 'Tạm hoãn tiêm nếu bé có dấu hiệu sốt mẹ nhé.',
    bg: '#E1F5FE',
    iconColor: '#039BE5',
    icon: 'sad-outline',
  },
  {
    id: '2',
    title: 'Mang đầy đủ hồ sơ',
    detail: 'Sổ tiêm và giấy khám sức khỏe rất quan trọng.',
    bg: '#E8F5E9',
    iconColor: '#43A047',
    icon: 'folder-open-outline',
  },
  {
    id: '3',
    title: 'Kiểm tra lịch tiêm',
    detail: 'Tránh tiêm trùng hoặc quá gần mũi trước.',
    bg: '#FFFDE7',
    iconColor: '#FBC02D',
    icon: 'calendar-outline',
  },
  {
    id: '4',
    title: 'Đúng lịch, đủ mũi',
    detail: 'Giúp vắc-xin đạt hiệu quả bảo vệ tốt nhất.',
    bg: '#FFF3E0',
    iconColor: '#FB8C00',
    icon: 'time-outline',
  },
  {
    id: '5',
    title: 'Thông tin vắc-xin',
    detail: 'Tìm hiểu kỹ về loại vắc-xin bé sẽ tiêm.',
    bg: '#FCE4EC',
    iconColor: '#E91E63',
    icon: 'book-outline',
  },
];

export default function VaccinationNotesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const bgApp = '#FFFDFD';

  return (
    <View style={[styles.container, { backgroundColor: bgApp }]}>
      {Platform.OS === 'android' && <StatusBar backgroundColor="#F4ABB4" barStyle="light-content" />}
      <LinearGradient
        colors={['#F4ABB4', '#FED3DD']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.headerGrad, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lưu ý khi tiêm chủng</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.headerSubtitle}>Mẹ hãy kiểm tra kỹ trước khi đi nhé!</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.noteList, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {NOTES.map((note) => (
          <View key={note.id} style={[styles.noteItem, { backgroundColor: note.bg }]}>
            <View style={styles.iconBox}>
              <Ionicons name={note.icon} size={26} color={note.iconColor} />
            </View>
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.noteDetail}>{note.detail}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGrad: {
    paddingBottom: 36,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...typography.H3, fontFamily, color: colors.white, fontWeight: '600' },
  headerSpacer: { width: 40, height: 40 },
  headerSubtitle: {
    fontSize: 11,
    fontFamily,
    color: 'rgba(255,255,255,0.95)',
    marginTop: 6,
    marginLeft: 40,
  },

  scroll: { flex: 1 },
  noteList: { paddingHorizontal: 20, paddingTop: 20 },

  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginBottom: 18,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.02, shadowRadius: 20 },
      android: { elevation: 2 },
    }),
  },
  iconBox: {
    width: 55,
    height: 55,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.03, shadowRadius: 15 },
      android: { elevation: 2 },
    }),
  },
  noteContent: { flex: 1 },
  noteTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily,
    color: '#333333',
    marginBottom: 4,
  },
  noteDetail: {
    fontSize: 13,
    fontFamily,
    color: '#777777',
    lineHeight: 20,
  },
});
