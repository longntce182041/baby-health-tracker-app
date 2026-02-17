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
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getBabies } from '../../api/babyApi';
import { getGrowthRecords, createGrowthRecord } from '../../api/growthApi';
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
  if (years === 0) return `${monthsLeft} tháng tuổi`;
  if (monthsLeft === 0) return `${years} tuổi`;
  return `${years} tuổi ${monthsLeft} tháng`;
}

const METRICS = [
  { key: 'weight', label: 'Cân Nặng', unit: 'kg' },
  { key: 'height', label: 'Chiều Cao', unit: 'cm' },
  { key: 'head', label: 'Vòng Đầu', unit: 'cm' },
];

const TIME_RANGES = [
  { key: '3M', label: '3 tháng' },
  { key: '6M', label: '6 tháng' },
  { key: '1Y', label: '1 năm' },
  { key: 'all', label: 'All' },
];

const STAT_PINK_BG = '#FFDDE2';
const STAT_BLUE_BG = '#D6EFFF';
const STAT_MINT_BG = '#B2E5E0';
const MINT_GREEN = '#E6FFFA';
const INSIGHT_GREEN = '#008566';
const DAY_LABELS = ['Cn', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTH_NAMES = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

export default function GrowthChartScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { isLoggedIn } = useAuth();
  const [babies, setBabies] = useState([]);
  const [selectedBaby, setSelectedBaby] = useState(null);
  const initialBabyId = route?.params?.babyId;
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState('weight');
  const [timeRange, setTimeRange] = useState('6M');
  const [timeRangePickerVisible, setTimeRangePickerVisible] = useState(false);
  const [growthRecords, setGrowthRecords] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [measureForm, setMeasureForm] = useState({ date: '', weight: '', height: '', head_circumference: '' });
  const [measureDatePickerVisible, setMeasureDatePickerVisible] = useState(false);
  const [measureYearPickerVisible, setMeasureYearPickerVisible] = useState(false);
  const [measurePickerMonth, setMeasurePickerMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [measureSaving, setMeasureSaving] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [focusedMeasureField, setFocusedMeasureField] = useState(null);
  const [measureFieldErrors, setMeasureFieldErrors] = useState({ weight: '', height: '', head: '' });

  function getTodayIso() {
    return new Date().toISOString().slice(0, 10);
  }
  function formatMeasureDateDisplay(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T12:00:00');
    if (isNaN(d.getTime())) return iso;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  function isFutureDate(iso) {
    if (!iso) return false;
    const today = new Date().toISOString().slice(0, 10);
    return iso > today;
  }
  function getMeasureCalendarGrid() {
    const [y, m] = measurePickerMonth.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const last = new Date(y, m, 0);
    const startOffset = first.getDay();
    const daysInMonth = last.getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const remainder = cells.length % 7;
    if (remainder) for (let i = 0; i < 7 - remainder; i++) cells.push(null);
    return { cells, year: y, month: m };
  }
  function changeMeasurePickerMonth(delta) {
    const [y, m] = measurePickerMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMeasurePickerMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  function openMeasureYearPicker() {
    setMeasureYearPickerVisible(true);
  }
  function selectMeasureYear(y) {
    const [, m] = measurePickerMonth.split('-').map(Number);
    setMeasurePickerMonth(`${y}-${String(m).padStart(2, '0')}`);
    setMeasureYearPickerVisible(false);
  }
  function selectMeasureDate(day) {
    if (day == null) return;
    const [y, m] = measurePickerMonth.split('-').map(Number);
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (dateStr > new Date().toISOString().slice(0, 10)) return;
    setMeasureForm((f) => ({ ...f, date: dateStr }));
    setMeasureDatePickerVisible(false);
    setFocusedMeasureField(null);
  }

  const load = async () => {
    setLoading(true);
    if (!isLoggedIn) {
      setBabies([]);
      setSelectedBaby(null);
      setGrowthRecords([]);
      setLoading(false);
      return;
    }
    try {
      const res = await getBabies();
      const list = Array.isArray(res?.data) ? res.data : [];
      setBabies(list);
      const preselected = initialBabyId
        ? list.find((b) => String(b.baby_id) === String(initialBabyId) || String(b.id) === String(initialBabyId))
        : null;
      const baby = preselected || (list.length > 0 ? list[0] : null);
      setSelectedBaby(baby);
      if (baby) {
        const babyId = baby.baby_id || baby.id;
        const growthRes = await getGrowthRecords(babyId);
        const records = Array.isArray(growthRes?.data) ? growthRes.data : [];
        setGrowthRecords(records);
      } else {
        setGrowthRecords([]);
      }
    } catch (err) {
      console.error('GrowthChart getBabies:', err);
      setBabies([]);
      setSelectedBaby(null);
      setGrowthRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!selectedBaby || !isLoggedIn) return;
    const babyId = selectedBaby.baby_id || selectedBaby.id;
    getGrowthRecords(babyId).then((growthRes) => {
      const records = Array.isArray(growthRes?.data) ? growthRes.data : [];
      setGrowthRecords(records);
    }).catch(() => setGrowthRecords([]));
  }, [selectedBaby?.baby_id, selectedBaby?.id, isLoggedIn]);

  const goHome = () => navigation.navigate('Main', { screen: 'HomeTab' });
  const openAddMeasure = () => {
    const today = getTodayIso();
    setMeasureForm({ date: today, weight: '', height: '', head_circumference: '' });
    setMeasurePickerMonth(today.slice(0, 7));
    setMeasureFieldErrors({ weight: '', height: '', head: '' });
    setFocusedMeasureField(null);
    setAddModalVisible(true);
  };
  const closeAddModal = () => {
    setFocusedMeasureField(null);
    setAddModalVisible(false);
  };
  const validateMeasureField = (field, value) => {
    const v = (value ?? '').trim();
    if (field === 'weight') return v ? '' : 'Vui lòng nhập cân nặng';
    if (field === 'height') return v ? '' : 'Vui lòng nhập chiều cao';
    if (field === 'head') return v ? '' : 'Vui lòng nhập vòng đầu';
    return '';
  };

  const isMeasureFormValid = (() => {
    if (!measureForm.date || isFutureDate(measureForm.date)) return false;
    const w = measureForm.weight?.trim();
    const h = measureForm.height?.trim();
    const head = measureForm.head_circumference?.trim();
    if (!w || !h || !head) return false;
    const nw = parseFloat(w);
    const nh = parseFloat(h);
    const nHead = parseFloat(head);
    if (Number.isNaN(nw) || Number.isNaN(nh) || Number.isNaN(nHead)) return false;
    if (nw <= 0 || nh <= 0 || nHead <= 0) return false;
    return true;
  })();

  const handleSaveMeasure = async () => {
    const baby = selectedBaby || babies[0];
    const babyId = baby?.baby_id || baby?.id;
    if (!babyId) return;
    setMeasureSaving(true);
    try {
      const headVal = parseFloat(measureForm.head_circumference.trim());
      const payload = {
        weight: parseFloat(measureForm.weight.trim()),
        height: parseFloat(measureForm.height.trim()),
        head_size: headVal,
        head_circumference: headVal,
        recorded_at: measureForm.date,
      };
      await createGrowthRecord(babyId, payload);
      setAddModalVisible(false);
      setMeasureForm({ date: '', weight: '', height: '', head_circumference: '' });
      load();
    } catch (e) {
      Alert.alert('Lỗi', e?.message || 'Không thể lưu chỉ số');
    }
    setMeasureSaving(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.pinkAccent} />
      </View>
    );
  }

  const baby = selectedBaby || babies[0];
  const displayName = baby?.full_name || 'Bé';
  const ageStr = baby?.date_of_birth ? getAgeString(baby.date_of_birth) : '—';
  const latestRecord = growthRecords.length > 0 ? growthRecords[growthRecords.length - 1] : null;
  const latestWeight = latestRecord?.weight != null ? latestRecord.weight : '—';
  const latestHeight = latestRecord?.height != null ? latestRecord.height : '—';
  const latestHead = (latestRecord?.head_size ?? latestRecord?.head_circumference) != null ? (latestRecord?.head_size ?? latestRecord?.head_circumference) : '—';
  const measureDateStr = latestRecord?.recorded_at
    ? (() => {
      const s = latestRecord.recorded_at;
      if (!s) return '—';
      const d = new Date(s);
      if (isNaN(d.getTime())) return s;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    })()
    : '—';

  const filteredRecords = (() => {
    if (growthRecords.length === 0) return [];
    const now = new Date();
    const cut = (months) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - months);
      return d.getTime();
    };
    const filterBy = { '3M': cut(3), '6M': cut(6), '1Y': cut(12), all: 0 };
    const t = filterBy[timeRange] || 0;
    return growthRecords.filter((r) => !t || new Date(r.recorded_at).getTime() >= t);
  })();
  const chartDataPoints = filteredRecords
    .map((r) => {
      const v = metric === 'weight' ? r.weight : metric === 'height' ? r.height : (r.head_size ?? r.head_circumference);
      return v != null ? { value: Number(v), date: r.recorded_at } : null;
    })
    .filter((p) => p != null);
  const chartValues = chartDataPoints.map((p) => p.value);
  const chartDates = chartDataPoints.map((p) => p.date);
  const hasChartData = chartDataPoints.length > 0;
  const minVal = hasChartData ? Math.min(...chartValues) : 0;
  const maxVal = hasChartData ? Math.max(...chartValues) : 1;
  const range = maxVal - minVal || 1;
  const chartHeight = 180;

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
          <TouchableOpacity style={styles.headerBtn} onPress={goHome} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Biểu đồ thể trạng</Text>
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
        style={[styles.scroll, { marginTop: -50 }]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {!hasBabies ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyTitle}>Chưa có hồ sơ bé</Text>
            <Text style={styles.emptyHint}>Thêm bé ở Trang chủ hoặc Danh sách bé để theo dõi biểu đồ thể trạng.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })} activeOpacity={0.8}>
              <Text style={styles.emptyBtnText}>Về Trang chủ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.emptyBtn, styles.emptyBtnSecondary]} onPress={() => navigation.navigate('BabyList')} activeOpacity={0.8}>
              <Text style={styles.emptyBtnTextSecondary}>Danh sách bé</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.profileCardMint}>
              <View style={styles.profileRow}>
                <View style={styles.babyAvatarLarge}>
                  {(baby?.avt ?? baby?.avatar ?? baby?.avatar_url) ? (
                    <Image
                      source={
                        typeof (baby?.avt ?? baby?.avatar ?? baby?.avatar_url) === 'number'
                          ? (baby.avt ?? baby.avatar ?? baby.avatar_url)
                          : { uri: baby.avt ?? baby.avatar ?? baby.avatar_url }
                      }
                      style={styles.babyAvatarImg}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.babyAvatarText}>{(displayName || 'B').charAt(0).toUpperCase()}</Text>
                  )}
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.babyNameHeader} numberOfLines={1}>{displayName}</Text>
                  <Text style={styles.babyAgeGender}>{ageStr}</Text>
                  <View style={styles.statusPill}>
                    <Ionicons name="checkmark-circle" size={12} color="#1E604F" />
                    <Text style={styles.statusPillText}>Phát triển bình thường</Text>
                  </View>
                </View>
              </View>
              <View style={styles.statsGrid}>
                <View style={[styles.statCardColored, styles.statCardPink]}>
                  <Text style={styles.statLabelWhite}>Cân nặng</Text>
                  <Text style={styles.statValueWhite}>{latestWeight}</Text>
                  <Text style={styles.statUnitWhite}>kg</Text>
                </View>
                <View style={[styles.statCardColored, styles.statCardBlue]}>
                  <Text style={styles.statLabelWhite}>Chiều cao</Text>
                  <Text style={styles.statValueWhite}>{latestHeight}</Text>
                  <Text style={styles.statUnitWhite}>cm</Text>
                </View>
                <View style={[styles.statCardColored, styles.statCardMint]}>
                  <Text style={styles.statLabelWhite}>Vòng đầu</Text>
                  <Text style={styles.statValueWhite}>{latestHead}</Text>
                  <Text style={styles.statUnitWhite}>cm</Text>
                </View>
              </View>
            </View>

            <View style={styles.chartContainer}>
              <View style={styles.chartTabs}>
                {METRICS.map((m) => (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.chartTab, metric === m.key && styles.chartTabActive]}
                    onPress={() => setMetric(m.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chartTabText, metric === m.key && styles.chartTabTextActive]} numberOfLines={1}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.chartHeaderRow}>
                <Text style={styles.chartTitle}>Biểu đồ tăng trưởng</Text>
                <TouchableOpacity
                  style={styles.timeRangeSelect}
                  onPress={() => setTimeRangePickerVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.timeRangeSelectText}>
                    {TIME_RANGES.find((r) => r.key === timeRange)?.label || '6 tháng'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color='#0b1149' />
                </TouchableOpacity>
              </View>
              <Modal visible={timeRangePickerVisible} transparent animationType="fade">
                <Pressable style={styles.pickerOverlay} onPress={() => setTimeRangePickerVisible(false)}>
                  <View style={styles.pickerCard}>
                    <Text style={styles.pickerTitle}>Chọn khoảng thời gian</Text>
                    {TIME_RANGES.map((r) => (
                      <TouchableOpacity
                        key={r.key}
                        style={[styles.pickerOption, timeRange === r.key && styles.pickerOptionActive]}
                        onPress={() => {
                          setTimeRange(r.key);
                          setTimeRangePickerVisible(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.pickerOptionText, timeRange === r.key && styles.pickerOptionTextActive]}>{r.label}</Text>
                        {timeRange === r.key && <Ionicons name="checkmark" size={20} color={colors.pinkAccent} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                </Pressable>
              </Modal>
              <Text style={styles.measureDate}>Ngày đo: {measureDateStr}</Text>
              <View style={[styles.chartPlaceholder, { height: chartHeight + 36 }]}>
                {hasChartData ? (
                  <>
                    <View style={[styles.chartBarsRow, { height: chartHeight }]}>
                      {chartValues.map((val, i) => {
                        const h = ((val - minVal) / range) * (chartHeight - 8) + 8;
                        const label = chartDates[i] ? new Date(chartDates[i]).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '';
                        return (
                          <View key={i} style={styles.chartBarWrap}>
                            <View style={[styles.chartBar, { height: h }]} />
                            {label ? <Text style={styles.chartBarLabel} numberOfLines={1}>{label}</Text> : null}
                          </View>
                        );
                      })}
                    </View>
                    <View style={styles.chartAxisRow}>
                      <Text style={styles.chartAxisText}>{minVal}</Text>
                      <Text style={styles.chartAxisText}>{maxVal}</Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.chartEmpty}>
                    <Ionicons name="analytics-outline" size={48} color={colors.textMuted} />
                    <Text style={styles.chartEmptyText}>Chưa có dữ liệu đo</Text>
                    <Text style={styles.chartEmptyHint}>Thêm chỉ số bằng nút + để xem biểu đồ</Text>
                  </View>
                )}
              </View>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.pinkAccent }]} />
                  <Text style={styles.legendText}>Chỉ số của bé</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#ddd' }]} />
                  <Text style={styles.legendText}>Chuẩn WHO</Text>
                </View>
              </View>
            </View>

            <View style={styles.insightBox}>
              <View style={styles.insightIconWrap}>
                <Ionicons name="bulb-outline" size={22} color="#008566" />
              </View>
              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>Phân tích từ chuyên gia AI</Text>
                <Text style={styles.insightContent}>
                  Cân nặng của {displayName} đang phát triển rất tốt, nằm trong phạm vi tiêu chuẩn của WHO. Bố mẹ nên tiếp tục duy trì chế độ ăn dặm hiện tại nhé!
                </Text>
              </View>
            </View>

            <View style={styles.chartInfoCard}>
              <View style={styles.chartInfoHeader}>
                <View style={styles.chartInfoIconWrap}>
                  <Ionicons name="information-circle" size={24} color={colors.blueAccent} />
                </View>
                <Text style={styles.chartInfoTitle}>Hiểu về biểu đồ tăng trưởng</Text>
              </View>
              <Text style={styles.chartInfoParagraph}>
                Biểu đồ tăng trưởng so sánh các số đo của bé với tiêu chuẩn của WHO dựa trên hàng nghìn trẻ em khỏe mạnh trên toàn thế giới.
              </Text>
              <Text style={styles.chartInfoTerm}>• Đường trung bình:</Text>
              <Text style={styles.chartInfoDesc}>Giữa (phần trăm thứ 50) của phạm vi bình thường.</Text>
              <Text style={styles.chartInfoTerm}>• Khu vực được tô bóng:</Text>
              <Text style={styles.chartInfoDesc}>Mức tăng trưởng bình thường (từ 15 đến 85 phần trăm).</Text>
              <Text style={styles.chartInfoTerm}>• Đường của bé:</Text>
              <Text style={styles.chartInfoDesc}>Mô hình phát triển cá nhân theo thời gian.</Text>
              <Text style={styles.chartInfoNote}>
                Hãy nhớ: Mỗi em bé phát triển theo tốc độ riêng của mình. Các mẫu phát triển ổn định quan trọng hơn các phần trăm chính xác. Hãy tham khảo ý kiến bác sĩ nhi khoa nếu bạn có bất kỳ lo lắng nào.
              </Text>
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

      <TouchableOpacity
        style={[styles.fab, { bottom: (insets.bottom || 16) + 90 }]}
        onPress={openAddMeasure}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      <Modal visible={addModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={closeAddModal}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContentWrap}>
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Thêm chỉ số đo</Text>
                <TouchableOpacity onPress={closeAddModal} style={styles.modalClose} hitSlop={12}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <Text style={styles.modalLabel}>Ngày đo</Text>
                <TouchableOpacity
                  style={[styles.modalDateTrigger, focusedMeasureField === 'date' && styles.modalInputFocused]}
                  onPress={() => { setFocusedMeasureField('date'); setMeasureDatePickerVisible(true); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modalInputText, !measureForm.date && styles.modalInputPlaceholder]}>
                    {measureForm.date ? formatMeasureDateDisplay(measureForm.date) : 'Chọn ngày (không chọn ngày tương lai)'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={colors.pinkAccent} style={styles.modalInputIcon} />
                </TouchableOpacity>
                <Modal visib2rle={measureDatePickerVisible} transparent animationType="fade">
                  <Pressable style={styles.dateModalOverlay} onPress={() => { setMeasureDatePickerVisible(false); setMeasureYearPickerVisible(false); setFocusedMeasureField(null); }}>
                    <Pressable style={styles.dateModalCard} onPress={(e) => e.stopPropagation()}>
                      <View style={styles.dateModalHeader}>
                        <Text style={styles.dateModalTitle}>Chọn ngày đo</Text>
                        <TouchableOpacity onPress={() => { setMeasureDatePickerVisible(false); setMeasureYearPickerVisible(false); setFocusedMeasureField(null); }} style={styles.dateModalClose} hitSlop={12}>
                          <Ionicons name="close" size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.calendarYearNav}>
                        <TouchableOpacity style={styles.calendarYearTitleTouchable} onPress={openMeasureYearPicker} activeOpacity={0.8}>
                          <Text style={styles.calendarYearTitle}>{measurePickerMonth.split('-')[0]}</Text>
                          <Ionicons name="chevron-down" size={18} color={colors.textMuted} style={{ marginLeft: 6 }} />
                        </TouchableOpacity>
                      </View>
                      {measureYearPickerVisible && (
                        <View style={styles.yearPickerContainer}>
                          <ScrollView style={styles.yearPickerScroll} showsVerticalScrollIndicator keyboardShouldPersistTaps="handled">
                            {(() => {
                              const currentYear = new Date().getFullYear();
                              const years = [];
                              for (let y = currentYear; y >= currentYear - 50; y--) years.push(y);
                              return years.map((y) => {
                                const [py] = measurePickerMonth.split('-').map(Number);
                                const active = py === y;
                                return (
                                  <TouchableOpacity
                                    key={y}
                                    style={[styles.yearPickerItem, active && styles.yearPickerItemActive]}
                                    onPress={() => selectMeasureYear(y)}
                                    activeOpacity={0.8}
                                  >
                                    <Text style={[styles.yearPickerItemText, active && styles.yearPickerItemTextActive]}>{y}</Text>
                                  </TouchableOpacity>
                                );
                              });
                            })()}
                          </ScrollView>
                        </View>
                      )}
                      <View style={styles.calendarNav}>
                        <TouchableOpacity style={styles.calendarNavBtn} onPress={() => changeMeasurePickerMonth(-1)}>
                          <Ionicons name="chevron-back" size={22} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.calendarNavTitle}>
                          {MONTH_NAMES[parseInt(measurePickerMonth.split('-')[1], 10) - 1]}
                        </Text>
                        <TouchableOpacity style={styles.calendarNavBtn} onPress={() => changeMeasurePickerMonth(1)}>
                          <Ionicons name="chevron-forward" size={22} color={colors.text} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.calendarWeekRow}>
                        {DAY_LABELS.map((l, i) => (
                          <Text key={i} style={styles.calendarWeekCell}>{l}</Text>
                        ))}
                      </View>
                      <View style={styles.calendarGrid}>
                        {getMeasureCalendarGrid().cells.map((day, i) => {
                          const { year, month } = getMeasureCalendarGrid();
                          const dateStr = day != null ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                          const today = new Date().toISOString().slice(0, 10);
                          const isFuture = dateStr != null && dateStr > today;
                          const active = measureForm.date === dateStr;
                          return (
                            <TouchableOpacity
                              key={i}
                              style={[
                                styles.calendarDayCell,
                                day == null && styles.calendarDayEmpty,
                                active && styles.calendarDayActive,
                                isFuture && styles.calendarDayDisabled,
                              ]}
                              onPress={() => selectMeasureDate(day)}
                              disabled={day == null || isFuture}
                              activeOpacity={0.8}
                            >
                              {day != null && (
                                <Text style={[styles.calendarDayText, active && styles.calendarDayTextActive, isFuture && styles.calendarDayTextDisabled]}>
                                  {day}
                                </Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </Pressable>
                  </Pressable>
                </Modal>
                <Text style={styles.modalLabel}>Cân nặng (kg)</Text>
                <TextInput
                  style={[styles.modalInput, focusedMeasureField === 'weight' && styles.modalInputFocused]}
                  value={measureForm.weight}
                  onChangeText={(v) => {
                    setMeasureForm((f) => ({ ...f, weight: v }));
                    setMeasureFieldErrors((e) => ({ ...e, weight: '' }));
                  }}
                  placeholder="VD: 7.5"
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.textMuted}
                  onFocus={() => setFocusedMeasureField('weight')}
                  onBlur={() => {
                    setFocusedMeasureField(null);
                    const err = validateMeasureField('weight', measureForm.weight);
                    setMeasureFieldErrors((e) => ({ ...e, weight: err }));
                  }}
                />
                {!!measureFieldErrors.weight && <Text style={styles.measureErrorText}>{measureFieldErrors.weight}</Text>}
                <Text style={styles.modalLabel}>Chiều cao (cm)</Text>
                <TextInput
                  style={[styles.modalInput, focusedMeasureField === 'height' && styles.modalInputFocused]}
                  value={measureForm.height}
                  onChangeText={(v) => {
                    setMeasureForm((f) => ({ ...f, height: v }));
                    setMeasureFieldErrors((e) => ({ ...e, height: '' }));
                  }}
                  placeholder="VD: 65"
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.textMuted}
                  onFocus={() => setFocusedMeasureField('height')}
                  onBlur={() => {
                    setFocusedMeasureField(null);
                    const err = validateMeasureField('height', measureForm.height);
                    setMeasureFieldErrors((e) => ({ ...e, height: err }));
                  }}
                />
                {!!measureFieldErrors.height && <Text style={styles.measureErrorText}>{measureFieldErrors.height}</Text>}
                <Text style={styles.modalLabel}>Vòng đầu (cm)</Text>
                <TextInput
                  style={[styles.modalInput, focusedMeasureField === 'head' && styles.modalInputFocused]}
                  value={measureForm.head_circumference}
                  onChangeText={(v) => {
                    setMeasureForm((f) => ({ ...f, head_circumference: v }));
                    setMeasureFieldErrors((e) => ({ ...e, head: '' }));
                  }}
                  placeholder="VD: 42"
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.textMuted}
                  onFocus={() => setFocusedMeasureField('head')}
                  onBlur={() => {
                    setFocusedMeasureField(null);
                    const err = validateMeasureField('head', measureForm.head_circumference);
                    setMeasureFieldErrors((e) => ({ ...e, head: err }));
                  }}
                />
                {!!measureFieldErrors.head && <Text style={styles.measureErrorText}>{measureFieldErrors.head}</Text>}
              </View>
              <TouchableOpacity
                style={[styles.modalSubmit, (!isMeasureFormValid || measureSaving) && styles.modalSubmitDisabled]}
                onPress={handleSaveMeasure}
                disabled={!isMeasureFormValid || measureSaving}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalSubmitText, (!isMeasureFormValid || measureSaving) && styles.modalSubmitTextDisabled]}>
                  {measureSaving ? 'Đang lưu...' : 'Lưu chỉ số'}
                </Text>
              </TouchableOpacity>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  emptyBlock: {
    marginTop: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: colors.white,
    borderRadius: 20,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 18, fontFamily, fontWeight: '700', color: colors.text, marginBottom: 12 },
  emptyHint: { fontSize: 14, fontFamily, color: colors.textSecondary, textAlign: 'center', marginBottom: 20 },
  emptyBtn: {
    backgroundColor: colors.pinkAccent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyBtnSecondary: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.pinkAccent },
  emptyBtnText: { fontSize: 15, fontFamily, fontWeight: '600', color: colors.white },
  emptyBtnTextSecondary: { fontSize: 15, fontFamily, fontWeight: '600', color: colors.pinkAccent },
  headerGrad: {
    paddingBottom: 60,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...typography.H3, fontFamily, color: colors.white, fontWeight: '600' },
  profileCardMint: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 18,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    paddingBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#D4A5AD', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 16 },
      android: { elevation: 6 },
    }),
  },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  babyAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.pinkLight,
    backgroundColor: colors.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  babyAvatarImg: { width: '100%', height: '100%', borderRadius: 32 },
  babyAvatarText: { fontSize: 24, fontWeight: '700', color: colors.pinkAccent, fontFamily },
  profileInfo: { flex: 1 },
  babyNameHeader: { fontSize: 16, fontFamily, fontWeight: '700', color: colors.text, marginBottom: 4 },
  babyAgeGender: { fontSize: 12, fontFamily, color: colors.textSecondary, marginBottom: 8 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: 'rgba(30,96,79,0.1)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(30,96,79,0.25)',
  },
  statusPillText: { fontSize: 11, fontFamily, fontWeight: '600', color: '#1E604F' },
  scroll: { flex: 1 },
  content: { paddingTop: 0 },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginTop: 16,
    marginHorizontal: 0,
    gap: 8,
  },
  statCardColored: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 18,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  statCardPink: { backgroundColor: STAT_PINK_BG },
  statCardBlue: { backgroundColor: STAT_BLUE_BG },
  statCardMint: { backgroundColor: STAT_MINT_BG },
  statLabelWhite: { fontSize: 10, fontFamily, fontWeight: '600', color: 'rgba(255,255,255,0.95)', marginBottom: 4, textAlign: 'center' },
  statValueWhite: { fontSize: 20, fontFamily, fontWeight: '700', color: colors.white },
  statUnitWhite: { fontSize: 12, fontFamily, fontWeight: '500', color: 'rgba(255,255,255,0.95)', marginTop: 4 },
  chartContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 18,
    borderRadius: 24,
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  chartTabs: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  chartTab: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  chartTabActive: { backgroundColor: colors.pinkAccent },
  chartTabText: { fontSize: 11, fontFamily, fontWeight: '600', color: colors.textMuted },
  chartTabTextActive: { fontSize: 11, fontFamily, fontWeight: '600', color: colors.white },
  chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chartTitle: { fontSize: 13, fontFamily, fontWeight: '700', color: colors.text },
  timeRangeSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#0b1149',
  },
  timeRangeSelectText: { fontSize: 12, fontFamily, fontWeight: '600', color: '#0b1149' },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16 },
      android: { elevation: 8 },
    }),
  },
  pickerTitle: { fontSize: 14, fontFamily, fontWeight: '700', color: colors.text, marginBottom: 12 },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 4,
  },
  pickerOptionActive: { backgroundColor: colors.pinkLight + '50' },
  pickerOptionText: { fontSize: 14, fontFamily, fontWeight: '500', color: colors.text },
  pickerOptionTextActive: { fontWeight: '600', color: colors.pinkAccent },
  measureDate: { fontSize: 11, fontFamily, color: colors.textMuted, marginBottom: 12 },
  chartPlaceholder: { width: '100%', backgroundColor: '#f9f9f9', borderRadius: 12, overflow: 'hidden', paddingVertical: 8, paddingHorizontal: 8 },
  chartBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    gap: 4,
  },
  chartBarWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', minWidth: 24 },
  chartBar: {
    width: '80%',
    minHeight: 4,
    backgroundColor: colors.pinkAccent,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  chartBarLabel: { fontSize: 9, fontFamily, color: colors.textMuted, marginTop: 4 },
  chartAxisRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, marginTop: 4 },
  chartAxisText: { fontSize: 10, fontFamily, color: colors.textMuted },
  chartEmpty: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  chartEmptyText: { fontSize: 14, fontFamily, fontWeight: '600', color: colors.textMuted, marginTop: 12 },
  chartEmptyHint: { fontSize: 12, fontFamily, color: colors.textSecondary, marginTop: 4 },
  legendRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 10, fontFamily, color: colors.textMuted },
  chartInfoCard: {
    marginHorizontal: 16,
    marginBottom: 18,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  chartInfoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  chartInfoIconWrap: { marginRight: 10 },
  chartInfoTitle: { fontSize: 15, fontFamily, fontWeight: '700', color: colors.text, flex: 1 },
  chartInfoParagraph: { fontSize: 13, fontFamily, color: colors.text, lineHeight: 20, marginBottom: 12 },
  chartInfoTerm: { fontSize: 13, fontFamily, fontWeight: '600', color: colors.text, marginTop: 6, marginBottom: 2 },
  chartInfoDesc: { fontSize: 13, fontFamily, color: colors.textSecondary, lineHeight: 19, marginBottom: 4 },
  chartInfoNote: { fontSize: 12, fontFamily, fontStyle: 'italic', color: colors.textMuted, lineHeight: 19, marginTop: 12 },
  insightBox: {
    backgroundColor: MINT_GREEN,
    marginHorizontal: 16,
    marginBottom: 90,
    padding: 14,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,200,151,0.1)',
  },
  insightIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,133,102,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: { flex: 1 },
  insightTitle: { fontSize: 13, fontFamily, fontWeight: '600', color: INSIGHT_GREEN, marginBottom: 4 },
  insightContent: { fontSize: 12, fontFamily, color: colors.text, lineHeight: 18 },
  fab: {
    position: 'absolute',
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.pinkAccent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: colors.pinkAccent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10 },
      android: { elevation: 6 },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContentWrap: { width: '100%', maxWidth: 360 },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    ...Platform.select({
      ios: { shadowColor: '#D4A5AD', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24 },
      android: { elevation: 8 },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontFamily, fontWeight: '700', color: colors.text },
  modalClose: { padding: 4 },
  modalBody: { marginBottom: 20 },
  modalLabel: { fontSize: 13, fontFamily, fontWeight: '600', color: colors.text, marginBottom: 6 },
  modalDateTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.pinkLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    backgroundColor: '#FFFBFB',
    minHeight: 48,
  },
  modalInputText: { fontSize: 15, fontFamily, color: colors.text, flex: 1 },
  modalInputPlaceholder: { color: colors.textMuted },
  modalInputIcon: { marginLeft: 8 },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.pinkLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily,
    color: colors.text,
    marginBottom: 14,
    backgroundColor: '#FFFBFB',
  },
  modalInputFocused: {
    borderWidth: 2.5,
    borderColor: colors.pinkAccent,
  },
  measureErrorText: {
    fontSize: 12,
    fontFamily,
    color: '#DC2626',
    marginTop: -8,
    marginBottom: 10,
  },
  dateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dateModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24 },
      android: { elevation: 12 },
    }),
  },
  dateModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dateModalTitle: { fontSize: 18, fontFamily, fontWeight: '700', color: colors.text },
  dateModalClose: { padding: 4 },
  calendarYearNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  calendarYearTitleTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarYearTitle: { fontSize: 18, fontFamily, fontWeight: '700', color: colors.text },
  yearPickerContainer: {
    maxHeight: 200,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  yearPickerScroll: { maxHeight: 184 },
  yearPickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  yearPickerItemActive: { backgroundColor: colors.pinkLight },
  yearPickerItemText: { fontSize: 16, fontFamily, color: colors.text },
  yearPickerItemTextActive: { fontWeight: '700', color: colors.pinkAccent },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  calendarNavBtn: { padding: 8 },
  calendarNavTitle: { fontSize: 16, fontFamily, fontWeight: '700', color: colors.text },
  calendarWeekRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  calendarWeekCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily,
    fontWeight: '700',
    color: colors.textMuted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  calendarDayCell: {
    width: '14.28%',
    aspectRatio: 1,
    maxWidth: 44,
    maxHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderRadius: 12,
  },
  calendarDayEmpty: { backgroundColor: 'transparent' },
  calendarDayActive: { backgroundColor: colors.pinkAccent },
  calendarDayDisabled: { backgroundColor: '#F5F5F5', opacity: 0.7 },
  calendarDayText: { fontSize: 14, fontFamily, fontWeight: '600', color: colors.text },
  calendarDayTextActive: { color: colors.white },
  calendarDayTextDisabled: { color: colors.textMuted },
  modalSubmit: {
    backgroundColor: colors.pinkAccent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: colors.pinkAccent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  modalSubmitText: { fontSize: 16, fontFamily, fontWeight: '600', color: colors.white },
  modalSubmitDisabled: { backgroundColor: '#D0D0D0', opacity: 0.9 },
  modalSubmitTextDisabled: { color: colors.textMuted },

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
});
