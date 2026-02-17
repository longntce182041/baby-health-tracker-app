import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  StatusBar,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBaby, updateBaby } from '../../api/babyApi';
import { colors, typography } from '../../theme';

const { fontFamily } = typography;

const BLOOD_TYPE_CODE = {
  UNKNOWN: 0,
  A: 1,
  B: 2,
  O: 3,
  AB: 4,
};

const BLOOD_TYPE_OPTIONS = [
  { code: BLOOD_TYPE_CODE.A, label: 'A' },
  { code: BLOOD_TYPE_CODE.B, label: 'B' },
  { code: BLOOD_TYPE_CODE.O, label: 'O' },
  { code: BLOOD_TYPE_CODE.AB, label: 'AB' },
];

const DAY_LABELS = ['Cn', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTH_NAMES = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

function getInitials(name) {
  if (!name) return 'B';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return words[words.length - 1][0].toUpperCase();
  return name[0].toUpperCase();
}

function normalizeName(raw) {
  if (!raw) return '';
  return raw.replace(/\s+/g, ' ').trim();
}

function validateName(name) {
  const cleaned = normalizeName(name);
  const length = cleaned.length;
  if (!cleaned) {
    return { cleaned, error: 'Vui lòng nhập họ và tên bé' };
  }
  if (length < 2) {
    return { cleaned, error: 'Tên bé phải có ít nhất 2 ký tự' };
  }
  if (length > 70) {
    return { cleaned: cleaned.slice(0, 70), error: 'Tên bé tối đa 70 ký tự' };
  }
  return { cleaned, error: '' };
}
function getDobFromIso(iso) {
  if (!iso) return { day: '', month: '', year: '' };
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { day: '', month: '', year: '' };
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: String(d.getMonth() + 1).padStart(2, '0'),
      year: String(d.getFullYear()),
    };
  } catch {
    return { day: '', month: '', year: '' };
  }
}

function parseDobFromParts(dayStr, monthStr, yearStr) {
  const day = (dayStr || '').replace(/\D/g, '');
  const month = (monthStr || '').replace(/\D/g, '');
  const year = (yearStr || '').replace(/\D/g, '');
  if (!day || !month || !year) {
    return { iso: null, error: 'Vui lòng nhập đủ ngày sinh (dd/mm/yyyy)' };
  }
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) {
    return { iso: null, error: 'Vui lòng nhập đủ ngày sinh (dd/mm/yyyy)' };
  }
  const dNum = parseInt(day, 10);
  const mNum = parseInt(month, 10);
  const yNum = parseInt(year, 10);
  if (mNum < 1 || mNum > 12) {
    return { iso: null, error: 'Tháng không hợp lệ' };
  }
  if (dNum < 1 || dNum > 31) {
    return { iso: null, error: 'Ngày không hợp lệ' };
  }
  const d = new Date(yNum, mNum - 1, dNum);
  if (Number.isNaN(d.getTime())) {
    return { iso: null, error: 'Ngày sinh không hợp lệ' };
  }
  if (d.getDate() !== dNum || d.getMonth() !== mNum - 1 || d.getFullYear() !== yNum) {
    return { iso: null, error: 'Ngày này không tồn tại trong tháng đã chọn' };
  }
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dobOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (dobOnly > todayOnly) {
    return { iso: null, error: 'Ngày sinh không được lớn hơn ngày hiện tại' };
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return { iso: `${yyyy}-${mm}-${dd}`, error: '' };
}

