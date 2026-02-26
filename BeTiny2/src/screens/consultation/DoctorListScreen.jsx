import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Platform,
  StatusBar,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getDoctors } from '../../api/doctorApi';
import { useAuth } from '../../context/AuthContext';
import { colors, typography } from '../../theme';

const { fontFamily } = typography;

const ALL_LABEL = 'Tất cả';
const SPECIALTIES = [
  ALL_LABEL,
  'Nhi khoa',
  'Dinh dưỡng',
  'Tai Mũi Họng',
  'Sơ sinh',
  'Tiêm chủng',
  'Tâm lý bé',
  'Da liễu',
  'Răng hàm mặt',
  'Mắt',
];

function isConsulting(doctor) {
  return doctor?.is_consulting === true || doctor?.status === 'busy' || doctor?.status === 'consulting';
}

function getDoctorDisplayName(fullName) {
  if (!fullName || typeof fullName !== 'string') return 'BS';
  const trimmed = fullName.trim();
  if (!trimmed) return 'BS';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const ten = parts.length > 0 ? parts[parts.length - 1] : trimmed;
  return `BS ${ten}`;
}

export default function DoctorListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getDoctors();
        if (res?.success && Array.isArray(res?.data)) {
          setDoctors(res.data);
        } else {
          setDoctors([]);
        }
      } catch (e) {
        setDoctors([]);
      }
      setLoading(false);
    })();
  }, []);

  const toggleSpecialty = (name) => {
    if (name === ALL_LABEL) {
      setSelectedSpecialties([]);
      return;
    }
    setSelectedSpecialties((prev) => {
      const next = prev.includes(name) ? prev.filter((s) => s !== name) : [...prev.filter((s) => s !== ALL_LABEL), name];
      return next;
    });
  };

  const isAllSelected = selectedSpecialties.length === 0;
  const goBack = () => navigation.navigate('Main', { screen: 'HomeTab' });
  const filterPanelTop = insets.top + 70;

  const filteredDoctors = doctors.filter((d) => {
    const matchSearch =
      !searchQuery.trim() ||
      (d.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.specialty || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchSpec =
      isAllSelected ||
      selectedSpecialties.some((s) => (d.specialty || '').toLowerCase().includes(s.toLowerCase()));
    return matchSearch && matchSpec;
  });

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
          <TouchableOpacity style={styles.headerBtn} onPress={goBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bác sĩ tư vấn</Text>
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

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm tên bác sĩ..."
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
          {!isAllSelected && selectedSpecialties.length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{selectedSpecialties.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

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
              <Text style={styles.filterModalTitle}>Chuyên khoa</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)} hitSlop={12}>
                <Ionicons name="checkmark" size={26} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.filterModalList} showsVerticalScrollIndicator={false}>
              {SPECIALTIES.map((name) => {
                const selected = name === ALL_LABEL ? isAllSelected : selectedSpecialties.includes(name);
                return (
                  <TouchableOpacity
                    key={name}
                    style={styles.filterItemRow}
                    onPress={() => toggleSpecialty(name)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterItemText, selected && styles.filterItemTextSelected]}>{name}</Text>
                    {selected && <Ionicons name="checkmark" size={20} color={colors.pinkAccent} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </View>
      </Modal>

      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item._id || item.doctor_id || item.id || String(Math.random())}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 75 }]}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có bác sĩ phù hợp</Text>}
        renderItem={({ item }) => {
          const doctorId = item._id || item.doctor_id || item.id;
          const rating = typeof item.rating === 'number' ? item.rating : (typeof item.avg_rating === 'number' ? item.avg_rating : 0);
          const value = Math.min(5, Math.max(0, rating));
          const consulting = isConsulting(item);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('DoctorDetail', { id: doctorId, doctor: item })}
              activeOpacity={0.85}
            >
              <View style={styles.cardAvatar}>
                {(item.avatar_url ?? item.avatar) ? (
                  <Image
                    source={
                      typeof (item.avatar_url ?? item.avatar) === 'number'
                        ? (item.avatar_url ?? item.avatar)
                        : { uri: item.avatar_url ?? item.avatar }
                    }
                    style={styles.cardAvatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.cardAvatarText}>
                    {(item.full_name || 'B').charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{getDoctorDisplayName(item.full_name)}</Text>
                <Text style={styles.cardMeta}>{item.specialty || '—'}</Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((i) => {
                    const full = value >= i;
                    const half = value >= i - 0.5 && value < i;
                    const name = full ? 'star' : half ? 'star-half' : 'star-outline';
                    return (
                      <Ionicons
                        key={i}
                        name={name}
                        size={12}
                        color="#FFB800"
                        style={{ marginRight: 2 }}
                      />
                    );
                  })}
                </View>
              </View>
              <View style={styles.cardRight}>
                <View style={styles.cardActionRow}>
                  <TouchableOpacity
                    style={styles.cardActionBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      navigation.navigate('Consultation', { doctorId, doctor: item });
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="calendar-outline" size={18} color={colors.white} />
                  </TouchableOpacity>
                  {consulting && (
                    <TouchableOpacity
                      style={styles.cardActionBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate('Chat', { doctorId, doctor: item });
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.white} />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: consulting ? '#E53935' : '#4CAF50' }]} />
                  <Text style={styles.statusText}>{consulting ? 'Đang tư vấn' : 'Đặt lịch'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
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
  headerTitle: { ...typography.H3, fontFamily, color: colors.white, fontWeight: '600' },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  pointsPillText: { fontSize: 13, fontFamily, fontWeight: '700', color: colors.white },
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
  list: { paddingHorizontal: 16, paddingTop: 0 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 171, 180, 0.2)',
    ...Platform.select({
      ios: { shadowColor: '#F4ABB4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  cardAvatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  cardAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  cardAvatarText: { fontSize: 20, fontWeight: '700', color: colors.pinkAccent, fontFamily },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 15, fontFamily, fontWeight: '700', color: colors.text, marginBottom: 2 },
  cardMeta: { fontSize: 12, fontFamily, color: colors.textMuted, marginBottom: 4 },
  starRow: { flexDirection: 'row', marginBottom: 0 },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  cardActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.pinkAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontFamily, color: colors.textSecondary },
  empty: { fontFamily, color: colors.textMuted, textAlign: 'center', padding: 32 },
});
