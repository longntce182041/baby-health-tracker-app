import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getBabies } from '../../api/babyApi';
import { getBabyDisplayName, getBabyDisplayInitial } from '../../utils/babyDisplay';
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

function AvatarCircle({ initial, color = colors.pinkLight }) {
  const letter = (initial || 'B').charAt(0).toUpperCase();
  return (
    <View style={[styles.avatar, { backgroundColor: color }]}>
      <Text style={styles.avatarText}>{letter}</Text>
    </View>
  );
}

export default function BabyListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isLoggedIn } = useAuth();
  const [babies, setBabies] = useState([]);
  const [selectedBaby, setSelectedBaby] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [qrVisible, setQrVisible] = useState(false);
  const [qrBaby, setQrBaby] = useState(null);

  const load = async () => {
    setLoading(true);
    if (!isLoggedIn) {
      setBabies([]);
      setSelectedBaby(null);
      setLoading(false);
      return;
    }
    try {
      const res = await getBabies();
      const list = Array.isArray(res?.data) ? res.data : [];
      setBabies(list);
      setSelectedBaby(list.length > 0 ? list[0] : null);
    } catch (err) {
      console.error('BabyList getBabies:', err);
      setBabies([]);
      setSelectedBaby(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isLoggedIn]);

  const onSelectBaby = (baby) => {
    setSelectedBaby(baby);
    setDropdownVisible(false);
    navigation.navigate('BabyDetail', { id: baby.baby_id || baby.id, baby });
  };

  const openAddBaby = () => {
    setDropdownVisible(false);
    navigation.navigate('BabyForm', {});
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.pinkAccent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          <Text style={styles.headerTitle}>Bé của mẹ</Text>
          <View style={{ width: 40, height: 40 }} />
        </View>
      </LinearGradient>

      <FlatList
        style={styles.listContainer}
        data={babies}
        keyExtractor={(item) => item.baby_id || item.id || String(Math.random())}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Chưa có bé nào.</Text>
            <TouchableOpacity style={styles.addBtn} onPress={openAddBaby}>
              <Text style={styles.addBtnText}>+ Thêm bé</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addMemberCard}
            onPress={openAddBaby}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={22} color={colors.textSecondary} style={styles.addMemberIcon} />
            <Text style={styles.addMemberText}>Thêm thành viên mới</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => {
          const isSelected = selectedBaby?.baby_id === item.baby_id || selectedBaby?.id === item.id;
          const ageText = getAgeString(item.date_of_birth);
          const weight = item.weight ?? '—';
          const height = item.height ?? '—';
          const genderLabel =
            (item.gender || '').toLowerCase().includes('nữ') ? 'Bé Gái' :
              (item.gender || '').toLowerCase().includes('nam') ? 'Bé Trai' :
                null;
          const isGirl = genderLabel === 'Bé Gái';
          const vaccCompleted = item.vacc_completed ?? 0;
          const vaccTotal = item.vacc_total ?? 0;
          const vaccPercent = vaccTotal > 0 ? Math.min(100, Math.round((vaccCompleted / vaccTotal) * 100)) : 0;
          const vaccText =
            vaccTotal > 0 ? `Tiêm chủng: ${vaccCompleted}/${vaccTotal} mũi` : 'Tiêm chủng: Đang cập nhật';

          return (
            <TouchableOpacity
              style={[styles.babyCard, isSelected && styles.babyCardActive]}
              onPress={() => navigation.navigate('BabyDetail', { id: item.baby_id || item.id, baby: item })}
              activeOpacity={0.85}
            >
              <View style={styles.avatarWrap}>
                <AvatarCircle
                  initial={getBabyDisplayInitial(item.full_name)}
                  color={colors.pinkLight}
                />
              </View>
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.babyName} numberOfLines={1}>
                    {getBabyDisplayName(item.full_name)}
                  </Text>
                  {genderLabel && (
                    <View style={[styles.genderTag, isGirl ? styles.girlTag : styles.boyTag]}>
                      <Text style={styles.genderTagText}>{genderLabel}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} style={styles.metaIcon} />
                  <Text style={styles.babyMeta}>{ageText || '—'}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="scale-outline" size={14} color={colors.textSecondary} style={styles.metaIcon} />
                  <Text style={styles.babyMeta}>{weight} kg</Text>
                  <Ionicons
                    name="resize-outline"
                    size={14}
                    color={colors.textSecondary}
                    style={[styles.metaIcon, { marginLeft: 12 }]}
                  />
                  <Text style={styles.babyMeta}>{height} cm</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={colors.textMuted}
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </View>
              <TouchableOpacity
                style={styles.qrBtn}
                onPress={() => {
                  setQrBaby(item);
                  setQrVisible(true);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="qr-code-outline" size={22} color={colors.text} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={dropdownVisible} transparent animationType="fade">
        <Pressable
          style={[styles.modalOverlay, { paddingTop: insets.top + 80 }]}
          onPress={() => setDropdownVisible(false)}
        >
          <Pressable style={styles.dropdown} onPress={(e) => e.stopPropagation()}>
            {babies.map((b) => {
              const sid = selectedBaby?.baby_id ?? selectedBaby?.id;
              const bid = b.baby_id ?? b.id;
              const isSelected = sid != null && bid != null && String(sid) === String(bid);
              return (
                <TouchableOpacity
                  key={b.baby_id || b.id}
                  style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                  onPress={() => onSelectBaby(b)}
                  activeOpacity={0.7}
                >
                  <AvatarCircle
                    initial={getBabyDisplayInitial(b.full_name)}
                    color={colors.pinkLight}
                  />
                  <View style={styles.dropdownItemText}>
                    <Text style={styles.dropdownItemName}>{getBabyDisplayName(b.full_name)}</Text>
                    <Text style={styles.dropdownItemAge}>{getAgeString(b.date_of_birth)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setQrVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="qr-code-outline" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={styles.dropdownAdd} onPress={openAddBaby} activeOpacity={0.7}>
              <View style={styles.dropdownAddIcon}>
                <Text style={styles.dropdownAddPlus}>+</Text>
              </View>
              <Text style={styles.dropdownAddLabel}>Thêm hồ sơ bé</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={qrVisible} transparent animationType="fade">
        <Pressable style={styles.qrOverlay} onPress={() => setQrVisible(false)}>
          <View style={styles.qrCard}>
            <View style={styles.qrBox}>
              <Ionicons name="qr-code-outline" size={180} color={colors.text} />
            </View>
            {qrBaby && (
              <Text style={styles.qrBabyName} numberOfLines={1}>
                {getBabyDisplayName(qrBaby.full_name)}
              </Text>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  hint: { marginBottom: 16, color: colors.textSecondary, textAlign: 'center' },
  btn: { backgroundColor: colors.pinkAccent, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  btnText: { color: colors.white, fontWeight: '600' },

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
  qrBabyName: {
    marginTop: 8,
    fontSize: 14,
    fontFamily,
    fontWeight: '600',
    color: colors.text,
  },

  headerGrad: {
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  headerTextBlock: { alignItems: 'flex-start' },
  headerBig: {
    fontSize: 22,
    fontFamily,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily,
    color: 'rgba(255,255,255,0.9)',
  },

  listContainer: {
    flex: 1,
    marginTop: -30,
    zIndex: 1,
  },
  list: { paddingHorizontal: 20, paddingBottom: 120 },

  babyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 25,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F2F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16 },
      android: { elevation: 3 },
    }),
  },
  babyCardActive: {
    borderWidth: 2,
    borderColor: colors.pinkAccent,
  },
  avatarWrap: { marginRight: 14 },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.pinkAccent },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  babyName: {
    fontSize: 17,
    fontFamily,
    fontWeight: '700',
    color: colors.text,
  },
  genderTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 6,
  },
  girlTag: { backgroundColor: '#FFEBEF' },
  boyTag: { backgroundColor: '#E1F5FE' },
  genderTagText: {
    fontSize: 10,
    fontFamily,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: colors.text,
  },
  babyMeta: {
    marginTop: 4,
    fontSize: 13,
    fontFamily,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaIcon: { marginRight: 4 },
  qrBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#EEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  addMemberCard: {
    marginTop: 8,
    marginBottom: 32,
    paddingVertical: 18,
    borderRadius: 25,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.pinkLight,
    backgroundColor: '#FFF9FA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMemberIcon: { marginRight: 10 },
  addMemberText: {
    fontSize: 14,
    fontFamily,
    fontWeight: '800',
    color: colors.pinkAccent,
  },

  addBtn: {
    marginTop: 12,
    backgroundColor: colors.pinkAccent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
  },
  addBtnText: { color: colors.white, fontWeight: '600' },
  empty: { padding: 24, alignItems: 'center' },
  emptyText: { color: colors.textSecondary, marginBottom: 12 },

  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.pinkAccent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: colors.pinkAccent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 20 },
  dropdown: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.pinkLight,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(244,171,180,0.5)',
  },
  dropdownItemSelected: { backgroundColor: colors.pinkLight, borderColor: 'rgba(244,171,180,0.4)' },
  dropdownItemText: { marginLeft: 12, flex: 1 },
  dropdownItemName: { ...typography.H3, fontFamily, color: colors.text, fontWeight: '600' },
  dropdownItemAge: { ...typography.PSmall, fontFamily, color: colors.textSecondary, marginTop: 2 },
  dropdownAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.pinkLight,
  },
  dropdownAddIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownAddPlus: { fontSize: 22, fontWeight: '700', color: colors.pinkAccent },
  dropdownAddLabel: { ...typography.H3, fontFamily, color: colors.pinkAccent, marginLeft: 12, fontWeight: '600' },
});
