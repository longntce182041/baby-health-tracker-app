import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Image,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';

const { fontFamily } = typography;

const CENTERS = [
  {
    id: '1',
    name: 'Trung tâm Kiểm soát Bệnh tật',
    address: 'Số 400, Nguyễn Văn Cừ Nối Dài, An Bình, Ninh Kiều, Cần Thơ',
    distance: '1.6',
    rating: 4,
    available: true,
    image: null,
  },
  {
    id: '2',
    name: 'Bệnh viện Nhi đồng',
    address: 'Số 345, Nguyễn Văn Cừ Nối Dài, An Bình, Ninh Kiều, Cần Thơ',
    distance: '1.8',
    rating: 3,
    available: false,
    image: null,
  },
  {
    id: '3',
    name: 'VNVC Cần Thơ',
    address: 'Số 600, Nguyễn Văn Cừ Nối Dài, An Bình, Ninh Kiều, Cần Thơ',
    distance: '6.2',
    rating: 5,
    available: true,
    image: null,
  },
  {
    id: '4',
    name: 'Bệnh viện Đại học Nam Cần Thơ',
    address: 'Số 700, Nguyễn Văn Cừ Nối Dài, An Bình, Ninh Kiều, Cần Thơ',
    distance: '7.0',
    rating: 4,
    available: true,
    image: null,
  },
];

export default function VaccinationBookingScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const vaccineName = route.params?.vaccineName || 'Tiêm chủng';
  const vaccineId = route.params?.vaccineId;
  const babyId = route.params?.babyId;
  const [search, setSearch] = useState('');

  const filteredCenters = CENTERS.filter(
    (c) =>
      !search.trim() ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase()))
  );

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
          <Text style={styles.headerTitle} numberOfLines={1}>{vaccineName}</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredCenters.map((c) => (
          <View key={c.id} style={styles.card}>
            <View style={styles.cardImageWrap}>
              {c.image ? (
                <Image source={{ uri: c.image }} style={styles.cardImage} resizeMode="cover" />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <Ionicons name="business" size={32} color={colors.pinkLight} />
                </View>
              )}
            </View>
            <View style={styles.cardInfo}>
              <View style={[styles.statusBadge, c.available ? styles.badgeAvailable : styles.badgeFull]}>
                <Text style={[styles.statusBadgeText, c.available ? styles.badgeAvailableText : styles.badgeFullText]}>
                  {c.available ? 'Còn chỗ' : 'Hết chỗ'}
                </Text>
              </View>
              <Text style={styles.hospitalName} numberOfLines={2}>{c.name}</Text>
              <Text style={styles.hospitalAddress} numberOfLines={2}>{c.address}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>Cách {c.distance} km</Text>
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingText}>{c.rating} </Text>
                  <Ionicons name="star" size={12} color="#FFD93D" style={styles.ratingIcon} />
                </View>
              </View>
              <TouchableOpacity
                style={[styles.btnBook, !c.available && styles.btnBookDisabled]}
                activeOpacity={0.85}
                disabled={!c.available}
                onPress={() =>
                  c.available &&
                  navigation.navigate('VaccinationBookConfirm', {
                    vaccineName,
                    vaccineId,
                    centerId: c.id,
                    centerName: c.name,
                    centerAddress: c.address,
                    fee: '850,000 VND',
                    babyId,
                  })
                }
              >
                <Text style={[styles.btnBookText, !c.available && styles.btnBookTextDisabled]}>
                  {c.available ? 'Đặt lịch' : 'Hết chỗ'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
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
    flex: 1,
    fontSize: 18,
    fontFamily,
    color: colors.white,
    fontWeight: '600',
    marginHorizontal: 8,
    textAlign: 'center',
  },
  headerSpacer: { width: 40, height: 40 },

  searchWrapper: {
    paddingHorizontal: 16,
    marginTop: -24,
    marginBottom: 16,
  },
  searchBar: {
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
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily,
    color: colors.text,
    paddingVertical: 0,
    textAlign: 'center',
  },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8 },

  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 14,
    marginBottom: 16,
    gap: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  cardImageWrap: { flexShrink: 0 },
  cardImage: {
    width: 96,
    height: 96,
    borderRadius: 18,
  },
  cardImagePlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 18,
    backgroundColor: colors.pinkLight + '60',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, minWidth: 0 },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '700', fontFamily },
  badgeAvailable: { backgroundColor: '#E8F5E9' },
  badgeAvailableText: { color: '#4CAF50' },
  badgeFull: { backgroundColor: '#FFEBEB' },
  badgeFullText: { color: '#E53935' },
  hospitalName: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily,
    color: colors.text,
    marginBottom: 3,
    paddingRight: 68,
  },
  hospitalAddress: {
    fontSize: 11,
    fontFamily,
    color: colors.textMuted,
    lineHeight: 16,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metaText: { fontSize: 11, fontFamily, color: colors.textSecondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingIcon: { marginRight: 3 },
  ratingText: { fontSize: 11, fontFamily, fontWeight: '600', color: colors.text },
  btnBook: {
    backgroundColor: colors.pinkAccent,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 2,
    ...Platform.select({
      ios: { shadowColor: colors.pinkAccent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  btnBookDisabled: {
    backgroundColor: '#DDD',
    ...Platform.select({ ios: { shadowOpacity: 0 }, android: { elevation: 0 } }),
  },
  btnBookText: { fontSize: 12, fontWeight: '700', fontFamily, color: colors.white },
  btnBookTextDisabled: { color: colors.textMuted },
});
