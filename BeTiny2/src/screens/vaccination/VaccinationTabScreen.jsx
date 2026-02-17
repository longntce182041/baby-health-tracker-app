import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StatusBar,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getBabies } from '../../api/babyApi';
import { getVaccinations } from '../../api/vaccinationApi';
import { colors, typography } from '../../theme';

const { fontFamily } = typography;

function getAgeString(dateOfBirth) {
  if (!dateOfBirth) return '';
  const d = new Date(dateOfBirth);
  const now = new Date();
  let months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  if (now.getDate() < d.getDate()) months--;
  const years = Math.floor(months / 12);
  const monthsLeft = months % 12;
  if (years === 0) return `${monthsLeft} tháng`;
  if (monthsLeft === 0) return `${years} tuổi`;
  return `${years} tuổi ${monthsLeft} tháng`;
}

function formatDob(str) {
  if (!str) return '—';
  try {
    const d = new Date(str);
    return isNaN(d.getTime()) ? str : d.toLocaleDateString('vi-VN');
  } catch {
    return str;
  }
}

function getInitials(name) {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return words[words.length - 1][0].toUpperCase();
  return name[0].toUpperCase();
}

const MOCK_UPCOMING = [
  { id: '1', day: 10, monthAbbr: 'TH09', name: '6 trong 1 (Mũi 1)', desc: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, Viêm gan B...', warning: true },
  { id: '2', day: 25, monthAbbr: 'TH10', name: 'Phế cầu khuẩn (Mũi 2)', desc: 'Phòng các bệnh do phế cầu như viêm phổi, viêm màng não.', warning: false },
  { id: '3', day: 5, monthAbbr: 'TH11', name: 'Sởi - Quai bị - Rubella (Mũi 1)', desc: 'Phòng bệnh sởi, quai bị, rubella.', warning: false },
];

const QUICK_MENU = [
  { key: 'catalog', label: 'Danh mục', icon: 'format-list-checks', lib: MaterialCommunityIcons },
  { key: 'journal', label: 'Nhật ký tiêm', icon: 'book-open', lib: MaterialCommunityIcons },
  { key: 'notes', label: 'Lưu ý khi tiêm', icon: 'shield-check', lib: MaterialCommunityIcons },
  { key: 'places', label: 'Điểm tiêm', icon: 'hospital-building', lib: MaterialCommunityIcons },
];

export default function VaccinationTabScreen({ navigation, route }) {
  const { isLoggedIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [babies, setBabies] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [upcoming, setUpcoming] = useState(MOCK_UPCOMING);
  const [loading, setLoading] = useState(true);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const initialBabyId = route?.params?.babyId;

  const baby = babies[selectedIndex] || null;

  useEffect(() => {
    const fetch = async () => {
      if (!isLoggedIn) {
        setBabies([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await getBabies();
        const list = Array.isArray(res?.data) ? res.data : [];
        setBabies(list);
        if (initialBabyId && list.length > 0) {
          const idx = list.findIndex(
            (b) => String(b.baby_id) === String(initialBabyId) || String(b.id) === String(initialBabyId)
          );
          if (idx >= 0) setSelectedIndex(idx);
        }
      } catch (err) {
        console.error('VaccinationTab getBabies:', err);
        setBabies([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isLoggedIn, initialBabyId]);

  useEffect(() => {
    if (!baby?.baby_id && !baby?.id) {
      setUpcoming(MOCK_UPCOMING);
      return;
    }
    const id = baby.baby_id || baby.id;
    const fetch = async () => {
      try {
        const res = await getVaccinations(id);
        const data = res?.data ?? (Array.isArray(res) ? res : []);
        if (data.length > 0) {
          const mapped = data.slice(0, 5).map((v, i) => ({
            id: v.vaccination_id || v.id || String(i),
            day: v.scheduled_day || (v.vaccination_date ? new Date(v.vaccination_date).getDate() : 10 + i * 5),
            monthAbbr: v.scheduled_month_abbr || (v.vaccination_date ? `TH${String(new Date(v.vaccination_date).getMonth() + 1).padStart(2, '0')}` : 'TH09'),
            name: v.vaccine_name || v.name || 'Tiêm chủng',
            desc: v.description || v.note || '',
            warning: !!v.urgent,
          }));
          setUpcoming(mapped);
        } else {
          setUpcoming(MOCK_UPCOMING);
        }
      } catch (err) {
        console.error('VaccinationTab getVaccinations:', err);
        setUpcoming(MOCK_UPCOMING);
      }
    };
    fetch();
  }, [baby?.baby_id, baby?.id]);

  if (!isLoggedIn) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>Vui lòng đăng nhập để xem tiêm chủng</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.btnText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.pinkAccent} />
      </View>
    );
  }

  const hasBabies = babies.length > 0;

  return (
    <View style={styles.container}>
      {Platform.OS === 'android' && <StatusBar backgroundColor="#F4ABB4" barStyle="light-content" />}
      <LinearGradient
        colors={['#F4ABB4', '#FED3DD']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.headerGrad, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('HomeTab')} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sổ tiêm chủng</Text>
          <TouchableOpacity
            style={styles.headerBtn}
            activeOpacity={0.7}
            onPress={() => setQrVisible(true)}
          >
            <Ionicons name="qr-code-outline" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={[styles.scroll, { marginTop: -38 }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {!hasBabies ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyTitle}>Chưa có hồ sơ bé</Text>
            <Text style={styles.hint}>Thêm bé ở mục Sức khỏe hoặc Trang chủ để xem lịch tiêm chủng.</Text>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => navigation.navigate('HealthTab')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>Đến Sức khỏe</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={() => navigation.navigate('HomeTab')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnTextSecondary}>Về Trang chủ</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.hero}
              onPress={() => setPickerVisible(true)}
              activeOpacity={0.95}
            >
              <View style={styles.babyAvatarWrap}>
                <View style={styles.babyImg}>
                  {(baby?.avt ?? baby?.avatar ?? baby?.avatar_url) ? (
                    <Image
                      source={
                        typeof (baby?.avt ?? baby?.avatar ?? baby?.avatar_url) === 'number'
                          ? (baby.avt ?? baby.avatar ?? baby.avatar_url)
                          : { uri: baby.avt ?? baby.avatar ?? baby.avatar_url }
                      }
                      style={styles.babyImgPhoto}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.babyInitial}>{getInitials(baby?.full_name)}</Text>
                  )}
                </View>
              </View>
              <Text style={styles.babyName} numberOfLines={1}>{baby?.full_name || 'Bé'}</Text>
              <Text style={styles.babyDob}>Sinh ngày: {formatDob(baby?.date_of_birth)}</Text>
            </TouchableOpacity>

            <View style={styles.quickMenu}>
              {QUICK_MENU.map((item) => {
                const Icon = item.lib;
                const babyId = baby?.baby_id || baby?.id;
                const onPress =
                  item.key === 'journal'
                    ? () => navigation.navigate('VaccinationSchedule', { babyId })
                    : item.key === 'catalog'
                      ? () => navigation.navigate('VaccinationCatalog', { babyId })
                      : item.key === 'notes'
                        ? () => navigation.navigate('VaccinationNotes')
                        : item.key === 'places'
                          ? () => navigation.navigate('VaccinationNotes')
                          : undefined;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.menuItem}
                    activeOpacity={0.8}
                    onPress={onPress}
                  >
                    <Icon name={item.icon} size={22} color={colors.pinkAccent} />
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.beforeAfterWrap}>
              <TouchableOpacity
                style={styles.beforeAfterCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('VaccinationGuide')}
              >
                <Ionicons name="document-text-outline" size={20} color={colors.pinkAccent} style={styles.beforeAfterIcon} />
                <Text style={styles.beforeAfterTitle}>Những điều cần trước và sau tiêm</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeline}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="calendar" size={18} color={colors.pinkAccent} />
                <Text style={styles.sectionTitle}>Lịch tiêm sắp tới</Text>
              </View>
              {upcoming.map((v) => (
                <View
                  key={v.id}
                  style={[styles.vaccineCard, v.warning && styles.vaccineCardWarning]}
                >
                  <View style={styles.dateBox}>
                    <Text style={styles.dateBoxDay}>{v.day}</Text>
                    <Text style={styles.dateBoxMonth}>{v.monthAbbr}</Text>
                  </View>
                  <View style={styles.vaccineInfo}>
                    <Text style={styles.vaccineName}>{v.name}</Text>
                    <Text style={styles.vaccineDesc} numberOfLines={2}>{v.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <Modal visible={qrVisible} transparent animationType="fade">
        <Pressable style={styles.qrOverlay} onPress={() => setQrVisible(false)}>
          <View style={styles.qrCard}>
            <View style={styles.qrBox}>
              <Ionicons name="qr-code-outline" size={180} color={colors.text} />
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={pickerVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setPickerVisible(false)}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Chọn bé</Text>
            <ScrollView
              style={styles.pickerScroll}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              {babies.map((b, i) => {
                const avatarSrc = b.avt ?? b.avatar ?? b.avatar_url;
                return (
                  <TouchableOpacity
                    key={b.baby_id || b.id}
                    style={styles.pickerRow}
                    onPress={() => { setSelectedIndex(i); setPickerVisible(false); }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.pickerRowAvatar}>
                      {avatarSrc ? (
                        <Image
                          source={typeof avatarSrc === 'string' ? { uri: avatarSrc } : avatarSrc}
                          style={styles.pickerRowAvatarImg}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={styles.pickerRowAvatarText}>{getInitials(b.full_name)}</Text>
                      )}
                    </View>
                    <View style={styles.pickerRowText}>
                      <Text style={styles.pickerName}>{b.full_name || 'Bé'}</Text>
                      <Text style={styles.pickerMeta}>{getAgeString(b.date_of_birth)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.pickerCancel} onPress={() => setPickerVisible(false)}>
              <Text style={styles.pickerCancelText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hint: { ...typography.P, fontFamily, color: colors.textSecondary, marginBottom: 16, textAlign: 'center' },
  btn: { backgroundColor: colors.pinkAccent, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  btnText: { ...typography.P, fontFamily, color: colors.white, fontWeight: '600' },
  btnSecondary: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.pinkAccent, marginTop: 12 },
  btnTextSecondary: { ...typography.P, fontFamily, color: colors.pinkAccent, fontWeight: '600' },

  emptyBlock: {
    marginTop: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: colors.white,
    borderRadius: 20,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 18, fontFamily, fontWeight: '700', color: colors.text, marginBottom: 12 },

  headerGrad: {
    paddingBottom: 44,
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
  headerTitle: {
    ...typography.H3,
    fontFamily,
    color: colors.white,
    fontWeight: '600',
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },

  hero: {
    backgroundColor: colors.white,
    marginHorizontal: 0,
    marginTop: 16,
    marginBottom: 4,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#D4A5AD', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 16 },
      android: { elevation: 6 },
    }),
  },
  babyAvatarWrap: { position: 'relative', alignItems: 'center' },
  babyImg: {
    width: 85,
    height: 85,
    borderRadius: 25,
    backgroundColor: colors.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
    overflow: 'hidden',
  },
  babyImgPhoto: {
    width: 79,
    height: 79,
    borderRadius: 22,
  },
  babyInitial: { fontSize: 28, fontWeight: '700', color: colors.pinkAccent, fontFamily },
  babyName: {
    marginTop: 18,
    fontSize: 18,
    fontFamily,
    fontWeight: '700',
    color: colors.text,
  },
  babyDob: { marginTop: 4, fontSize: 13, fontFamily, color: colors.textMuted },

  quickMenu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  menuItem: {
    width: '48%',
    backgroundColor: colors.white,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 12,
    minHeight: 72,
    ...Platform.select({
      ios: { shadowColor: '#c41212', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  menuItemLabel: { fontSize: 12, fontWeight: '700', color: '#666', fontFamily, marginTop: 6, textAlign: 'center' },

  beforeAfterWrap: {
    alignItems: 'stretch',
    marginTop: 0,
    marginBottom: 8,
    marginHorizontal: 0,
  },
  beforeAfterWrapSecond: { marginTop: 0 },
  beforeAfterCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  beforeAfterIcon: { marginBottom: 6 },
  beforeAfterTitle: {
    fontSize: 12,
    fontFamily,
    fontWeight: '700',
    color: '#666',
    textAlign: 'center',
  },
  beforeAfterHint: {
    fontSize: 12,
    fontFamily,
    color: '#999',
    marginTop: 0,
    textAlign: 'center',
  },

  qrOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCard: {
    width: 220,
    height: 220,
    backgroundColor: colors.white,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20 },
      android: { elevation: 10 },
    }),
  },
  qrBox: {
    width: 200,
    height: 200,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  timeline: { marginTop: 8, paddingBottom: 24 },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', fontFamily, color: colors.text },
  vaccineCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 25,
    padding: 18,
    marginBottom: 15,
    borderLeftWidth: 6,
    borderLeftColor: colors.blueAccent,
    alignItems: 'flex-start',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  vaccineCardWarning: { borderLeftColor: '#FF9800' },
  dateBox: {
    backgroundColor: colors.background,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 56,
    alignItems: 'center',
    marginRight: 15,
  },
  dateBoxDay: { fontSize: 18, fontWeight: '700', color: colors.pinkAccent, fontFamily },
  dateBoxMonth: { fontSize: 11, fontWeight: '700', color: '#AAA', fontFamily, marginTop: 2 },
  vaccineInfo: { flex: 1 },
  vaccineName: { fontSize: 15, fontWeight: '700', fontFamily, color: colors.text, marginBottom: 4 },
  vaccineDesc: { fontSize: 12, color: colors.textMuted, lineHeight: 18, fontFamily },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pickerCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    maxHeight: '80%',
  },
  pickerTitle: { fontSize: 18, fontWeight: '700', fontFamily, color: colors.text, marginBottom: 16 },
  pickerScroll: {
    maxHeight: 280,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerRowAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pickerRowAvatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  pickerRowAvatarText: { fontSize: 16, fontWeight: '700', color: colors.pinkAccent, fontFamily },
  pickerRowText: { flex: 1 },
  pickerName: { fontSize: 16, fontFamily, color: colors.text, fontWeight: '600' },
  pickerMeta: { fontSize: 13, fontFamily, color: colors.textMuted, marginTop: 4 },
  pickerCancel: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pickerCancelText: { fontSize: 15, fontFamily, color: colors.pinkAccent, fontWeight: '600' },
});
