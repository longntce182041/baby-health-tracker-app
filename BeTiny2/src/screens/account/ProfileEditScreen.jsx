import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  StatusBar,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile } from '../../api/userApi';
import { getItem, setItem } from '../../storage';
import { colors, typography } from '../../theme';

const { fontFamily } = typography;

const ROLES = [
  { id: 'mother', label: 'Mẹ' },
  { id: 'father', label: 'Bố' },
  { id: 'grandparent', label: 'Ông / Bà' },
  { id: 'other', label: 'Khác' },
];

export default function ProfileEditScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, isLoggedIn } = useAuth();
  const [profile, setProfile] = useState({ fullName: '', email: '', phone: '', wallet_point: 0, avatar_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState('mother');
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const [res, storedRole] = await Promise.all([getProfile(), getItem('user_role')]);
        if (storedRole && ROLES.some((r) => r.label === storedRole)) {
          setRole(ROLES.find((r) => r.label === storedRole)?.id || 'mother');
        }
        if (res?.success && res?.data) {
          const d = res.data;
          setProfile({
            fullName: d.fullName ?? d.full_name ?? '',
            email: d.email ?? '',
            phone: d.phone ?? user?.phone ?? '',
            wallet_point: d.wallet_point ?? 0,
            avatar_url: d.avatar_url ?? user?.avatar_url ?? '',
          });
          if (d.role && ROLES.some((r) => r.label === d.role)) {
            setRole(ROLES.find((r) => r.label === d.role)?.id || 'mother');
          }
        } else {
          setProfile((p) => ({
            ...p,
            fullName: user?.fullName ?? user?.full_name ?? '',
            email: user?.email ?? '',
            phone: user?.phone ?? p.phone,
            avatar_url: user?.avatar_url ?? p.avatar_url,
          }));
        }
      } catch (e) {
        setProfile((p) => ({
          ...p,
          fullName: user?.fullName ?? user?.full_name ?? '',
          email: user?.email ?? '',
          phone: user?.phone ?? p.phone,
          avatar_url: user?.avatar_url ?? p.avatar_url,
        }));
      }
      setLoading(false);
    })();
  }, [isLoggedIn, user]);

  const handleSave = async () => {
    const raw = profile.fullName || '';
    const cleaned = raw.replace(/\s+/g, ' ').trim();
    if (!cleaned || cleaned.length < 2) {
      Alert.alert('Lỗi', 'Họ và tên phải có ít nhất 2 ký tự.');
      setProfile((p) => ({ ...p, fullName: cleaned }));
      return;
    }
    if (cleaned.length > 70) {
      Alert.alert('Lỗi', 'Họ và tên tối đa 70 ký tự.');
      setProfile((p) => ({ ...p, fullName: cleaned.slice(0, 70) }));
      return;
    }

    setSaving(true);
    try {
      const r = ROLES.find((r) => r.id === role);
      await updateProfile({
        fullName: cleaned,
        phone: profile.phone,
        role: r?.label ?? 'Mẹ',
      });
      if (r) {
        await setItem('user_role', r.label);
      }
      Alert.alert('Thành công', 'Đã lưu thông tin');
    } catch (e) {
      Alert.alert('Lỗi', e?.message || 'Không thể cập nhật');
    }
    setSaving(false);
  };

  if (!isLoggedIn) {
    return (
      <View style={[styles.centered, styles.container]}>
        <Text style={styles.hint}>Bạn chưa đăng nhập</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        </View>
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              {(() => {
                const raw = profile.avatar_url ?? user?.avatar_url;
                if (typeof raw === 'string' && raw.trim().length > 0) {
                  return <Image source={{ uri: raw }} style={styles.avatarImage} resizeMode="cover" />;
                }
                if (typeof raw === 'number') {
                  return <Image source={raw} style={styles.avatarImage} resizeMode="cover" />;
                }
                return (
                  <Text style={styles.avatarText}>
                    {(profile.fullName || user?.fullName || 'P').charAt(0).toUpperCase()}
                  </Text>
                );
              })()}
            </View>
            <View style={styles.editIcon} pointerEvents="none">
              <Ionicons name="pencil" size={14} color={colors.blueAccent} />
            </View>
          </View>
        </View>
      </LinearGradient>

      <Modal visible={roleModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setRoleModalVisible(false)}>
          <Pressable style={styles.roleModalBox} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.roleModalTitle}>Chọn vai trò</Text>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.roleOption, role === r.id && styles.roleOptionActive]}
                onPress={() => {
                  setRole(r.id);
                  setRoleModalVisible(false);
                  setItem('user_role', r.label).catch(() => { });
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.roleOptionText, role === r.id && styles.roleOptionTextActive]}>{r.label}</Text>
                {role === r.id && <Ionicons name="checkmark" size={20} color={colors.pinkAccent} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.roleModalClose} onPress={() => setRoleModalVisible(false)}>
              <Text style={styles.roleModalCloseText}>Đóng</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Họ và tên</Text>
        <TextInput
          style={styles.input}
          value={profile.fullName}
          onChangeText={(v) => setProfile((p) => ({ ...p, fullName: v }))}
          placeholder="Họ và tên"
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.inputReadOnly]}
          value={profile.email}
          editable={false}
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.label}>Vai trò</Text>
        <TouchableOpacity
          style={styles.roleSelect}
          onPress={() => setRoleModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.roleSelectText}>{ROLES.find((r) => r.id === role)?.label || 'Mẹ'}</Text>
          <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={[styles.input, styles.inputReadOnly]}
          value={profile.phone}
          editable={false}
          placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity style={styles.btn} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.btnText}>Lưu thay đổi</Text>
          )}
        </TouchableOpacity>

        <View style={styles.walletCard}>
          <View style={styles.walletLeft}>
            <View style={styles.walletIconWrap}>
              <Ionicons name="wallet-outline" size={24} color={colors.pinkAccent} />
            </View>
            <View>
              <Text style={styles.walletLabel}>Điểm ví</Text>
              <Text style={styles.walletPoints}>{profile.wallet_point} điểm</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.napBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('TopUpPoints')}
          >
            <Ionicons name="add" size={20} color={colors.white} />
            <Text style={styles.napBtnText}>Nạp</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Transaction')} activeOpacity={0.8}>
          <Text style={styles.cardTitle}>Lịch sử giao dịch</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PackageList')} activeOpacity={0.8}>
          <Text style={styles.cardTitle}>Gói dịch vụ của tôi</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerGrad: { paddingBottom: 24, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarSection: { alignItems: 'center' },
  avatarWrapper: { position: 'relative', marginBottom: 0 },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: colors.white,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: colors.white, fontFamily },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...typography.H3, fontFamily, color: colors.white, fontWeight: '600', paddingLeft: 25 },
  scroll: { flex: 1 },
  content: { padding: 20 },
  label: { fontSize: 13, fontFamily, color: colors.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(244,171,180,0.3)',
    fontSize: 16,
    fontFamily,
    color: colors.text,
  },
  inputReadOnly: { color: colors.textMuted },
  inputLikeEmail: {},
  roleSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(244,171,180,0.3)',
  },
  roleSelectText: { fontSize: 16, fontFamily, color: colors.text },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  roleModalBox: { backgroundColor: colors.white, borderRadius: 16, padding: 20 },
  roleModalTitle: { fontSize: 16, fontFamily, fontWeight: '600', color: colors.text, marginBottom: 12 },
  roleOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4 },
  roleOptionActive: { backgroundColor: colors.pinkLight },
  roleOptionText: { fontSize: 15, fontFamily, color: colors.text },
  roleOptionTextActive: { fontWeight: '600', color: colors.pinkAccent },
  roleModalClose: { marginTop: 12, paddingVertical: 12, alignItems: 'center' },
  roleModalCloseText: { fontSize: 15, fontFamily, color: colors.textMuted },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(244,171,180,0.25)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  walletLeft: { flexDirection: 'row', alignItems: 'center' },
  walletIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  walletLabel: { fontSize: 13, fontFamily, color: colors.textMuted, marginBottom: 2 },
  walletPoints: { fontSize: 20, fontFamily, fontWeight: '700', color: colors.text },
  napBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.pinkAccent,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  napBtnText: { fontSize: 15, fontFamily, fontWeight: '600', color: colors.white },
  btn: {
    backgroundColor: colors.pinkAccent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  btnText: { color: colors.white, fontFamily, fontWeight: '600' },
  hint: { marginBottom: 16, color: colors.textSecondary },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(244,171,180,0.25)',
  },
  cardTitle: { fontSize: 15, fontFamily, fontWeight: '600', color: colors.text },
});
