import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  TextInput,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';
import { createHealthLog } from '../../api/babyApi';
import storage from '../../storage';

const { fontFamily } = typography;

const BABY_STATUSES = [
  { key: 'good', icon: 'happy-outline', label: 'Tốt' },
  { key: 'normal', icon: 'remove-circle-outline', label: 'Bình thường' },
  { key: 'bad', icon: 'alert-circle-outline', label: 'Tệ' },
];

export const BABY_STATUS_COLORS = {
  good: '#4b944d',
  normal: '#ffbf00',
  bad: '#ff0000',
};

const BABY_STATUS_BG = {
  good: '#E8F5E9',
  normal: '#FFFDE7',
  bad: '#FFEBEE',
};

const DEFAULT_SYMPTOMS = ['Ho', 'Sốt', 'Biếng ăn', 'Quấy khóc'];
const SYMPTOM_STORAGE_KEY = 'healthLogSymptoms';

function parseHealthValue(str, unit) {
  if (!str || typeof str !== 'string') return '';
  const s = str.replace(unit, '').replace(/°C|kg|cm/gi, '').trim();
  return s;
}

export default function HealthLogAddScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const babyId = route.params?.babyId;
  const editMoment = route.params?.editMoment;
  const isEdit = !!editMoment;

  const [activity, setActivity] = useState('play');
  const [babyStatus, setBabyStatus] = useState('normal');
  const [photos, setPhotos] = useState([]);
  const [symptomOptions, setSymptomOptions] = useState(DEFAULT_SYMPTOMS);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [newSymptom, setNewSymptom] = useState('');
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [titleFocused, setTitleFocused] = useState(false);
  const [detailFocused, setDetailFocused] = useState(false);
  const [weight, setWeight] = useState('');
  const [temperature, setTemperature] = useState('');
  const [height, setHeight] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [symptomModalVisible, setSymptomModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await storage.getItem(SYMPTOM_STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length) {
            setSymptomOptions(parsed);
          }
        } catch {
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (!editMoment) return;
    setTitle(editMoment.title || '');
    setDetail(editMoment.desc || '');
    if (editMoment.type === 'health') setActivity('health');
    else if (editMoment.type === 'photo') setActivity('play');
    else setActivity('play');
    if (editMoment.health && Array.isArray(editMoment.health)) {
      editMoment.health.forEach((h) => {
        if (h.icon === 'scale-outline') setWeight(parseHealthValue(h.value, 'kg'));
        if (h.icon === 'thermometer-outline') setTemperature(parseHealthValue(h.value, '°C'));
        if (h.icon === 'resize-outline') setHeight(parseHealthValue(h.value, 'cm'));
        if (h.icon === 'bed-outline') setSleepHours(parseHealthValue(h.value, 'giờ'));
      });
    }
    if (editMoment.babyStatus) setBabyStatus(editMoment.babyStatus);
    if (editMoment.symptoms && Array.isArray(editMoment.symptoms)) {
      setSelectedSymptoms(editMoment.symptoms);
    }
  }, [editMoment]);

  const persistSymptomOptions = async (list) => {
    setSymptomOptions(list);
    await storage.setItem(SYMPTOM_STORAGE_KEY, JSON.stringify(list));
  };

  const toggleSymptom = (label) => {
    setSelectedSymptoms((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const handleAddSymptom = () => {
    const value = (newSymptom || '').trim();
    if (!value) return;
    if (symptomOptions.includes(value)) {
      if (!selectedSymptoms.includes(value)) {
        setSelectedSymptoms((prev) => [...prev, value]);
      }
      setNewSymptom('');
      return;
    }
    const updated = [...symptomOptions, value];
    persistSymptomOptions(updated);
    setSelectedSymptoms((prev) => [...prev, value]);
    setNewSymptom('');
    setSymptomModalVisible(false);
  };

  const handleRemoveSymptom = (label) => {
    if (DEFAULT_SYMPTOMS.includes(label)) return;
    const updated = symptomOptions.filter((s) => s !== label);
    persistSymptomOptions(updated);
    setSelectedSymptoms((prev) => prev.filter((s) => s !== label));
  };

  const trimmedTitle = useMemo(() => (title || '').trim(), [title]);
  const trimmedDetail = useMemo(() => (detail || '').trim(), [detail]);
  const hasContent = useMemo(
    () =>
      selectedSymptoms.length > 0 ||
      photos.length > 0 ||
      trimmedTitle.length > 0 ||
      trimmedDetail.length > 0,
    [selectedSymptoms.length, photos.length, trimmedTitle, trimmedDetail]
  );

  const handleSave = async () => {
    if (isEdit && editMoment) {
      const newHealth =
        activity === 'health'
          ? [
            ...(weight ? [{ icon: 'scale-outline', value: `${weight} kg` }] : []),
            ...(height ? [{ icon: 'resize-outline', value: `${height} cm` }] : []),
            ...(temperature ? [{ icon: 'thermometer-outline', value: `${temperature}°C` }] : []),
            ...(sleepHours ? [{ icon: 'bed-outline', value: `${sleepHours} giờ` }] : []),
          ]
          : editMoment.health;
      const statusColor = BABY_STATUS_COLORS[babyStatus] || editMoment.borderColor;
      const updated = {
        ...editMoment,
        title: title.trim() || editMoment.title,
        desc: detail.trim() || editMoment.desc,
        type: activity === 'health' ? 'health' : editMoment.type,
        health: newHealth && newHealth.length > 0 ? newHealth : editMoment.health,
        babyStatus,
        babyStatusColor: statusColor,
        borderColor: statusColor,
        symptoms: selectedSymptoms,
      };
      navigation.navigate('Main', { screen: 'HealthLogTab', params: { babyId, updatedMoment: updated } });
    } else {
      try {
        if (!babyId) {
          navigation.goBack();
          return;
        }
        const payload = {
          title: trimmedTitle || null,
          desc: trimmedDetail || null,
          babyStatus,
          symptoms: selectedSymptoms,
          photos,
          health: activity === 'health'
            ? [
              ...(weight ? [{ icon: 'scale-outline', value: `${weight} kg` }] : []),
              ...(height ? [{ icon: 'resize-outline', value: `${height} cm` }] : []),
              ...(temperature ? [{ icon: 'thermometer-outline', value: `${temperature}°C` }] : []),
              ...(sleepHours ? [{ icon: 'bed-outline', value: `${sleepHours} giờ` }] : []),
            ]
            : [],
        };
        const res = await createHealthLog(babyId, payload);
        if (res?.success && res.data) {
          navigation.navigate('Main', { screen: 'HealthLogTab', params: { babyId, updatedMoment: res.data } });
        } else {
          navigation.goBack();
        }
      } catch (e) {
        console.warn('createHealthLog error:', e?.message || e);
        navigation.goBack();
      }
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
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEdit ? 'Cập nhật nhật ký' : 'Thêm nhật ký'}</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>ẢNH KHOẢNH KHẮC</Text>
        <View style={styles.uploadSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoList}
          >
            {photos.map((p, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={typeof p === 'string' ? { uri: p } : p} style={styles.photoImage} />
              </View>
            ))}
            <TouchableOpacity
              style={styles.photoPlaceholder}
              activeOpacity={0.8}
              onPress={() => {
                setPhotos((prev) => [...prev, require('../../../assets/images/be.jpg')]);
              }}
            >
              <Ionicons name="camera" size={26} color={colors.pinkAccent} style={styles.photoIcon} />
              <Text style={styles.photoPlaceholderText}>Thêm ảnh</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <Text style={styles.label}>TRẠNG THÁI CỦA BÉ</Text>
        <View style={styles.activityScroll}>
          <View style={styles.activityRow}>
            {BABY_STATUSES.map((s) => {
              const isActive = babyStatus === s.key;
              const color = BABY_STATUS_COLORS[s.key];
              return (
                <TouchableOpacity
                  key={s.key}
                  style={[
                    styles.activityItem,
                    isActive && [
                      styles.activityItemActive,
                      { backgroundColor: BABY_STATUS_BG[s.key], borderColor: color },
                    ],
                  ]}
                  onPress={() => setBabyStatus(s.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={s.icon}
                    size={20}
                    color={isActive ? color : colors.textMuted}
                    style={styles.activityIcon}
                  />
                  <Text
                    style={[
                      styles.activityLabel,
                      isActive && styles.activityLabelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={styles.label}>TRIỆU CHỨNG</Text>
        <View style={styles.symptomCard}>
          {symptomOptions.map((label) => {
            const checked = selectedSymptoms.includes(label);
            const isDefault = DEFAULT_SYMPTOMS.includes(label);
            return (
              <TouchableOpacity
                key={label}
                style={[styles.symptomRow, checked && styles.symptomRowActive]}
                onPress={() => toggleSymptom(label)}
                activeOpacity={0.85}
              >
                <View style={[styles.symptomCheck, checked && styles.symptomCheckActive]}>
                  {checked && <Ionicons name="checkmark" size={16} color={colors.white} />}
                </View>
                <Text style={styles.symptomLabel}>{label}</Text>
                <TouchableOpacity
                  style={styles.symptomRemoveBtn}
                  onPress={() => handleRemoveSymptom(label)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={styles.symptomAddRow}
            activeOpacity={0.85}
            onPress={() => {
              setNewSymptom('');
              setSymptomModalVisible(true);
            }}
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.pinkAccent} style={styles.symptomAddIcon} />
            <Text style={styles.symptomAddText}>Thêm triệu chứng khác</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>CHI TIẾT HOẠT ĐỘNG</Text>
        <View style={styles.inputGroup}>
          <View style={[
            styles.inputBox,
            titleFocused && styles.inputBoxFocused,
            !titleFocused && title.length > 0 && styles.inputBoxFilled,
          ]}>
            <Ionicons name="create-outline" size={20} color="#5CC1C0" style={styles.inputIcon} />
            <TextInput
              style={styles.inputField}
              placeholder="Tiêu đề (VD: Bé tập đi...)"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => setTitleFocused(false)}
            />
          </View>
          <View style={[
            styles.detailBox,
            detailFocused && styles.inputBoxFocused,
            !detailFocused && detail.length > 0 && styles.inputBoxFilled,
          ]}>
            <View style={styles.detailBoxHeader}>
              <Ionicons name="document-text-outline" size={20} color="#5CC1C0" style={styles.detailBoxIcon} />
            </View>
            <TextInput
              style={styles.textArea}
              placeholder="Mẹ viết gì đó cho bé nhé..."
              placeholderTextColor={colors.textMuted}
              value={detail}
              onChangeText={setDetail}
              onFocus={() => setDetailFocused(true)}
              onBlur={() => setDetailFocused(false)}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        <Text style={styles.label}>CHỈ SỐ SỨC KHỎE (NẾU CÓ)</Text>
        <View style={styles.inputGroup}>
          <View style={styles.healthRow}>
            <View style={styles.healthCell}>
              <Text style={styles.healthLabel}>Cân nặng</Text>
              <View style={styles.healthInputWrap}>
                <Ionicons name="scale-outline" size={18} color="#5CC1C0" style={styles.healthInputIcon} />
                <TextInput
                  style={styles.healthInputField}
                  placeholder="VD: 9 kg"
                  placeholderTextColor={colors.textMuted}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <View style={styles.healthCell}>
              <Text style={styles.healthLabel}>Nhiệt độ</Text>
              <View style={styles.healthInputWrap}>
                <Ionicons name="thermometer-outline" size={18} color="#5CC1C0" style={styles.healthInputIcon} />
                <TextInput
                  style={styles.healthInputField}
                  placeholder="VD: 37°C"
                  placeholderTextColor={colors.textMuted}
                  value={temperature}
                  onChangeText={setTemperature}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
          <View style={styles.healthRow}>
            <View style={styles.healthCell}>
              <Text style={styles.healthLabel}>Chiều cao</Text>
              <View style={styles.healthInputWrap}>
                <Ionicons name="resize-outline" size={18} color="#5CC1C0" style={styles.healthInputIcon} />
                <TextInput
                  style={styles.healthInputField}
                  placeholder="VD: 75 cm"
                  placeholderTextColor={colors.textMuted}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <View style={styles.healthCell}>
              <Text style={styles.healthLabel}>Giấc ngủ</Text>
              <View style={styles.healthInputWrap}>
                <Ionicons name="bed-outline" size={18} color="#5CC1C0" style={styles.healthInputIcon} />
                <TextInput
                  style={styles.healthInputField}
                  placeholder="VD: 12 h"
                  placeholderTextColor={colors.textMuted}
                  value={sleepHours}
                  onChangeText={setSleepHours}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btnSave, !hasContent && styles.btnSaveDisabled]}
            onPress={hasContent ? handleSave : undefined}
            activeOpacity={hasContent ? 0.85 : 1}
            disabled={!hasContent}
          >
            <Text style={styles.btnSaveText}>{isEdit ? 'Cập nhật' : 'Lưu nhật ký'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {symptomModalVisible && (
        <View style={styles.symptomModalOverlay}>
          <View style={styles.symptomModalBox}>
            <Text style={styles.symptomModalTitle}>Thêm triệu chứng</Text>
            <TextInput
              style={styles.symptomModalInput}
              placeholder="Nhập tên triệu chứng..."
              placeholderTextColor={colors.textMuted}
              value={newSymptom}
              onChangeText={setNewSymptom}
              autoFocus
            />
            <View style={styles.symptomModalActions}>
              <TouchableOpacity
                style={styles.symptomModalBtnSecondary}
                onPress={() => {
                  setNewSymptom('');
                  setSymptomModalVisible(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.symptomModalBtnSecondaryText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.symptomModalBtnPrimary,
                  !(newSymptom || '').trim() && styles.symptomModalBtnDisabled,
                ]}
                onPress={handleAddSymptom}
                activeOpacity={0.8}
                disabled={!(newSymptom || '').trim()}
              >
                <Text style={styles.symptomModalBtnPrimaryText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    fontSize: 18,
    fontFamily,
    fontWeight: '700',
    color: colors.white,
  },
  headerSpacer: { width: 40, height: 40 },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20 },

  uploadSection: { marginBottom: 24 },
  photoList: {
    flexDirection: 'row',
    gap: 12,
  },
  photoItem: {
    width: 90,
    height: 90,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#EBEEF0',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: { marginBottom: 8 },
  photoPlaceholderText: {
    fontSize: 14,
    fontFamily,
    fontWeight: '600',
    color: colors.textMuted,
  },

  label: {
    fontFamily,
    fontWeight: '700',
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    paddingHorizontal: 0,
  },

  activityScroll: { marginBottom: 24 },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityItem: {
    width: 84,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  activityItemActive: {
    backgroundColor: '#FFF9FB',
  },
  activityIcon: { marginBottom: 6 },
  activityLabel: {
    fontSize: 11,
    fontFamily,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
  activityLabelActive: { color: colors.text },

  inputGroup: { marginBottom: 20 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputBoxFocused: {
    backgroundColor: colors.white,
    borderColor: colors.pinkAccent,
  },
  inputBoxFilled: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.pinkAccent,
  },
  inputIcon: { marginRight: 14 },
  inputField: {
    flex: 1,
    fontFamily,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  detailBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  detailBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailBoxIcon: { marginRight: 0 },
  textArea: {
    fontFamily,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 8,
    paddingHorizontal: 0,
    minHeight: 160,
    width: '100%',
  },
  symptomCard: {
    backgroundColor: '#FFF5F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#FFF9FB',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FECFD9',
  },
  symptomCheck: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: colors.white,
  },
  symptomCheckActive: {
    backgroundColor: colors.pinkAccent,
    borderColor: colors.pinkAccent,
  },
  symptomCheckDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  symptomLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily,
    color: colors.text,
    fontWeight: '600',
  },
  symptomRemoveBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  symptomInput: {
    flex: 1,
    fontSize: 13,
    fontFamily,
    color: colors.text,
    paddingVertical: 0,
  },
  symptomAddBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  symptomRowActive: {
    borderColor: colors.pinkAccent,
    backgroundColor: '#FFE4EF',
  },
  symptomAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  symptomAddIcon: { marginRight: 6 },
  symptomAddText: {
    fontSize: 13,
    fontFamily,
    color: colors.pinkAccent,
  },
  symptomModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  symptomModalBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
      android: { elevation: 8 },
    }),
  },
  symptomModalTitle: {
    fontSize: 16,
    fontFamily,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  symptomModalInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily,
    color: colors.text,
    marginBottom: 16,
  },
  symptomModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },
  symptomModalBtnSecondary: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  symptomModalBtnSecondaryText: {
    fontSize: 14,
    fontFamily,
    color: colors.textMuted,
  },
  symptomModalBtnPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: colors.pinkAccent,
  },
  symptomModalBtnPrimaryText: {
    fontSize: 14,
    fontFamily,
    fontWeight: '700',
    color: colors.white,
  },
  symptomModalBtnDisabled: {
    opacity: 0.6,
  },

  healthRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  healthCell: {
    flex: 1,
  },
  healthCellFull: {
    flex: 1,
  },
  healthLabel: {
    fontSize: 12,
    fontFamily,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  healthInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  healthInputIcon: { marginRight: 10 },
  healthInputField: {
    flex: 1,
    fontFamily,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },

  footer: { paddingVertical: 20 },
  btnSave: {
    backgroundColor: colors.pinkAccent,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: colors.pinkAccent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  btnSaveText: {
    fontSize: 16,
    fontFamily,
    fontWeight: '700',
    color: colors.white,
  },
});
