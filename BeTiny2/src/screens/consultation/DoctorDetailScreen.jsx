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
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getDoctorById, getDoctorSchedules } from '../../api/doctorApi';
import { useAuth } from '../../context/AuthContext';
import { colors, typography } from '../../theme';

const { fontFamily } = typography;

function formatDate(str) {
  if (!str) return '—';
  try {
    const d = new Date(str);
    return isNaN(d.getTime()) ? str : d.toLocaleDateString('vi-VN');
  } catch {
    return str;
  }
}

function getDayName(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  return days[d.getDay()];
}

export default function DoctorDetailScreen({ route, navigation }) {
  const { id, doctor: doctorParam } = route.params || {};
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(doctorParam || null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(!!id && !doctorParam);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setDoctor(doctorParam || null);
    (async () => {
      if (!doctorParam) setLoading(true);
      try {
        const [docRes, schRes] = await Promise.all([
          getDoctorById(id),
          getDoctorSchedules(id).catch(() => ({ success: false, data: [] })),
        ]);
        const doc = docRes?.success && docRes?.data ? docRes.data : doctorParam || null;
        setDoctor(doc);
        const scheduleFromApi = schRes?.success && Array.isArray(schRes?.data) ? schRes.data : [];
        const scheduleNested = doc && Array.isArray(doc.schedules) ? doc.schedules : [];
        setSchedules(scheduleFromApi.length > 0 ? scheduleFromApi : scheduleNested);
      } catch (e) {
        if (doctorParam) {
          setDoctor(doctorParam);
          setSchedules(Array.isArray(doctorParam.schedules) ? doctorParam.schedules : []);
        } else {
          setDoctor(null);
          setSchedules([]);
        }
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.pinkAccent} />
      </View>
    );
  }
  if (!doctor) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Không tìm thấy bác sĩ</Text>
      </View>
    );
  }

  const experienceText =
    typeof doctor.experience === 'string' && doctor.experience.trim()
      ? doctor.experience.trim()
      : 'Chưa cập nhật';
  const ratingValue = doctor.rating ?? doctor.avg_rating;
  const ratingDisplay = ratingValue != null && ratingValue !== '' ? ratingValue : 'Chưa cập nhật';
  const hasFee = doctor.consultation_fee != null && doctor.consultation_fee !== '';
  const consultationFeeDisplay =
    hasFee && Number(doctor.consultation_fee) >= 0
      ? `${doctor.consultation_fee} Điểm`
      : 'Chưa cập nhật';
  const hasSchedules = Array.isArray(schedules) && schedules.length > 0;
  const scheduleList = hasSchedules
    ? schedules.slice(0, 7).map((s) => ({
      day: getDayName(s.available_date),
      time: s.time_slot || '—',
    }))
    : [{ day: '—', time: 'Chưa có lịch' }];
  const canBook = hasFee && hasSchedules;

  const initial = (doctor.full_name && doctor.full_name.trim()) ? doctor.full_name.trim().charAt(0).toUpperCase() : '?';
  const heroName = (doctor.full_name && doctor.full_name.trim()) ? doctor.full_name.trim() : 'Chưa cập nhật';
  const specialtyDisplay = (doctor.specialty && doctor.specialty.trim()) ? doctor.specialty.trim() : 'Chưa cập nhật';

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
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bác sĩ</Text>
          <TouchableOpacity
            style={styles.pointsPill}
            onPress={() => navigation.navigate('TopUpPoints')}
            activeOpacity={0.8}
          >
            <Text style={styles.pointsPillText}>{user?.wallet_point ?? 0}</Text>
            <Ionicons name="add" size={14} color={colors.white} style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.heroAvatar}>
              {(doctor.avatar_url ?? doctor.avatar) ? (
                <Image
                  source={
                    typeof (doctor.avatar_url ?? doctor.avatar) === 'number'
                      ? (doctor.avatar_url ?? doctor.avatar)
                      : { uri: doctor.avatar_url ?? doctor.avatar }
                  }
                  style={styles.heroAvatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.heroAvatarText}>{initial}</Text>
              )}
            </View>
            <View style={styles.ratingChip}>
              {ratingValue != null && ratingValue !== '' && <Ionicons name="star" size={12} color="#745E00" />}
              <Text style={[styles.ratingChipText, ratingValue == null || ratingValue === '' ? styles.ratingChipTextMuted : null]}>{ratingDisplay}</Text>
            </View>
          </View>
          <Text style={styles.heroName}>{heroName}</Text>
          <View style={styles.specialtyTag}>
            <Text style={styles.specialtyTagText}>{specialtyDisplay}</Text>
          </View>
        </View>

        <View style={styles.contentArea}>
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Ionicons name="ribbon-outline" size={18} color={colors.pinkAccent} />
              <Text style={styles.sectionHeaderText}>Kinh nghiệm</Text>
            </View>
            <Text style={styles.sectionContent}>{experienceText}</Text>
          </View>

          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={18} color={colors.pinkAccent} />
              <Text style={styles.sectionHeaderText}>Lịch tư vấn tuần này</Text>
            </View>
            {scheduleList.map((item, idx) => (
              <View key={idx} style={styles.scheduleRow}>
                <Text style={styles.scheduleDay}>{item.day}</Text>
                <Text style={styles.scheduleTime}>{item.time || 'Nghỉ'}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {(doctor.is_consulting === true || doctor.status === 'busy' || doctor.status === 'consulting') && (
        <TouchableOpacity
          style={[styles.chatFab, { bottom: (insets.bottom || 16) + 100 }]}
          onPress={() => navigation.navigate('Chat', { doctorId: id, doctor })}
          activeOpacity={0.9}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={26} color={colors.pinkAccent} />
        </TouchableOpacity>
      )}

      <View style={[styles.bookingBar, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.feeWrap}>
          <Text style={styles.feeWrapLabel}>PHÍ TƯ VẤN</Text>
          <Text style={[styles.feeWrapValue, !hasFee && styles.feeWrapValueMuted]}>{consultationFeeDisplay}</Text>
        </View>
        <TouchableOpacity
          style={[styles.btnMain, !canBook && styles.btnMainDisabled]}
          onPress={() => canBook && navigation.navigate('Consultation', { doctorId: id, doctor })}
          activeOpacity={0.85}
          disabled={!canBook}
        >
          <Text style={[styles.btnMainText, !canBook && styles.btnMainTextDisabled]}>Đặt lịch ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  emptyText: { fontSize: 16, color: colors.textSecondary },
  headerGrad: {
    paddingBottom: 56,
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
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  pointsPillText: { fontSize: 13, fontFamily, fontWeight: '700', color: colors.white },
  scrollContainer: {
    flex: 1,
    marginTop: -50,
  },
  content: { paddingTop: 0, paddingHorizontal: 0 },
  heroCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 35,
    padding: 25,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#F4ABB4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 6 },
    }),
  },
  avatarContainer: { position: 'relative', alignItems: 'center' },
  heroAvatar: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: colors.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.background,
    overflow: 'hidden',
  },
  heroAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 30,
  },
  heroAvatarText: { fontSize: 36, fontWeight: '700', color: colors.pinkAccent, fontFamily },
  ratingChip: {
    position: 'absolute',
    bottom: -8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFD93D',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  ratingChipText: { fontSize: 12, fontFamily, fontWeight: '800', color: '#745E00' },
  ratingChipTextMuted: { color: colors.textMuted, fontWeight: '600' },
  heroName: {
    fontSize: 20,
    fontFamily,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  specialtyTag: {
    backgroundColor: '#F0F7FD',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  specialtyTagText: { fontSize: 14, fontFamily, fontWeight: '700', color: colors.blueAccent },
  contentArea: { paddingHorizontal: 16, paddingBottom: 24 },
  sectionBox: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 25,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionHeaderText: {
    fontSize: 15,
    fontFamily,
    fontWeight: '800',
    color: colors.pinkAccent,
  },
  sectionContent: {
    fontSize: 14,
    fontFamily,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  scheduleDay: { fontSize: 14, fontFamily, color: colors.text },
  scheduleTime: { fontSize: 14, fontFamily, color: colors.textSecondary },
  bookingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: 25,
    paddingTop: 18,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 20 },
      android: { elevation: 12 },
    }),
  },
  feeWrap: {},
  feeWrapLabel: { fontSize: 11, fontFamily, fontWeight: '700', color: colors.textMuted },
  feeWrapValue: { fontSize: 20, fontFamily, fontWeight: '800', color: colors.pinkAccent, marginTop: 2 },
  feeWrapValueMuted: { color: colors.textMuted, fontWeight: '600' },
  chatFab: {
    position: 'absolute',
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 },
      android: { elevation: 6 },
    }),
  },
  btnMainDisabled: { backgroundColor: '#D0D0D0', opacity: 0.9 },
  btnMain: {
    borderRadius: 20,
    backgroundColor: colors.pinkAccent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: colors.pinkAccent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  btnMainText: { fontSize: 14, fontFamily, fontWeight: '700', color: colors.white },
  btnMainTextDisabled: { color: colors.textMuted },
});
