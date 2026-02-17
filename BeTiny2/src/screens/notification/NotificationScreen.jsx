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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  getNotifications,
  getNotificationById,
  deleteNotification as deleteNotificationApi,
} from '../../api/notificationApi';
import { useAuth } from '../../context/AuthContext';
import { colors, typography } from '../../theme';

const { fontFamily } = typography;

const NOTIFICATION_ICONS = {
  vaccine: { lib: Ionicons, name: 'medical-outline', color: '#5B8DEE', bg: '#E8EEFC' },
  temperature: { lib: Ionicons, name: 'thermometer-outline', color: '#E85C5C', bg: '#FFE8E8' },
  points: { lib: Ionicons, name: 'checkmark-circle-outline', color: '#4CAF50', bg: '#E8F5E9' },
  doctor: { lib: Ionicons, name: 'chatbubble-ellipses-outline', color: '#9C6ADE', bg: '#F0E6FA' },
  reminder: { lib: Ionicons, name: 'notifications-outline', color: '#FF9800', bg: '#FFF3E0' },
  appointment: { lib: Ionicons, name: 'calendar-outline', color: '#5B8DEE', bg: '#E8EEFC' },
  achievement: { lib: Ionicons, name: 'heart-outline', color: colors.pinkAccent, bg: colors.pinkLight },
  default: { lib: Ionicons, name: 'notifications-outline', color: colors.textMuted, bg: '#F0F0F0' },
};

function getTimeLabel(createdAt) {
  if (!createdAt) return '';
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffMins = Math.floor(diffMs / (60 * 1000));

  if (diffDays === 0) {
    if (diffHours >= 1) return `${diffHours} giờ trước`;
    if (diffMins >= 1) return `${diffMins} phút trước`;
    return 'Vừa xong';
  }
  if (diffDays === 1) {
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    return `Hôm qua lúc ${h}:${m}`;
  }
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return d.toLocaleDateString('vi-VN');
}

function getGroupKey(createdAt) {
  if (!createdAt) return 'other';
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return 'other';
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return 'week';
  return 'other';
}

const GROUP_LABELS = { today: 'Hôm nay', yesterday: 'Hôm qua', week: 'Tuần này', other: 'Trước đó' };

const ALL_LABEL = 'Tất cả';
const FILTER_TYPES = [
  ALL_LABEL,
  'vaccine',
  'temperature',
  'points',
  'doctor',
  'reminder',
  'appointment',
  'other',
];
const FILTER_LABELS = {
  [ALL_LABEL]: 'Tất cả',
  vaccine: 'Tiêm chủng',
  temperature: 'Nhiệt độ',
  points: 'Điểm thưởng',
  doctor: 'Bác sĩ',
  reminder: 'Nhắc lịch',
  appointment: 'Lịch hẹn',
  other: 'Khác',
};

function groupNotifications(list) {
  const groups = { today: [], yesterday: [], week: [], other: [] };
  (list || []).forEach((item) => {
    const key = getGroupKey(item.created_at);
    if (groups[key]) groups[key].push(item);
    else groups.other.push(item);
  });
  return [
    { key: 'today', label: GROUP_LABELS.today, data: groups.today },
    { key: 'yesterday', label: GROUP_LABELS.yesterday, data: groups.yesterday },
    { key: 'week', label: GROUP_LABELS.week, data: groups.week },
    { key: 'other', label: GROUP_LABELS.other, data: groups.other },
  ].filter((g) => g.data.length > 0);
}

