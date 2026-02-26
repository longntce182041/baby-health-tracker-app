import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../api/userApi';
import { getItem } from '../../storage';
import { colors, typography } from '../../theme';

const { fontFamily } = typography;

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, isLoggedIn, logout } = useAuth();
  const [profile, setProfile] = useState({ fullName: '', email: '', phone: '', wallet_point: 0, avatar_url: '' });
  const [loading, setLoading] = useState(true);
  const [roleLabel, setRoleLabel] = useState('Mẹ');

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const res = await getProfile();
        if (res?.success && res?.data) {
          const d = res.data;
          setProfile({
            fullName: d.fullName ?? d.full_name ?? user?.fullName ?? user?.full_name ?? '',
            email: d.email ?? user?.email ?? '',
            phone: d.phone ?? user?.phone ?? '',
            wallet_point: d.wallet_point ?? 0,
            avatar_url: d.avatar_url ?? user?.avatar_url ?? '',
          });
          if (d.role) {
            setRoleLabel(d.role);
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
  }, [isLoggedIn]);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          const stored = await getItem('user_role');
          if (stored) setRoleLabel(stored);
        } catch (e) { }
      })();
    }, [])
  );

  const goHome = () => navigation.navigate('Main', { screen: 'HomeTab' });
  const goToProfileEdit = () => navigation.navigate('ProfileEdit');

  const handleLogout = () => {
    if (logout) logout();
    navigation.navigate('Main', { screen: 'HomeTab' });
  };

  const displayName = profile.fullName || user?.fullName || user?.full_name || 'Phụ huynh';
  const initial = (displayName.trim() || 'P').charAt(0).toUpperCase();
  const avatarRaw = profile.avatar_url ?? user?.avatar_url;

  if (!isLoggedIn) {
    return (
      <View style={[styles.centered, styles.container]}>
        <Text style={styles.title}>Cá nhân</Text>
        <Text style={styles.hint}>Bạn chưa đăng nhập</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.btnText}>Đăng nhập</Text>
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
          <TouchableOpacity style={styles.headerBtn} onPress={goHome} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tài khoản</Text>
          <TouchableOpacity style={styles.headerBtn} onPress={handleLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarCircle} onPress={goToProfileEdit} activeOpacity={0.9}>
            {typeof avatarRaw === 'string' && avatarRaw.trim().length > 0 ? (
              <Image source={{ uri: avatarRaw }} style={styles.avatarImage} resizeMode="cover" />
            ) : typeof avatarRaw === 'number' ? (
              <Image source={avatarRaw} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.parentName} numberOfLines={1}>{displayName}</Text>
          <Text style={styles.parentRole}>Vai trò: {roleLabel}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>QUẢN LÝ TÀI KHOẢN</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity style={styles.settingsItem_1} onPress={goToProfileEdit} activeOpacity={0.7}>
            <View style={styles.itemIcon}>
              <Ionicons name="person-outline" size={22} color={colors.blueAccent} />
            </View>
            <Text style={styles.itemLabel}>Thông tin cá nhân</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>ỨNG DỤNG</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
            <View style={styles.itemIcon}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.blueAccent} />
            </View>
            <Text style={styles.itemLabel}>Bảo mật & Quyền riêng tư</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsItem_1} activeOpacity={0.7}>
            <View style={styles.itemIcon}>
              <Ionicons name="help-circle-outline" size={22} color={colors.blueAccent} />
            </View>
            <Text style={styles.itemLabel}>Hỗ trợ & Góp ý</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btnLogout} onPress={handleLogout} activeOpacity={0.7}>
          <View style={styles.btnLogoutIconWrap}>
            <Ionicons name="log-out-outline" size={24} color={colors.pinkAccent} />
          </View>
          <Text style={styles.btnLogoutText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 24, color: colors.text },
  hint: { marginBottom: 16, color: colors.textSecondary, fontSize: 16, width: '90%', textAlign: 'center' },
  btn: { backgroundColor: colors.pinkAccent, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  btnText: { color: colors.white, fontWeight: '600' },
  headerGrad: {
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
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
  headerTitle: { ...typography.H3, fontFamily, color: colors.white, fontWeight: '600' },
  avatarSection: { alignItems: 'center' },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: colors.white,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: colors.white, fontFamily },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  parentName: { fontSize: 20, fontFamily, fontWeight: '700', color: colors.white, marginBottom: 4 },
  parentRole: { fontSize: 14, fontFamily, color: 'rgba(255,255,255,0.9)' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 24 },
  sectionLabel: {
    fontSize: 12,
    fontFamily,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  settingsGroup: {
    backgroundColor: colors.white,
    borderRadius: 25,
    padding: 8,
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
  },
  settingsItem_1: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  settingsItemLast: { borderBottomWidth: 0 },
  itemIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.background,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemLabel: { flex: 1, fontSize: 15, fontFamily, fontWeight: '500', color: colors.text },
  btnLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(244,171,180,0.3)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  btnLogoutIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLogoutText: { fontSize: 16, fontFamily, fontWeight: '700', color: colors.pinkAccent },
});
