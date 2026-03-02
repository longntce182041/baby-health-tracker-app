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
  TextInput,
  Alert,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getBabyById } from '../../api/babyApi';
import { getVaccinations } from '../../api/vaccinationApi';
import { getGrowthRecords } from '../../api/growthApi';
import { colors, typography } from '../../theme';

const { fontFamily } = typography;


const MINT_GREEN = '#B2E5E0';

const MOCK_NEXT_VACCINE = { name: 'Sởi - Quai bị - Rubella', date: '15/05/2026' };

function formatDate(str) {
  if (!str) return '—';
  try {
    const d = new Date(str);
    return isNaN(d.getTime()) ? str : d.toLocaleDateString('vi-VN');
  } catch {
    return str;
  }
}

function getAgeText(dateOfBirth) {
  if (!dateOfBirth) return '';
  const d = new Date(dateOfBirth);
  const now = new Date();
  let months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  if (now.getDate() < d.getDate()) months--;
  if (months < 12) return `${months} tháng tuổi`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} tuổi`;
  return `${years} tuổi ${remainingMonths} tháng`;
}

function getInitials(name) {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return words[words.length - 1][0].toUpperCase();
  return name[0].toUpperCase();
}

function getBloodTypeLabel(code) {
  if (code == null || code === '') return null;
  const n = typeof code === 'number' ? code : parseInt(String(code), 10);
  const map = { 1: 'A', 2: 'B', 3: 'O', 4: 'AB' };
  return (n >= 1 && n <= 4 && !Number.isNaN(n)) ? map[n] : null;
}

function AvatarCircle({ initial, color = colors.pinkLight }) {
  const letter = (initial || 'B').charAt(0).toUpperCase();
  return (
    <View style={[styles.avatar, { backgroundColor: color }]}>
      <Text style={styles.avatarText}>{letter}</Text>
    </View>
  );
}

export default function BabyDetailScreen({ route, navigation }) {
  const { id } = route.params || {};
  const insets = useSafeAreaInsets();
  const [baby, setBaby] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [growthRecords, setGrowthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parentNote, setParentNote] = useState('Bé là con đầu lòng!! Sinh sớm hơn dự kiến 3 ngày trộm vía bé rất khỏe mạnh.');
  const [qrVisible, setQrVisible] = useState(false);

  const loadDetail = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [babyRes, vaccRes, growthRes] = await Promise.all([
        getBabyById(id),
        getVaccinations(id),
        getGrowthRecords(id),
      ]);
      if (babyRes?.success && babyRes?.data) setBaby(babyRes.data);
      else setBaby(null);

      const vacc = vaccRes?.success && Array.isArray(vaccRes?.data) ? vaccRes.data : [];
      setVaccinations(vacc.length > 0 ? vacc : []);

      const growth = growthRes?.success && Array.isArray(growthRes?.data) ? growthRes.data : [];
      setGrowthRecords(growth.length > 0 ? growth : []);
    } catch (e) {
      setBaby(null);
      setVaccinations([]);
      setGrowthRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.pinkAccent} />
      </View>
    );
  }
  if (!baby) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Không tìm thấy thông tin bé</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const latestGrowth = growthRecords[growthRecords.length - 1];
  const lastMeasureDate = latestGrowth?.recorded_at
    ? (() => {
      try {
        const s = latestGrowth.recorded_at;
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
          const d = new Date(s);
          return isNaN(d.getTime()) ? null : d.toLocaleDateString('vi-VN');
        }
        return s;
      } catch {
        return null;
      }
    })()
    : null;

  const completedVacc = vaccinations.filter(
    (v) => v.status === 'completed' || v.vaccination_date
  ).length;
  const totalVacc = vaccinations.length || 1;
  const vaccPercent = totalVacc > 0 ? Math.round((completedVacc / totalVacc) * 100) : 0;
  const pendingCount = vaccinations.filter(
    (v) => v.status === 'pending' || (!v.vaccination_date && v.status !== 'completed')
  ).length;
  const nextVaccine = baby.next_vaccine || MOCK_NEXT_VACCINE;
  const isFemale = baby.gender?.toLowerCase?.() === 'nữ' || baby.gender?.toLowerCase?.() === 'female';

  return (
    <View style={styles.safe}>
      {Platform.OS === 'android' && <StatusBar backgroundColor="#F4ABB4" barStyle="light-content" />}
      <LinearGradient
        colors={['#F4ABB4', '#FED3DD']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.headerGrad, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hồ sơ bé</Text>
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
        style={styles.scrollContainer}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.profileTitleRow}>
            <Text style={styles.profileName} numberOfLines={1}>
              {baby.full_name || 'Chưa đặt tên'}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('BabyForm', { id, baby })}
              style={styles.editBtn}
            >
              <Ionicons name="pencil" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.profileRow}>
            <View style={styles.profileAvatarWrap}>
              {(baby.avt ?? baby.avatar) ? (
                <Image
                  source={typeof (baby.avt ?? baby.avatar) === 'number'
                    ? (baby.avt ?? baby.avatar)
                    : { uri: baby.avt ?? baby.avatar }}
                  style={styles.profileAvatarImage}
                  resizeMode="cover"
                />
              ) : (
                <AvatarCircle
                  initial={getInitials(baby.full_name)}
                  color={isFemale ? colors.pinkLight : colors.blueAccent + '40'}
                />
              )}
            </View>
            <View style={styles.profileMeta}>
              <View style={styles.metaRow}>
                <Ionicons name="person-outline" size={13} color={colors.pinkAccent} />
                <Text style={styles.metaText}>{baby.gender || '—'}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={13} color={colors.pinkAccent} />
                <Text style={styles.metaText}>{formatDate(baby.date_of_birth)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="heart-outline" size={13} color={colors.pinkAccent} />
                <Text style={[styles.metaText, styles.ageText]}>
                  {getAgeText(baby.date_of_birth) || '—'}
                </Text>
              </View>
              {(baby.blood_type != null && baby.blood_type !== 0 && getBloodTypeLabel(baby.blood_type)) && (
                <View style={styles.metaRow}>
                  <Ionicons name="water-outline" size={13} color={colors.pinkAccent} />
                  <Text style={styles.metaText}>Nhóm máu {getBloodTypeLabel(baby.blood_type)}</Text>
                </View>
              )}
            </View>
          </View>

          {baby.allergies && baby.allergies.length > 0 && (
            <View style={styles.allergiesSection}>
              <Text style={styles.allergiesLabel}>Dị ứng:</Text>
              <View style={styles.allergiesList}>
                {baby.allergies.map((allergy, i) => (
                  <View key={i} style={styles.allergyTag}>
                    <Text style={styles.allergyIcon}>⚠️</Text>
                    <Text style={styles.allergyText}>{allergy}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.section}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Main', { screen: 'VaccinationTab', params: { babyId: id } })}
        >
          <View style={styles.vaccineCard}>
            <View style={styles.vaccineCardHeader}>
              <Text style={styles.vaccineCardTitle}>Tổng quan tiêm chủng</Text>
              <Text style={styles.vaccinePercent}>{vaccPercent}%</Text>
            </View>
            <View style={styles.vaccineFlex}>
              <View style={styles.circleProgressWrap}>
                <View style={styles.circleProgressOuter}>
                  <View style={[styles.circleProgressHalf, styles.circleProgressPink, { width: (80 * vaccPercent) / 100 }]} />
                  <View style={[styles.circleProgressHalf, styles.circleProgressGray, { width: (80 * (100 - vaccPercent)) / 100 }]} />
                </View>
                <View style={styles.circleProgressInner}>
                  <Text style={styles.circleProgressText}>{completedVacc}/{totalVacc}</Text>
                </View>
              </View>
              <View style={styles.vaccineStats}>
                <Text style={styles.statItem}>
                  Đã hoàn thành: <Text style={styles.statItemBold}>{completedVacc} mũi</Text>
                </Text>
                <View style={styles.statItemBlock}>
                  <Text style={styles.statItem}>Sắp tới (30 ngày):</Text>
                  <Text style={[styles.statItemBold, styles.statItemBlue]}>{pendingCount} mũi</Text>
                </View>
              </View>
            </View>
            <View style={styles.nextVaccine}>
              <View style={styles.nextVaccineIconWrap}>
                <MaterialCommunityIcons name="needle" size={20} color={colors.pinkAccent} />
              </View>
              <View style={styles.nextVaccineInfo}>
                <Text style={styles.nextVaccineLabel}>Mũi tiếp theo</Text>
                <Text style={styles.nextVaccineName} numberOfLines={2}>{nextVaccine.name}</Text>
                <Text style={styles.nextVaccineDate}>Dự kiến {nextVaccine.date}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.section}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('GrowthChart', { babyId: id })}
        >
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Theo dõi tăng trưởng</Text>
            {lastMeasureDate ? (
              <Text style={styles.sectionDate}>Ngày đo: {lastMeasureDate}</Text>
            ) : null}
          </View>
          <View style={styles.grid}>
            <View style={styles.gridCard}>
              <View style={[styles.gridIconWrap, { backgroundColor: colors.blueAccent + '20' }]}>
                <MaterialCommunityIcons name="human-male-height" size={22} color={colors.blueAccent} />
              </View>
              <Text style={styles.gridValue}>
                {latestGrowth?.height ?? baby.height ?? '—'}
              </Text>
              <Text style={styles.gridLabel}>cm</Text>
            </View>
            <View style={styles.gridCard}>
              <View style={[styles.gridIconWrap, { backgroundColor: colors.pinkAccent + '30' }]}>
                <MaterialCommunityIcons name="scale-bathroom" size={22} color={colors.pinkAccent} />
              </View>
              <Text style={styles.gridValue}>
                {latestGrowth?.weight ?? baby.weight ?? '—'}
              </Text>
              <Text style={styles.gridLabel}>kg</Text>
            </View>
            <View style={styles.gridCard}>
              <View style={[styles.gridIconWrap, { backgroundColor: colors.green + '20' }]}>
                <Ionicons name="trending-up" size={22} color={colors.green} />
              </View>
              <Text style={styles.gridValue}>
                {latestGrowth?.head_size ?? latestGrowth?.head_circumference ?? '—'}
              </Text>
              <Text style={styles.gridLabel}>vòng đầu</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú của bố mẹ</Text>
          <TextInput
            style={styles.parentNoteInput}
            placeholder="Hôm nay bé có gì đặc biệt không bố mẹ nhỉ..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={parentNote}
            onChangeText={setParentNote}
          />
          <TouchableOpacity style={styles.parentNoteBtn} onPress={() => Alert.alert('Đã lưu', 'Kỷ niệm đã được lưu.')}>
            <Text style={styles.parentNoteBtnText}>Lưu kỷ niệm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={qrVisible} transparent animationType="fade">
        <Pressable style={styles.qrOverlay} onPress={() => setQrVisible(false)}>
          <View style={styles.qrCard}>
            <View style={styles.qrBox}>
              <Image
                source={require('../../../assets/images/QR.jpg')}
                style={{ width: 200, height: 200 }}
                resizeMode="contain"
              />
            </View>
          </View>
        </Pressable>
      </Modal>
    </View >
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
    marginTop: -50,
  },
  content: { paddingTop: 0 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyText: { color: colors.textSecondary, marginBottom: 16 },
  backBtn: {
    backgroundColor: colors.pinkAccent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backBtnText: { color: colors.white, fontWeight: '600' },
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

  headerGrad: {
    paddingBottom: 50,
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

  profileCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#D4A5AD',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: { elevation: 10 },
    }),
  },
  profileTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    fontFamily,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  editBtn: { padding: 4 },
  profileRow: { flexDirection: 'row', alignItems: 'flex-start' },
  profileAvatarWrap: { marginLeft: 12 },
  profileAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileMeta: { flex: 1, marginLeft: 40, marginRight: 18 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: colors.pinkAccent },
  profileInfo: { flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  metaText: { fontSize: 13, color: colors.textSecondary, marginLeft: 6 },
  ageText: { color: colors.green, fontWeight: '600' },

  allergiesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  allergiesLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
  allergiesList: { flexDirection: 'row', flexWrap: 'wrap' },
  allergyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 6,
  },
  allergyIcon: { fontSize: 12, marginRight: 4 },
  allergyText: { fontSize: 12, color: '#D97706', fontWeight: '600' },

  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 17, fontFamily, color: colors.text, marginBottom: 12, fontWeight: '700' },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  sectionDate: {
    fontSize: 12,
    fontFamily,
    color: colors.textMuted,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(244,171,180,0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitleIcon: { marginRight: 8 },
  cardTitle: { fontSize: 14, fontFamily, fontWeight: '600', color: colors.text },
  cardLink: { fontSize: 13, color: colors.pinkAccent, fontWeight: '600' },

  vaccineCard: {
    backgroundColor: colors.white,
    borderRadius: 25,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.pinkLight,
    ...Platform.select({
      ios: { shadowColor: colors.pinkAccent, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 25 },
      android: { elevation: 8 },
    }),
  },
  vaccineCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  vaccineCardTitle: {
    fontSize: 18,
    fontFamily,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  vaccinePercent: {
    fontSize: 17,
    fontFamily,
    fontWeight: '700',
    color: colors.blueAccent,
  },
  vaccineFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  circleProgressWrap: {
    width: 80,
    height: 80,
    position: 'relative',
    marginRight: 20,
  },
  circleProgressOuter: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  circleProgressHalf: {
    height: 80,
  },
  circleProgressPink: {
    backgroundColor: colors.pinkAccent,
    borderTopLeftRadius: 40,
    borderBottomLeftRadius: 40,
  },
  circleProgressGray: {
    backgroundColor: '#F0F0F0',
    borderTopRightRadius: 40,
    borderBottomRightRadius: 40,
  },
  circleProgressInner: {
    position: 'absolute',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: colors.white,
    left: 7.5,
    top: 7.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleProgressText: {
    fontSize: 14,
    fontFamily,
    fontWeight: '800',
    color: colors.pinkAccent,
  },
  vaccineStats: { flex: 1 },
  statItem: {
    fontSize: 13,
    fontFamily,
    color: '#888',
    marginBottom: 6,
  },
  statItemBlock: {
    marginBottom: 6,
  },
  statItemBold: {
    fontWeight: '700',
    color: colors.pinkAccent,
    fontSize: 12,
  },
  statItemBlue: { color: colors.blueAccent, fontSize: 12 },
  nextVaccine: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 250, 250, 0.6)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 18,
    borderWidth: 6,
    borderColor: 'rgba(244,171,180,0.2)',
  },
  nextVaccineIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextVaccineInfo: { flex: 1, marginLeft: 14 },
  nextVaccineLabel: {
    fontSize: 12,
    fontFamily,
    color: colors.textMuted,
    marginBottom: 4,
    fontWeight: '500',
  },
  nextVaccineName: {
    fontSize: 12,
    fontFamily,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  nextVaccineDate: {
    fontSize: 8,
    fontFamily,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCard: {
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244,171,180,0.2)',
  },
  gridIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridValue: {
    ...typography.H3,
    fontFamily,
    fontWeight: '700',
    color: colors.text,
  },
  gridLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2, textAlign: 'center', width: '100%', flexShrink: 0 },

  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244,171,180,0.2)',
  },
  emptyCardText: { color: colors.textMuted, marginBottom: 8 },

  noteItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  noteItemYellow: {
    backgroundColor: '#FFF9E6',
    borderLeftColor: '#FFD966',
  },
  noteItemMint: {
    backgroundColor: '#E6FFFA',
    borderLeftColor: MINT_GREEN,
  },
  noteItemText: { fontSize: 14, fontFamily, color: '#555', marginBottom: 4 },
  noteItemTime: { fontSize: 12, fontFamily, color: '#aaa' },

  healthCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(244,171,180,0.2)',
  },
  healthIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthContent: { flex: 1, marginLeft: 12 },
  healthTitle: { fontWeight: '600', color: colors.text },
  healthDesc: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  healthDate: { fontSize: 12, color: colors.textMuted, marginTop: 8 },

  parentNoteInput: {
    width: '100%',
    minHeight: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.pinkLight,
    borderRadius: 15,
    padding: 15,
    fontSize: 15,
    fontFamily,
    color: colors.text,
    textAlignVertical: 'top',
  },
  parentNoteBtn: {
    backgroundColor: colors.pinkAccent,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 15,
    ...Platform.select({
      ios: { shadowColor: colors.pinkAccent, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 15 },
      android: { elevation: 6 },
    }),
  },
  parentNoteBtnText: {
    fontSize: 16,
    fontFamily,
    fontWeight: '700',
    color: colors.white,
  },
});