export default function NotificationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isLoggedIn } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) {
      setList([]);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const res = await getNotifications();
        if (res?.success && Array.isArray(res?.data)) {
          setList(
            res.data.map((item) => ({
              ...item,
              id: item.notification_id || item.id,
              title: item.title || item.type || 'Thông báo',
              content: item.content || '—',
            }))
          );
        } else {
          setList([]);
        }
      } catch (e) {
        console.warn('getNotifications error:', e?.message || e);
        setList([]);
      }
      setLoading(false);
    })();
  }, [isLoggedIn]);

  const openDetail = async (item) => {
    const id = item.notification_id || item.id;
    try {
      const res = await getNotificationById(id);
      const detail = res?.data || item;
      setSelectedNotification({
        ...item,
        ...detail,
        id: detail?.notification_id || detail?.id || id,
        title: detail?.title || item.title || item.type || 'Thông báo',
        content: detail?.content || item.content || '—',
      });
    } catch (e) {
      console.warn('openDetail getNotificationById error:', e?.message || e);
      setSelectedNotification(item);
    }
  };

  const closeDetail = () => {
    if (selectedNotification) {
      const id = selectedNotification.notification_id || selectedNotification.id;
      setList((prev) =>
        prev.map((i) => (String(i.notification_id || i.id) === String(id) ? { ...i, is_read: true } : i))
      );
    }
    setSelectedNotification(null);
  };

  const deleteNotification = async (item, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    const id = item.notification_id || item.id;
    try {
      await deleteNotificationApi(id);
    } catch (err) {
      console.warn('deleteNotificationApi error:', err?.message || err);
    }
    setList((prev) => prev.filter((i) => String(i.notification_id || i.id) !== String(id)));
  };

  const toggleType = (type) => {
    if (type === ALL_LABEL) {
      setSelectedTypes([]);
      return;
    }
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev.filter((t) => t !== ALL_LABEL), type]
    );
  };

  const isAllTypesSelected = selectedTypes.length === 0;
  const filteredList = list.filter((item) => {
    const q = (searchQuery || '').trim().toLowerCase();
    const matchSearch =
      !q ||
      (item.title || '').toLowerCase().includes(q) ||
      (item.content || '').toLowerCase().includes(q);
    const matchType =
      isAllTypesSelected || selectedTypes.includes(item.type);
    return matchSearch && matchType;
  });

  const groups = groupNotifications(filteredList);
  const filterPanelTop = insets.top + 70;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.pinkAccent} />
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Thông báo</Text>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
            <Ionicons name="ellipsis-vertical" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm thông báo..."
            placeholderTextColor={colors.textMuted}
          />
          <View style={styles.searchIconWrap}>
            <Ionicons name="search" size={22} color={colors.textMuted} />
          </View>
        </View>
        <TouchableOpacity
          style={styles.filterTrigger}
          onPress={() => setFilterVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="options-outline" size={24} color={colors.white} />
          {!isAllTypesSelected && selectedTypes.length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{selectedTypes.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {groups.length === 0 ? (
          <Text style={styles.empty}>Chưa có thông báo</Text>
        ) : (
          groups.map((group) => (
            <View key={group.key} style={styles.section}>
              <Text style={styles.sectionTitle}>{group.label}</Text>
              {group.data.map((item) => {
                const iconConfig = NOTIFICATION_ICONS[item.type] || NOTIFICATION_ICONS.default;
                const IconLib = iconConfig.lib;
                const isRead = !!item.is_read;
                return (
                  <View key={item.id || item.notification_id} style={[styles.card, isRead && styles.cardRead]}>
                    <TouchableOpacity
                      style={styles.cardTouch}
                      onPress={() => openDetail(item)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.cardIconWrap, { backgroundColor: iconConfig.bg }]}>
                        <IconLib name={iconConfig.name} size={22} color={iconConfig.color} />
                      </View>
                      <View style={styles.cardBody}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {item.title || item.type || 'Thông báo'}
                        </Text>
                        <Text style={styles.cardContent} numberOfLines={2}>
                          {item.content || '—'}
                        </Text>
                        <Text style={styles.cardTime}>{getTimeLabel(item.created_at)}</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cardDeleteBtn}
                      onPress={(e) => deleteNotification(item, e)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={filterVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.filterModalOverlayWrap}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setFilterVisible(false)} />
          <Pressable style={[styles.filterModalPanel, { marginTop: filterPanelTop }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Loại thông báo</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)} hitSlop={12}>
                <Ionicons name="checkmark" size={26} color={colors.pinkAccent} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.filterModalList} showsVerticalScrollIndicator={false}>
              {FILTER_TYPES.map((type) => {
                const selected = type === ALL_LABEL ? isAllTypesSelected : selectedTypes.includes(type);
                return (
                  <TouchableOpacity
                    key={type}
                    style={styles.filterItemRow}
                    onPress={() => toggleType(type)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterItemText, selected && styles.filterItemTextSelected]}>
                      {FILTER_LABELS[type] || type}
                    </Text>
                    {selected && (
                      <Ionicons name="checkmark" size={20} color={colors.pinkAccent} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </View>
      </Modal>

      <Modal visible={!!selectedNotification} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={closeDetail}>
          <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
            {selectedNotification && (
              <>
                <View style={styles.modalHeader}>
                  <View
                    style={[
                      styles.modalIconWrap,
                      {
                        backgroundColor:
                          (NOTIFICATION_ICONS[selectedNotification.type] || NOTIFICATION_ICONS.default).bg,
                      },
                    ]}
                  >
                    {(function () {
                      const cfg =
                        NOTIFICATION_ICONS[selectedNotification.type] || NOTIFICATION_ICONS.default;
                      const Lib = cfg.lib;
                      return <Lib name={cfg.name} size={28} color={cfg.color} />;
                    })()}
                  </View>
                  <TouchableOpacity style={styles.modalCloseBtn} onPress={closeDetail} hitSlop={12}>
                    <Ionicons name="close" size={24} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalTitle}>{selectedNotification.title || 'Thông báo'}</Text>
                <Text style={styles.modalTime}>{getTimeLabel(selectedNotification.created_at)}</Text>
                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalContent}>{selectedNotification.content || '—'}</Text>
                </ScrollView>
                <TouchableOpacity style={styles.modalBtn} onPress={closeDetail} activeOpacity={0.8}>
                  <Text style={styles.modalBtnText}>Đóng</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
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
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: -32,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 12,
    paddingLeft: 18,
    paddingRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(244, 171, 180, 0.3)',
    ...Platform.select({
      ios: { shadowColor: '#F4ABB4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily,
    color: colors.text,
    paddingVertical: 0,
  },
  searchIconWrap: { marginLeft: 8 },
  filterTrigger: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors.pinkAccent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    ...Platform.select({
      ios: { shadowColor: colors.pinkAccent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.blueAccent,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.white,
  },
  filterBadgeText: { fontSize: 11, fontWeight: '700', color: colors.white },
  filterModalOverlayWrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  filterModalPanel: {
    width: 200,
    marginRight: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: -2, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  filterModalList: {
    maxHeight: 260,
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  filterModalTitle: {
    fontSize: 14,
    fontFamily,
    fontWeight: '700',
    color: colors.text,
  },
  filterItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  filterItemText: { fontSize: 14, fontFamily, color: colors.textSecondary },
  filterItemTextSelected: { color: colors.pinkAccent, fontWeight: '600' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontFamily,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.pinkLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(244,171,180,0.35)',
    paddingTop: 15,
    paddingHorizontal: 12,
    paddingBottom: 12,
    marginBottom: 8,
    position: 'relative',
  },
  cardRead: {
    backgroundColor: colors.white,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  cardTouch: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', minWidth: 0 },
  cardDeleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardBody: { flex: 1, minWidth: 0, paddingRight: 36 },
  cardTitle: {
    fontSize: 15,
    fontFamily,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  cardContent: {
    fontSize: 14,
    fontFamily,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  cardTime: { fontSize: 12, fontFamily, color: colors.textMuted },
  empty: { color: colors.textSecondary, textAlign: 'center', paddingVertical: 40 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtn: { padding: 4 },
  modalTitle: {
    fontSize: 18,
    fontFamily,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  modalTime: { fontSize: 13, fontFamily, color: colors.textMuted, marginBottom: 12 },
  modalScroll: { maxHeight: 200, marginBottom: 16 },
  modalContent: {
    fontSize: 15,
    fontFamily,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  modalBtn: {
    backgroundColor: colors.pinkAccent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalBtnText: { fontSize: 16, fontFamily, fontWeight: '600', color: colors.white },
});
