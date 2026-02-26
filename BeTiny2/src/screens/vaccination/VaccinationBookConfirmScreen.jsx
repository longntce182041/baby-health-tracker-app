import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Image,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';
import { getBabyById } from '../../api/babyApi';
import { createVaccineSchedule } from '../../api/vaccinationApi';

const { fontFamily } = typography;

const DAY_NAMES = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const TIME_SLOTS = ['08:00', '09:00', '10:00', '13:00', '14:00', '15:00'];

function getDaysInMonth(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const firstDayOfWeek = first.getDay();
  const daysCount = last.getDate();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const result = [];
  for (let i = 0; i < startOffset; i++) result.push(null);
  for (let d = 1; d <= daysCount; d++) result.push(d);
  const remainder = Math.ceil((result.length) / 7) * 7 - result.length;
  for (let i = 0; i < remainder; i++) result.push(null);
  return result;
}

function getAgeString(dateOfBirth) {
  if (!dateOfBirth) return '';
  const d = new Date(dateOfBirth);
  const now = new Date();
  let months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  if (now.getDate() < d.getDate()) months--;
  const years = Math.floor(months / 12);
  const monthsLeft = months % 12;
  if (years === 0) return `${monthsLeft} tháng tuổi`;
  if (monthsLeft === 0) return `${years} tuổi`;
  return `${years} tuổi ${monthsLeft} tháng`;
}