export default function BabyFormScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { id, baby } = route.params || {};
  const isEdit = !!id;
  const [form, setForm] = useState({
    full_name: '',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
    gender: '',
    blood_type: BLOOD_TYPE_CODE.UNKNOWN,
  });
  const [allergies, setAllergies] = useState([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    full_name: '',
    dobInput: '',
    bloodType: '',
  });
  const [focusedDobField, setFocusedDobField] = useState(null);
  const [dobPickerVisible, setDobPickerVisible] = useState(false);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);
  const [dobPickerMonth, setDobPickerMonth] = useState(() => {
    const base = baby?.date_of_birth ? new Date(baby.date_of_birth) : new Date();
    const y = base.getFullYear();
    const m = base.getMonth() + 1;
    return `${y}-${String(m).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (isEdit && baby) {
      const dob = getDobFromIso(baby.date_of_birth);
      setForm({
        full_name: baby.full_name || '',
        dobDay: dob.day,
        dobMonth: dob.month,
        dobYear: dob.year,
        gender: baby.gender || '',
        blood_type: (() => {
          const v = baby.blood_type;
          if (v == null || v === '') return BLOOD_TYPE_CODE.UNKNOWN;
          const n = typeof v === 'number' ? v : parseInt(String(v), 10);
          return (!Number.isNaN(n) && n >= 0 && n <= 4) ? n : BLOOD_TYPE_CODE.UNKNOWN;
        })(),
      });
      setAllergies(baby.allergies || []);
    }
  }, [isEdit, baby]);

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (index) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const openDobPicker = () => {
    let base = new Date();
    const parsed = parseDobFromParts(form.dobDay, form.dobMonth, form.dobYear);
    if (!parsed.error && parsed.iso) {
      base = new Date(parsed.iso);
    } else if (baby?.date_of_birth) {
      base = new Date(baby.date_of_birth);
    }
    const y = base.getFullYear();
    const m = base.getMonth() + 1;
    setDobPickerMonth(`${y}-${String(m).padStart(2, '0')}`);
    setDobPickerVisible(true);
  };

  const getDobCalendarGrid = () => {
    const [y, m] = dobPickerMonth.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const last = new Date(y, m, 0);
    const startOffset = first.getDay();
    const daysInMonth = last.getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const remainder = cells.length % 7;
    if (remainder) {
      for (let i = 0; i < 7 - remainder; i++) cells.push(null);
    }
    return { cells, year: y, month: m };
  };

  const openYearPicker = () => setYearPickerVisible(true);

  const selectYear = (y) => {
    const [, m] = dobPickerMonth.split('-').map(Number);
    setDobPickerMonth(`${y}-${String(m).padStart(2, '0')}`);
    setYearPickerVisible(false);
  };

  const changeDobPickerMonth = (delta) => {
    const [y, m] = dobPickerMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setDobPickerMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const selectDobFromCalendar = (day) => {
    if (day == null) return;
    const [y, m] = dobPickerMonth.split('-').map(Number);
    setForm((f) => ({
      ...f,
      dobDay: String(day).padStart(2, '0'),
      dobMonth: String(m).padStart(2, '0'),
      dobYear: String(y),
    }));
    setErrors((e) => ({ ...e, dobInput: '' }));
    setDobPickerVisible(false);
  };

  const avatarSource = baby?.avt ?? baby?.avatar;

  const isProfileFormValid = (() => {
    const nameResult = validateName(form.full_name);
    const dobResult = parseDobFromParts(form.dobDay, form.dobMonth, form.dobYear);
    return !nameResult.error && !dobResult.error;
  })();

  const handleSubmit = async () => {
    const nameResult = validateName(form.full_name);
    const nextErrors = { ...errors, full_name: nameResult.error };
    const dobResult = parseDobFromParts(form.dobDay, form.dobMonth, form.dobYear);
    nextErrors.dobInput = dobResult.error;
    setErrors(nextErrors);

    if (nameResult.error || dobResult.error) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại các trường bắt buộc');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        full_name: nameResult.cleaned,
        date_of_birth: dobResult.iso,
        gender: form.gender || null,
        blood_type: form.blood_type === BLOOD_TYPE_CODE.UNKNOWN ? null : form.blood_type,
        allergies: allergies.length > 0 ? allergies : null,
      };
      if (isEdit) {
        await updateBaby(id, payload);
        Alert.alert('Thành công', 'Đã cập nhật');
      } else {
        await createBaby(payload);
        Alert.alert('Thành công', 'Đã thêm bé');
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Lỗi', e?.message || e?.response?.data?.message || 'Không thể lưu');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'android' && (
        <StatusBar backgroundColor={isEdit ? '#F4ABB4' : colors.pinkAccent} barStyle="light-content" />
      )}

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
          <Text style={styles.headerTitle}>{isEdit ? 'Chỉnh sửa hồ sơ' : 'Thêm hồ sơ bé'}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            {avatarSource ? (
              <Image
                source={typeof avatarSource === 'number' ? avatarSource : { uri: avatarSource }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>{getInitials(form.full_name)}</Text>
            )}
          </View>
          <TouchableOpacity>
            <Text style={styles.avatarLabel}>Thay đổi ảnh đại diện</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldWrap}>
          <View style={styles.labelRow}>
            <MaterialCommunityIcons name="baby-face-outline" size={16} color={colors.pinkAccent} />
            <Text style={styles.label}>Tên bé</Text>
          </View>
          <TextInput
            style={styles.input}
            value={form.full_name}
            onChangeText={(v) => {
              setForm((f) => ({ ...f, full_name: v }));
            }}
            onBlur={() => {
              const result = validateName(form.full_name);
              setForm((f) => ({ ...f, full_name: result.cleaned }));
              setErrors((e) => ({ ...e, full_name: result.error }));
            }}
            placeholder="Nhập tên bé"
            placeholderTextColor={colors.textMuted}
          />
          {!!errors.full_name && <Text style={styles.errorText}>{errors.full_name}</Text>}
        </View>

        <View style={styles.fieldWrap}>
          <View style={styles.labelRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.pinkAccent} />
            <Text style={styles.label}>Ngày sinh</Text>
          </View>
          <View style={styles.dateInputRow}>
            <View style={styles.dobPartsRowWrap}>
              <View style={styles.dobPartsRow}>
                <TextInput
                  style={[styles.input, styles.dobPartInput, focusedDobField === 'day' && styles.dobPartInputFocused]}
                  value={form.dobDay}
                  onChangeText={(v) => {
                    setForm((f) => ({ ...f, dobDay: v.replace(/\D/g, '').slice(0, 2) }));
                  }}
                  placeholder="dd"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                  onFocus={() => setFocusedDobField('day')}
                  onBlur={() => {
                    setFocusedDobField(null);
                    const result = parseDobFromParts(form.dobDay, form.dobMonth, form.dobYear);
                    setErrors((e) => ({ ...e, dobInput: result.error }));
                  }}
                />
                <Text style={styles.dobSlash}>/</Text>
                <TextInput
                  style={[styles.input, styles.dobPartInput, focusedDobField === 'month' && styles.dobPartInputFocused]}
                  value={form.dobMonth}
                  onChangeText={(v) => {
                    setForm((f) => ({ ...f, dobMonth: v.replace(/\D/g, '').slice(0, 2) }));
                  }}
                  placeholder="mm"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                  onFocus={() => setFocusedDobField('month')}
                  onBlur={() => {
                    setFocusedDobField(null);
                    const result = parseDobFromParts(form.dobDay, form.dobMonth, form.dobYear);
                    setErrors((e) => ({ ...e, dobInput: result.error }));
                  }}
                />
                <Text style={styles.dobSlash}>/</Text>
                <TextInput
                  style={[styles.input, styles.dobPartInput, styles.dobYearInput, focusedDobField === 'year' && styles.dobPartInputFocused]}
                  value={form.dobYear}
                  onChangeText={(v) => {
                    setForm((f) => ({ ...f, dobYear: v.replace(/\D/g, '').slice(0, 4) }));
                  }}
                  placeholder="yyyy"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={4}
                  onFocus={() => setFocusedDobField('year')}
                  onBlur={() => {
                    setFocusedDobField(null);
                    const result = parseDobFromParts(form.dobDay, form.dobMonth, form.dobYear);
                    setErrors((e) => ({ ...e, dobInput: result.error }));
                  }}
                />
              </View>
            </View>
            <TouchableOpacity style={styles.dateIconWrap} onPress={openDobPicker} activeOpacity={0.8}>
              <Ionicons name="calendar" size={20} color={colors.pinkAccent} />
            </TouchableOpacity>
          </View>
          {!!errors.dobInput && <Text style={styles.errorText}>{errors.dobInput}</Text>}
        </View>

        <View style={styles.fieldWrap}>
          <View style={styles.labelRow}>
            <Ionicons name="person-outline" size={16} color={colors.pinkAccent} />
            <Text style={styles.label}>Giới tính</Text>
          </View>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[
                styles.genderBtn,
                form.gender === 'Nam' && styles.genderBtnActive,
              ]}
              onPress={() => setForm((f) => ({ ...f, gender: 'Nam' }))}
            >
              <Text
                style={[
                  styles.genderBtnText,
                  form.gender === 'Nam' && styles.genderBtnTextActive,
                ]}
              >
                Nam
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderBtn,
                form.gender === 'Nữ' && styles.genderBtnActiveFemale,
              ]}
              onPress={() => setForm((f) => ({ ...f, gender: 'Nữ' }))}
            >
              <Text
                style={[
                  styles.genderBtnText,
                  form.gender === 'Nữ' && styles.genderBtnTextActiveFemale,
                ]}
              >
                Nữ
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <View style={styles.labelRow}>
            <Ionicons name="water-outline" size={16} color={colors.pinkAccent} />
            <Text style={styles.label}>Nhóm máu (tùy chọn)</Text>
          </View>
          <View style={styles.bloodTypeRow}>
            {BLOOD_TYPE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.code}
                style={[
                  styles.bloodTypeBtn,
                  form.blood_type === opt.code && styles.bloodTypeBtnActive,
                ]}
                onPress={() => {
                  setForm((f) => ({
                    ...f,
                    blood_type: form.blood_type === opt.code ? BLOOD_TYPE_CODE.UNKNOWN : opt.code,
                  }));
                }}
              >
                <Text
                  style={[
                    styles.bloodTypeBtnText,
                    form.blood_type === opt.code && styles.bloodTypeBtnTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {form.blood_type !== BLOOD_TYPE_CODE.UNKNOWN && (
            <Text style={styles.bloodTypeHint}>
              Hiện tại: {BLOOD_TYPE_OPTIONS.find((o) => o.code === form.blood_type)?.label ?? '—'}
            </Text>
          )}
        </View>

        <View style={styles.fieldWrap}>
          <View style={styles.labelRow}>
            <Ionicons name="alert-circle-outline" size={16} color="#D97706" />
            <Text style={styles.label}>Dị ứng (nếu có)</Text>
          </View>
          <View style={styles.allergyInputRow}>
            <TextInput
              style={[styles.input, styles.allergyInput]}
              value={newAllergy}
              onChangeText={setNewAllergy}
              placeholder="VD: Sữa bò, hải sản..."
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={handleAddAllergy}
            />
            <TouchableOpacity style={styles.addAllergyBtn} onPress={handleAddAllergy}>
              <Ionicons name="checkmark" size={22} color={colors.pinkAccent} />
            </TouchableOpacity>
          </View>
          {allergies.length > 0 && (
            <View style={styles.allergyList}>
              {allergies.map((allergy, index) => (
                <View key={index} style={styles.allergyTag}>
                  <Text style={styles.allergyText}>{allergy}</Text>
                  <TouchableOpacity onPress={() => handleRemoveAllergy(index)}>
                    <Ionicons name="close" size={14} color="#D97706" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.submitBtn, (loading || !isProfileFormValid) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading || !isProfileFormValid}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitBtnText}>
                {isEdit ? 'Cập nhật hồ sơ' : 'Lưu hồ sơ bé'}
              </Text>
            )}
          </TouchableOpacity>
          {!isEdit && (
            <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.skipBtnText}>Bỏ qua, thêm sau</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <Modal visible={dobPickerVisible} transparent animationType="fade">
        <Pressable style={styles.dateModalOverlay} onPress={() => { setDobPickerVisible(false); setYearPickerVisible(false); }}>
          <Pressable style={styles.dateModalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.dateModalHeader}>
              <Text style={styles.dateModalTitle}>Chọn ngày sinh</Text>
              <TouchableOpacity
                onPress={() => { setDobPickerVisible(false); setYearPickerVisible(false); }}
                style={styles.dateModalClose}
                hitSlop={12}
              >
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <View style={styles.calendarYearNav}>
              <TouchableOpacity
                style={styles.calendarYearTitleTouchable}
                onPress={openYearPicker}
                activeOpacity={0.8}
              >
                <Text style={styles.calendarYearTitle}>{dobPickerMonth.split('-')[0]}</Text>
                <Ionicons name="chevron-down" size={18} color={colors.textMuted} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
            {yearPickerVisible && (
              <View style={styles.yearPickerContainer}>
                <ScrollView
                  style={styles.yearPickerScroll}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {(() => {
                    const currentYear = new Date().getFullYear();
                    const years = [];
                    for (let y = currentYear; y >= currentYear - 120; y--) years.push(y);
                    return years.map((y) => {
                      const [py] = dobPickerMonth.split('-').map(Number);
                      const active = py === y;
                      return (
                        <TouchableOpacity
                          key={y}
                          style={[styles.yearPickerItem, active && styles.yearPickerItemActive]}
                          onPress={() => selectYear(y)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.yearPickerItemText, active && styles.yearPickerItemTextActive]}>
                            {y}
                          </Text>
                        </TouchableOpacity>
                      );
                    });
                  })()}
                </ScrollView>
              </View>
            )}
            <View style={styles.calendarNav}>
              <TouchableOpacity style={styles.calendarNavBtn} onPress={() => changeDobPickerMonth(-1)}>
                <Ionicons name="chevron-back" size={22} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.calendarNavTitle}>
                {MONTH_NAMES[parseInt(dobPickerMonth.split('-')[1], 10) - 1]}
              </Text>
              <TouchableOpacity style={styles.calendarNavBtn} onPress={() => changeDobPickerMonth(1)}>
                <Ionicons name="chevron-forward" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.calendarWeekRow}>
              {DAY_LABELS.map((l, i) => (
                <Text key={i} style={styles.calendarWeekCell}>
                  {l}
                </Text>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {getDobCalendarGrid().cells.map((day, i) => {
                const { year, month } = getDobCalendarGrid();
                const dateStr =
                  day != null
                    ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    : null;
                const activeIso = parseDobFromParts(form.dobDay, form.dobMonth, form.dobYear);
                const active = !activeIso.error && activeIso.iso === dateStr;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.calendarDayCell,
                      day == null && styles.calendarDayEmpty,
                      active && styles.calendarDayActive,
                    ]}
                    onPress={() => selectDobFromCalendar(day)}
                    disabled={day == null}
                    activeOpacity={0.8}
                  >
                    {day != null && (
                      <Text
                        style={[
                          styles.calendarDayText,
                          active && styles.calendarDayTextActive,
                        ]}
                      >
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

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
    fontSize: 18,
    fontFamily,
    color: colors.white,
    fontWeight: '600',
  },

  scrollView: { flex: 1, marginTop: -40 },
  content: { paddingHorizontal: 16, paddingTop: 0 },

  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarWrap: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.9)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 12,
      },
      android: { elevation: 10 },
    }),
  },
  avatarText: { fontSize: 42, fontWeight: '700', color: colors.pinkAccent },
  avatarLabel: { fontSize: 13, color: colors.pinkAccent, fontWeight: '600' },
  avatarImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },

  fieldWrap: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 13, fontFamily, fontWeight: '600', color: colors.text, marginLeft: 6 },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.pinkLight,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily,
    color: colors.text,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#DC2626',
  },

  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dobPartsRowWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dobPartsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dobPartInput: {
    width: 44,
    height: 48,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  dobPartInputFocused: {
    borderWidth: 2.5,
    borderColor: colors.pinkAccent,
  },
  dobYearInput: {
    width: 72,
    minWidth: 72,
  },
  dobSlash: {
    fontSize: 16,
    color: colors.textMuted,
    marginHorizontal: 4,
  },
  bloodTypeHint: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textMuted,
  },
  dateIconWrap: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.pinkLight,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
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
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  calendarNavBtn: { padding: 8 },
  calendarNavTitle: { fontSize: 16, fontFamily, fontWeight: '700', color: colors.text },
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
  yearPickerScroll: {
    maxHeight: 184,
  },
  yearPickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  yearPickerItemActive: {
    backgroundColor: colors.pinkLight,
  },
  yearPickerItemText: {
    fontSize: 16,
    fontFamily,
    color: colors.text,
  },
  yearPickerItemTextActive: {
    fontWeight: '700',
    color: colors.pinkAccent,
  },
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
  calendarDayText: { fontSize: 14, fontFamily, fontWeight: '600', color: colors.text },
  calendarDayTextActive: { color: colors.white },

  genderRow: { flexDirection: 'row', gap: 12 },
  genderBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.pinkLight,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBtnActive: { borderColor: colors.blueAccent, backgroundColor: colors.blueAccent + '20' },
  genderBtnActiveFemale: { borderColor: colors.pinkAccent, backgroundColor: colors.pinkLight },
  genderBtnText: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  genderBtnTextActive: { color: colors.blueAccent },
  genderBtnTextActiveFemale: { color: colors.pinkAccent },

  bloodTypeRow: { flexDirection: 'row', gap: 8 },
  bloodTypeBtn: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.pinkLight,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodTypeBtnActive: { borderColor: colors.pinkAccent, backgroundColor: colors.pinkLight },
  bloodTypeBtnText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  bloodTypeBtnTextActive: { color: colors.pinkAccent },

  fieldRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  fieldHalf: { flex: 1 },

  allergyInputRow: { flexDirection: 'row', gap: 8 },
  allergyInput: { flex: 1 },
  addAllergyBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.pinkAccent,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allergyList: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  allergyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  allergyText: { fontSize: 13, color: '#D97706', fontWeight: '600', marginRight: 6 },

  actions: { marginTop: 16 },
  submitBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.pinkAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: colors.pinkAccent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 16, fontFamily, fontWeight: '700', color: colors.white },
  skipBtn: { height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  skipBtnText: { fontSize: 15, fontFamily, color: colors.textMuted },
});
