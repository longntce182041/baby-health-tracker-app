import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, typography } from '../../theme';

const { fontFamily } = typography;
const PACKAGES = [
  { id: 'p1', label: 'Gói cơ bản', points: 50, price: '100.000đ' },
  { id: 'p2', label: 'Gói tiêu chuẩn', points: 120, price: '200.000đ', popular: true },
  { id: 'p3', label: 'Gói cao cấp', points: 300, price: '500.000đ' },
];

const PAYMENT_ICONS = [
  { key: 'visa', name: 'card-outline' },
  { key: 'master', name: 'card-outline' },
  { key: 'momo', name: 'phone-portrait-outline' },
  { key: 'more', name: 'ellipsis-horizontal', isMore: true },
];

export default function TopUpPointsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selectedPackageId, setSelectedPackageId] = useState('p2');

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
          <Text style={styles.headerTitle}>Nạp điểm</Text>
          <View style={styles.balancePill}>
            <Ionicons name="star" size={14} color={colors.pinkAccent} style={styles.balancePillIcon} />
            <Text style={styles.balancePillText}>{user?.wallet_point ?? 0}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.rateBox}>
          <Ionicons name="information-circle" size={20} color={colors.pinkAccent} style={styles.rateIcon} />
          <Text style={styles.rateTitle}>Giá trị quy đổi</Text>
          <Text style={styles.rateText}>• 10 tin nhắn văn bản = 1 điểm</Text>
          <Text style={styles.rateText}>• 1 phút gọi thoại/video = 5 điểm</Text>
        </View>

        <View style={styles.section}>
          {PACKAGES.map((pkg) => {
            const selected = selectedPackageId === pkg.id;
            return (
              <TouchableOpacity
                key={pkg.id}
                style={[styles.packageCard, selected && styles.packageCardSelected]}
                onPress={() => setSelectedPackageId(pkg.id)}
                activeOpacity={0.85}
              >
                {pkg.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>PHỔ BIẾN</Text>
                  </View>
                )}
                <View style={styles.pkgLeft}>
                  <Text style={styles.pkgLabel}>{pkg.label}</Text>
                  <Text style={styles.pkgPoints}>{pkg.points} điểm</Text>
                </View>
                <View style={styles.pkgPriceWrap}>
                  <Text style={styles.pkgPrice}>{pkg.price}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
        <View style={styles.methodGrid}>
          {PAYMENT_ICONS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.methodItem, item.isMore && styles.methodItemMore]}
              activeOpacity={0.8}
            >
              <Ionicons
                name={item.name}
                size={26}
                color={item.isMore ? colors.textMuted : colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.btnContinue}
          activeOpacity={0.85}
          onPress={() => {}}
        >
          <LinearGradient
            colors={[colors.pinkAccent, '#E895A0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.btnContinueGrad}
          >
            <Text style={styles.btnContinueText}>TIẾP TỤC THANH TOÁN</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerGrad: {
    paddingBottom: 48,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: 'rgba(244, 171, 180, 0.4)',
    ...Platform.select({
      ios: { shadowColor: colors.pinkAccent, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 10 },
      android: { elevation: 6 },
    }),
  },
  balancePillIcon: { marginRight: 3 },
  balancePillText: { fontSize: 13, fontFamily, fontWeight: '800', color: colors.pinkAccent },
  scroll: { flex: 1, marginTop: -32 },
  content: { paddingHorizontal: 16, paddingTop: 0 },
  rateBox: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.pinkAccent,
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#D4A5AD', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  rateIcon: { marginBottom: 6 },
  rateTitle: { fontSize: 14, fontFamily, fontWeight: '700', color: colors.text, marginBottom: 8 },
  rateText: { fontSize: 13, fontFamily, color: colors.textSecondary, lineHeight: 22 },
  section: { marginBottom: 28 },
  packageCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    ...Platform.select({
      ios: { shadowColor: '#D4A5AD', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  packageCardSelected: {
    borderColor: colors.pinkAccent,
    backgroundColor: '#FFF9FA',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 18,
    backgroundColor: colors.pinkAccent,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  popularBadgeText: { fontSize: 10, fontFamily, fontWeight: '800', color: colors.white },
  pkgLeft: {},
  pkgLabel: { fontSize: 12, fontFamily, color: colors.textMuted, marginBottom: 4 },
  pkgPoints: { fontSize: 18, fontFamily, fontWeight: '800', color: colors.text },
  pkgPriceWrap: {
    backgroundColor: colors.background,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  pkgPrice: { fontSize: 14, fontFamily, fontWeight: '800', color: colors.pinkAccent },
  sectionTitle: {
    fontSize: 15,
    fontFamily,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 14,
  },
  methodGrid: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginBottom: 32,
  },
  methodItem: {
    flex: 1,
    marginHorizontal: 6,
    height: 52,
    backgroundColor: colors.white,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  methodItemMore: { borderColor: colors.pinkLight },
  btnContinue: {
    borderRadius: 22,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: colors.pinkAccent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  btnContinueGrad: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContinueText: { fontSize: 15, fontFamily, fontWeight: '800', color: colors.white },
});
