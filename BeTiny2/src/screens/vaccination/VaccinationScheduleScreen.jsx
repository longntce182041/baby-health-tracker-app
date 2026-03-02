import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';

const { fontFamily } = typography;

const DAY_NAMES = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const STATUS_DONE = '#A8E6CF';
const STATUS_MISSED = '#C62828';
const STATUS_UPCOMING = '#FFD93D';
const STATUS_DONE_LIGHT = '#D4F1E4';
const STATUS_MISSED_LIGHT = '#EF9A9A';
const STATUS_UPCOMING_LIGHT = '#FFF4C4';
const TODAY_RED = '#C62828';

function getDaysInMonth(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const firstDayOfWeek = first.getDay();
  const daysCount = last.getDate();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const cells = startOffset + daysCount;
  const rows = Math.ceil(cells / 7);
  const result = [];
  for (let i = 0; i < startOffset; i++) result.push(null);
  for (let d = 1; d <= daysCount; d++) result.push(d);
  const remainder = rows * 7 - result.length;
  for (let i = 0; i < remainder; i++) result.push(null);
  return result;
}

function isDatePast(year, month, day, todayDate) {
  const d = new Date(year, month, day);
  const t = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
  return d.getTime() < t.getTime();
}

function getDayStatus(day, year, month, todayDate, statusMap, userEntries) {
  if (day == null) return null;
  const key = `${year}-${month}-${day}`;
  if (userEntries && userEntries[key]) {
    const status = userEntries[key].status;
    if (status === 'upcoming' && isDatePast(year, month, day, todayDate)) return 'missed';
    return status;
  }
  if (statusMap[key]) return statusMap[key];
  const d = new Date(year, month, day);
  if (d.getTime() === todayDate.getTime()) return 'today';
  return null;
}