export default function VaccinationBookConfirmScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const {
    vaccineName = 'Viêm gan B',
    vaccineId,
    centerId,
    centerName = 'Phòng khám A',
    centerAddress,
    babyId,
    babyName = 'Bé Mỡ',
    babyDob,
    babyAvatar,
    fee = '850,000 VND',
  } = route.params || {};

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(15);
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [baby, setBaby] = useState(null);
  const [loadingBaby, setLoadingBaby] = useState(!!babyId);

  const daysGrid = useMemo(
    () => getDaysInMonth(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  useEffect(() => {
    if (!babyId) return;
    (async () => {
      try {
        setLoadingBaby(true);
        const res = await getBabyById(babyId);
        if (res?.success && res?.data) {
          setBaby(res.data);
        }
      } catch (e) {
      } finally {
        setLoadingBaby(false);
      }
    })();
  }, [babyId]);

  const displayBabyName = baby?.full_name || baby?.name || baby?.fullName || babyName;
  const displayBabyDob = baby?.date_of_birth || baby?.dob || babyDob;
  const rawAvatar = baby?.avt ?? baby?.avatar ?? baby?.avatar_url ?? babyAvatar;
  const isAvatarUri = typeof rawAvatar === 'string' && rawAvatar.trim().length > 0;
  const isAvatarLocal = typeof rawAvatar === 'number';

  const goPrevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev <= 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const goNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev >= 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const goPrevYear = () => setCurrentYear((y) => y - 1);
  const goNextYear = () => setCurrentYear((y) => y + 1);

  const summaryDateStr = useMemo(() => {
    const d = selectedDay;
    const m = currentMonth + 1;
    return `${d}/${m}/${currentYear} - ${selectedTime}`;
  }, [selectedDay, currentMonth, currentYear, selectedTime]);

  const ageStr = displayBabyDob ? getAgeString(displayBabyDob) : '6 tháng tuổi';
  const [qrVisible, setQrVisible] = useState(false);

  const buildInjectionDate = () => {
    try {
      const [hStr, mStr] = String(selectedTime || '08:00').split(':');
      const h = Number.isNaN(parseInt(hStr, 10)) ? 8 : parseInt(hStr, 10);
      const m = Number.isNaN(parseInt(mStr, 10)) ? 0 : parseInt(mStr, 10);
      const d = selectedDay || now.getDate();
      const jsDate = new Date(currentYear, currentMonth, d, h, m, 0);
      return jsDate.toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  const handleConfirm = async () => {
    if (!babyId || !vaccineId) {
      Alert.alert('Lỗi', 'Thiếu thông tin bé hoặc vắc xin, không thể đặt lịch.');
      return;
    }
    try {
      const payload = {
        baby_id: babyId,
        vaccine_id: vaccineId,
        injection_date: buildInjectionDate(),
        location: centerAddress || centerName || '',
      };
      const res = await createVaccineSchedule(payload);
      if (!res?.success) {
        Alert.alert('Lỗi', res?.message || 'Không thể đặt lịch tiêm, vui lòng thử lại.');
        return;
      }
      Alert.alert('Thành công', 'Đặt lịch tiêm chủng thành công.', [
        { text: 'Đóng', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Lỗi', e?.message || 'Không thể đặt lịch tiêm, vui lòng thử lại sau.');
    }
  };

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
          <Text style={styles.headerTitle}>Đặt lịch tiêm chủng</Text>
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
        style={[styles.scroll, { marginTop: -36 }]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          {isAvatarUri ? (
            <Image source={{ uri: rawAvatar }} style={styles.profileImg} />
          ) : isAvatarLocal ? (
            <Image source={rawAvatar} style={styles.profileImg} />
          ) : (
            <View style={styles.profileImgPlaceholder}>
              <Ionicons name="person" size={28} color={colors.pinkAccent} />
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayBabyName}</Text>
            <Text style={styles.profileAge}>{ageStr}</Text>
          </View>
        </View>

        <View style={styles.selectionCard}>
          <Text style={styles.sectionTitle}>CHỌN NGÀY & GIỜ</Text>
          <View style={styles.monthYearRow}>
            <View style={styles.yearRow}>
              <TouchableOpacity style={styles.navBtnSmall} onPress={goPrevYear} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={16} color={colors.textMuted} />
              </TouchableOpacity>
              <Text style={styles.yearText}>{currentYear}</Text>
              <TouchableOpacity style={styles.navBtnSmall} onPress={goNextYear} activeOpacity={0.7}>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <View style={styles.monthRow}>
              <TouchableOpacity style={styles.navBtn} onPress={goPrevMonth} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={22} color={colors.pinkAccent} />
              </TouchableOpacity>
              <Text style={styles.monthText}>Tháng {currentMonth + 1}</Text>
              <TouchableOpacity style={styles.navBtn} onPress={goNextMonth} activeOpacity={0.7}>
                <Ionicons name="chevron-forward" size={22} color={colors.pinkAccent} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.calendarGrid}>
            {DAY_NAMES.map((label) => (
              <Text key={label} style={styles.dayLabel}>{label}</Text>
            ))}
            {daysGrid.map((day, index) => {
              const isDisabled = day == null;
              const isActive = !isDisabled && day === selectedDay;
              return (
                <TouchableOpacity
                  key={`d-${index}`}
                  style={[styles.dayCell, isActive && styles.dayCellActive, isDisabled && styles.dayCellDisabled]}
                  onPress={() => !isDisabled && setSelectedDay(day)}
                  disabled={isDisabled}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayCellText, isActive && styles.dayCellTextActive, isDisabled && styles.dayCellTextDisabled]}>
                    {day ?? ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.timeLabel}>Chọn giờ</Text>
          <View style={styles.timeSlots}>
            {TIME_SLOTS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.timeItem, selectedTime === t && styles.timeItemSelected]}
                onPress={() => setSelectedTime(t)}
                activeOpacity={0.8}
              >
                <Text style={[styles.timeItemText, selectedTime === t && styles.timeItemTextSelected]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Thông tin đặt lịch</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Vắc xin</Text>
            <View style={styles.summaryValueWrap}>
              <Text style={styles.summaryValue} numberOfLines={1} ellipsizeMode="tail">{vaccineName}</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phòng khám</Text>
            <View style={styles.summaryValueWrap}>
              <Text style={styles.summaryValue} numberOfLines={1} ellipsizeMode="tail">{centerName}</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ngày & giờ</Text>
            <View style={styles.summaryValueWrap}>
              <Text style={styles.summaryValue}>{summaryDateStr}</Text>
            </View>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí tiêm</Text>
            <Text style={styles.summaryFee}>{fee}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btnConfirm} onPress={handleConfirm} activeOpacity={0.85}>
          <Text style={styles.btnConfirmText}>XÁC NHẬN ĐẶT LỊCH</Text>
        </TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  headerTitle: {
    ...typography.H3,
    fontFamily,
    color: colors.white,
    fontWeight: '600',
  },
  scroll: { flex: 1 },
  content: { paddingTop: 0 },

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

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    gap: 16,
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
  profileImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.background,
  },
  profileImgPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.pinkLight + '80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', fontFamily, color: colors.text, marginBottom: 2 },
  profileAge: { fontSize: 13, fontFamily, color: colors.textMuted },

  selectionCard: {
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 30,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily,
    color: colors.text,
    marginBottom: 15,
  },
  monthYearRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navBtnSmall: {
    padding: 4,
    borderRadius: 999,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily,
    color: colors.textMuted,
  },
  monthText: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily,
    color: colors.text,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  dayLabel: {
    width: '13%',
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
  dayCell: {
    width: '13%',
    aspectRatio: 1,
    maxWidth: 40,
    maxHeight: 35,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellActive: {
    backgroundColor: colors.blueAccent,
    ...Platform.select({
      ios: { shadowColor: colors.blueAccent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  dayCellDisabled: {},
  dayCellText: { fontSize: 13, fontWeight: '600', fontFamily, color: colors.text },
  dayCellTextActive: { color: colors.white },
  dayCellTextDisabled: { color: '#EEE' },

  timeLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily,
    color: colors.textMuted,
    marginBottom: 10,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  timeItem: {
    width: '31%',
    minWidth: 96,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeItemSelected: {
    backgroundColor: 'rgba(126, 171, 208, 0.12)',
    borderColor: colors.blueAccent,
  },
  timeItemText: { fontSize: 14, fontWeight: '600', fontFamily, color: colors.text },
  timeItemTextSelected: { color: colors.blueAccent, fontWeight: '700' },

  summaryCard: {
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(244, 171, 180, 0.15)',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily,
    color: colors.text,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 12,
  },
  summaryLabel: { fontSize: 13, fontFamily, color: colors.textMuted, flexShrink: 0 },
  summaryValueWrap: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily,
    color: colors.text,
    textAlign: 'right',
    width: '100%',
  },
  summaryFee: { fontSize: 15, fontWeight: '700', fontFamily, color: colors.pinkAccent },

  btnConfirm: {
    marginHorizontal: 16,
    backgroundColor: colors.pinkAccent,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: colors.pinkAccent, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
      android: { elevation: 6 },
    }),
  },
  btnConfirmText: { fontSize: 16, fontWeight: '900', fontFamily, color: colors.white },
});