export default function VaccinationScheduleScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const babyId = route.params?.babyId;

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [userEntries, setUserEntries] = useState({});

  const todayDate = useMemo(() => new Date(now.getFullYear(), now.getMonth(), now.getDate()), []);

  const applyStatus = (status) => {
    if (!selectedDate) return;
    const key = `${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`;
    setUserEntries((prev) => ({ ...prev, [key]: { status } }));
    setSelectedDate(null);
  };

  const monthTitle = useMemo(() => {
    const m = currentMonth + 1;
    return `Tháng ${m} / ${currentYear}`;
  }, [currentMonth, currentYear]);

  const goPrevMonth = () => {
    if (currentMonth <= 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };
  const goNextMonth = () => {
    if (currentMonth >= 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };
  const goPrevYear = () => setCurrentYear((y) => y - 1);
  const goNextYear = () => setCurrentYear((y) => y + 1);

  const daysGrid = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);

  const statusMap = useMemo(() => {
    const todayDay = todayDate.getDate();
    const isViewingCurrentMonth = currentYear === todayDate.getFullYear() && currentMonth === todayDate.getMonth();
    const map = {
      [`${currentYear}-${currentMonth}-1`]: 'done',
      [`${currentYear}-${currentMonth}-9`]: 'missed',
      [`${currentYear}-${currentMonth}-25`]: 'upcoming',
    };
    if (isViewingCurrentMonth) map[`${currentYear}-${currentMonth}-${todayDay}`] = 'today';
    return map;
  }, [currentYear, currentMonth, todayDate]);

  const missedItems = [
    { id: '1', name: 'Phế cầu khuẩn (Mũi 1)', date: '09/11/2025', label: 'Lẽ ra tiêm' },
  ];
  const upcomingItems = [
    { id: '2', name: '6 trong 1 (Mũi 2)', date: '25/11/2025', label: 'Dự kiến' },
  ];
  const doneItems = [
    { id: '3', name: 'Lao (BCG)', date: '01/11/2025', label: 'Đã hoàn thành' },
  ];

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
          <Text style={styles.headerTitle}>Nhật ký tiêm chủng</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.legendWrapper}>
          <View style={styles.legendBox}>
            <View style={styles.legendTitleRow}>
              <Ionicons name="information-circle" size={22} color={colors.pinkAccent} style={styles.legendIcon} />
              <Text style={styles.legendTitle}>Chú thích</Text>
            </View>
            <View style={styles.legendGrid}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: STATUS_UPCOMING }]} />
                <Text style={styles.legendText}>Sắp tiêm</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: STATUS_MISSED }]} />
                <Text style={styles.legendText}>Bỏ lỡ</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: STATUS_DONE }]} />
                <Text style={styles.legendText}>Đã tiêm</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.datePickerBar}>
            <View style={styles.datePickerCenter}>
              <View style={styles.datePickerYearRow}>
                <TouchableOpacity style={styles.datePickerYearBtn} onPress={goPrevYear} activeOpacity={0.7}>
                  <Ionicons name="chevron-back" size={16} color={colors.textMuted} />
                </TouchableOpacity>
                <Text style={styles.datePickerYear}>{currentYear}</Text>
                <TouchableOpacity style={styles.datePickerYearBtn} onPress={goNextYear} activeOpacity={0.7}>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={styles.datePickerMonthRow}>
                <TouchableOpacity
                  style={styles.datePickerArrow}
                  onPress={goPrevMonth}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={24} color={colors.pinkAccent} />
                </TouchableOpacity>
                <Text style={styles.datePickerMonth}>Tháng {String(currentMonth + 1)}</Text>
                <TouchableOpacity
                  style={styles.datePickerArrow}
                  onPress={goNextMonth}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-forward" size={24} color={colors.pinkAccent} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.daysRow}>
            {DAY_NAMES.map((name) => (
              <Text key={name} style={styles.dayName}>{name}</Text>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {daysGrid.map((day, index) => {
              const key = day != null ? `${currentYear}-${currentMonth}-${day}` : '';
              const status = getDayStatus(day, currentYear, currentMonth, todayDate, statusMap, userEntries);
              const isToday = day != null && currentYear === todayDate.getFullYear() && currentMonth === todayDate.getMonth() && day === todayDate.getDate();
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.dayCell}
                  activeOpacity={0.7}
                  onPress={day != null ? () => setSelectedDate({ day, month: currentMonth, year: currentYear }) : undefined}
                >
                  {day != null ? (
                    <View
                      style={[
                        styles.dayNum,
                        status === 'done' && styles.dayNumDone,
                        status === 'missed' && styles.dayNumMissed,
                        status === 'upcoming' && styles.dayNumUpcoming,
                        status == null && styles.dayNumDefault,
                        isToday && styles.dayNumTodayOutline,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNumText,
                          (status === 'upcoming' || status === 'today' || status == null || isToday) && styles.dayNumTextDark,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionLabel}>Mũi tiêm sắp tới</Text>
        {upcomingItems.map((item) => (
          <View key={item.id} style={styles.vaccineItem}>
            <View style={[styles.statusDot, { backgroundColor: STATUS_UPCOMING }]} />
            <View style={styles.vaccineInfo}>
              <Text style={styles.vaccineName}>{item.name}</Text>
              <Text style={styles.vaccineMeta}>{item.label}: {item.date}</Text>
            </View>
            <TouchableOpacity style={styles.btnStatusUpcoming} activeOpacity={0.8}>
              <Text style={styles.btnStatusUpcomingText}>Nhắc hẹn</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.sectionLabel}>Mũi tiêm bỏ lỡ</Text>
        {missedItems.map((item) => (
          <View key={item.id} style={styles.vaccineItem}>
            <View style={[styles.statusDot, { backgroundColor: STATUS_MISSED }]} />
            <View style={styles.vaccineInfo}>
              <Text style={styles.vaccineName}>{item.name}</Text>
              <Text style={styles.vaccineMeta}>{item.label}: {item.date}</Text>
            </View>
            <TouchableOpacity style={styles.btnStatusMissed} activeOpacity={0.8}>
              <Text style={styles.btnStatusMissedText}>Tiêm bù</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.sectionLabel}>Lịch sử đã tiêm</Text>
        {doneItems.map((item) => (
          <View key={item.id} style={[styles.vaccineItem, styles.vaccineItemDone]}>
            <View style={[styles.statusDot, { backgroundColor: STATUS_DONE }]} />
            <View style={styles.vaccineInfo}>
              <Text style={styles.vaccineName}>{item.name}</Text>
              <Text style={styles.vaccineMeta}>{item.label}: {item.date}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color={STATUS_DONE} />
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={selectedDate != null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedDate(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedDate(null)}
        >
          <TouchableOpacity style={styles.statusModalBox} activeOpacity={1} onPress={() => {}}>
            <Text style={styles.statusModalTitle}>
              Ngày {selectedDate ? `${selectedDate.day}/${selectedDate.month + 1}/${selectedDate.year}` : ''}
            </Text>
            <Text style={styles.statusModalSubtitle}>Chọn trạng thái</Text>
            <TouchableOpacity
              style={[styles.statusOption, { backgroundColor: STATUS_UPCOMING_LIGHT }]}
              onPress={() => applyStatus('upcoming')}
              activeOpacity={0.8}
            >
              <View style={[styles.statusOptionDot, { backgroundColor: STATUS_UPCOMING }]} />
              <Text style={styles.statusOptionText}>Sắp tiêm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusOption, { backgroundColor: STATUS_DONE_LIGHT }]}
              onPress={() => applyStatus('done')}
              activeOpacity={0.8}
            >
              <View style={[styles.statusOptionDot, { backgroundColor: STATUS_DONE }]} />
              <Text style={styles.statusOptionText}>Đã tiêm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusOption, { backgroundColor: STATUS_MISSED_LIGHT }]}
              onPress={() => applyStatus('missed')}
              activeOpacity={0.8}
            >
              <View style={[styles.statusOptionDot, { backgroundColor: STATUS_MISSED }]} />
              <Text style={styles.statusOptionText}>Bỏ lỡ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statusModalCancel}
              onPress={() => setSelectedDate(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.statusModalCancelText}>Đóng</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerGrad: {
    paddingBottom: 52,
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

  scroll: { flex: 1, marginTop: -28 },
  content: { paddingHorizontal: 20, paddingTop: 12 },

  legendWrapper: {
    paddingHorizontal: 0,
    marginTop: -10,
    marginBottom: 18,
  },
  legendBox: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.pinkAccent,
    borderRadius: 20,
    padding: 14,
    ...Platform.select({
      ios: { shadowColor: '#D4A5AD', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  legendTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendIcon: { marginRight: 8 },
  legendTitle: {
    fontSize: 13,
    fontFamily,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingRight: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: { fontSize: 13, fontFamily, color: colors.textSecondary, flex: 1 },

  calendarCard: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  datePickerBar: {
    marginBottom: 18,
    paddingVertical: 4,
  },
  datePickerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  datePickerYearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  datePickerYearBtn: {
    padding: 4,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerYear: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily,
    color: colors.textMuted,
    minWidth: 44,
    textAlign: 'center',
  },
  datePickerMonthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  datePickerArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(244, 171, 180, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerMonth: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily,
    color: colors.text,
    minWidth: 80,
    textAlign: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    fontFamily,
    color: colors.textMuted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: {
    width: '100%',
    aspectRatio: 1,
    minWidth: 28,
    minHeight: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumText: { fontSize: 13, fontWeight: '700', fontFamily, color: colors.white },
  dayNumTextDark: { color: colors.text },
  dayNumDefault: {
    backgroundColor: '#F1F5F9',
  },
  dayNumDone: { backgroundColor: STATUS_DONE_LIGHT },
  dayNumMissed: { backgroundColor: STATUS_MISSED_LIGHT },
  dayNumUpcoming: { backgroundColor: STATUS_UPCOMING_LIGHT },
  dayNumTodayOutline: {
    borderWidth: 2,
    borderColor: TODAY_RED,
  },

  sectionLabel: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily,
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  vaccineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  vaccineItemDone: { opacity: 0.85 },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  vaccineInfo: { flex: 1 },
  vaccineName: { fontSize: 14, fontWeight: '700', fontFamily, color: colors.text, marginBottom: 2 },
  vaccineMeta: { fontSize: 12, fontFamily, color: colors.textMuted },
  btnStatusMissed: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
  },
  btnStatusMissedText: { fontSize: 11, fontWeight: '800', fontFamily, color: '#E53935' },
  btnStatusUpcoming: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFBE6',
  },
  btnStatusUpcomingText: { fontSize: 11, fontWeight: '800', fontFamily, color: '#856404' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  statusModalBox: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 16 },
      android: { elevation: 8 },
    }),
  },
  statusModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  statusModalSubtitle: {
    fontSize: 13,
    fontFamily,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginBottom: 10,
  },
  statusOptionDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12,
  },
  statusOptionText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily,
    color: colors.text,
  },
  statusModalCancel: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statusModalCancelText: {
    fontSize: 15,
    fontFamily,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
