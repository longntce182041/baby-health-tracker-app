import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  useWindowDimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getBabies } from '../../api/babyApi';
import { getProfile } from '../../api/userApi';
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

const avatarSizes = { sm: 32, sm2: 38, xs: 28, md: 44 };

function AvatarCircle({ initial, color = colors.pinkLight, size = 'md' }) {
  const letter = (initial || 'B').charAt(0).toUpperCase();
  const s = avatarSizes[size] ?? 44;
  return (
    <View style={[styles.avatar, { width: s, height: s, borderRadius: s / 2, backgroundColor: color }]}>
      <Text style={[styles.avatarText, size === 'sm' && { fontSize: 14 }, size === 'sm2' && { fontSize: 16 }, size === 'xs' && { fontSize: 12 }]}>{letter}</Text>
    </View>
  );
}

function BabyAvatar({ baby, size = 'md' }) {
  const s = avatarSizes[size] ?? 44;
  const avt = baby?.avt ?? baby?.avatar;
  if (avt) {
    const source = typeof avt === 'number' ? avt : { uri: avt };
    return (
      <Image
        source={source}
        style={[styles.avatar, styles.avatarImage, { width: s, height: s, borderRadius: s / 2 }]}
        resizeMode="cover"
      />
    );
  }
  return <AvatarCircle initial={getBabyDisplayInitial(baby?.full_name)} color={colors.pinkLight} size={size} />;
}

const BANNER_SLIDES = [
  { key: 'health', title: 'Đặt lịch', subtitle: 'Lên lịch hẹn định kỳ', onPress: 'schedule', icon: 'calendar-check', colors: ['#F4ABB4', '#ff004056'], blobTop: 'rgba(255, 67, 107, 0.27)', blobBottom: 'rgba(254, 211, 221, 0.5)', btnColor: '#C94A5A', shadowColor: '#F4ABB4', textDark: false },
  { key: 'vaccine', title: 'Tiêm chủng', subtitle: 'Xem lịch tiêm cho bé', onPress: 'vaccine', icon: 'needle', colors: ['#FED3DD', '#FFFFFF'], blobTop: 'rgba(254, 211, 221, 0.45)', blobBottom: 'rgba(255,255,255,0.5)', btnColor: '#E85A6B', shadowColor: '#FED3DD', textDark: true },
  { key: 'consult', title: 'Bác sĩ tư vấn', subtitle: 'Đặt lịch tư vấn', onPress: 'consult', icon: 'stethoscope', colors: ['#A8D5BA', '#E5F2E9'], blobTop: 'rgba(168, 213, 186, 0.5)', blobBottom: 'rgba(229, 242, 233, 0.6)', btnColor: '#5A9B72', shadowColor: '#A8D5BA', textDark: true },
];

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { isLoggedIn, user } = useAuth();
  const [babies, setBabies] = useState([]);
  const [selectedBaby, setSelectedBaby] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [userFullName, setUserFullName] = useState(
    user?.full_name ?? user?.fullName ?? 'bạn'
  );
  const bannerSlideWidth = screenWidth;
  const bannerCardMargin = 24;
  const bannerCardWidth = screenWidth - bannerCardMargin * 2;

  useEffect(() => {
    const fetch = async () => {
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
        console.error('Home getBabies:', err);
        setBabies([]);
        setSelectedBaby(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      setUserFullName('bạn');
      return;
    }
    (async () => {
      try {
        const res = await getProfile();
        if (res?.success && res?.data) {
          const d = res.data;
          const name = d.fullName ?? d.full_name ?? user?.fullName ?? user?.full_name;
          if (name) {
            setUserFullName(name);
            return;
          }
        }
        setUserFullName(user?.fullName ?? user?.full_name ?? 'bạn');
      } catch {
        setUserFullName(user?.fullName ?? user?.full_name ?? 'bạn');
      }
    })();
  }, [isLoggedIn, user]);

  const openBabyTab = () => {
    setDropdownVisible(false);
    navigation.navigate('BabyForm', {});
  };

  const openProfile = () => navigation.navigate('Profile');
  const openNotification = () => navigation.navigate('Notification');
  const openConsultationTab = () => navigation.getParent()?.navigate('ConsultationTab');
  const goVaccinationSchedule = (babyId) => {
    if (babyId) navigation.navigate('VaccinationSchedule', { babyId });
    else navigation.navigate('VaccinationSchedule');
  };
  const goVaccinationCatalog = (babyId) => {
    if (babyId) navigation.navigate('VaccinationCatalog', { babyId });
    else navigation.navigate('VaccinationCatalog');
  };
  const goVaccinationGuide = () => navigation.navigate('VaccinationGuide');
  const goVaccinationNotes = () => navigation.navigate('VaccinationNotes');
  const goHealthLog = () => {
    const id = selectedBaby?.baby_id || selectedBaby?.id;
    if (id) navigation.navigate('HealthLog', { babyId: id });
    else navigation.getParent()?.navigate('HealthTab');
  };

  const onBannerSlidePress = (slide) => {
    const babyId = selectedBaby?.baby_id || selectedBaby?.id;
    if (slide.onPress === 'schedule') {
      goVaccinationSchedule(babyId);
    } else if (slide.onPress === 'vaccine') {
      goVaccinationSchedule(babyId);
    } else if (slide.onPress === 'consult') {
      openConsultationTab();
    }
  };

  const handleBannerScroll = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / bannerSlideWidth);
    if (index >= 0 && index <= BANNER_SLIDES.length - 1) setBannerIndex(index);
  };

  if (loading) {
    return (
      <View style={styles.safe}>
        {Platform.OS === 'android' && <StatusBar backgroundColor={colors.white} barStyle="dark-content" />}
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.pinkAccent} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={colors.white} barStyle="dark-content" />}
      <View style={[styles.headerSection, { paddingTop: insets.top + 8, paddingBottom: 18 }]}>
        <View style={styles.header}>
          <View style={styles.babySelectorWrap}>
            {selectedBaby ? (
              <View style={styles.babySelectorBox}>
                <Pressable
                  style={styles.profileInfo}
                  onPress={() => navigation.navigate('BabyDetail', { id: selectedBaby.baby_id || selectedBaby.id, baby: selectedBaby })}
                >
                  <BabyAvatar baby={selectedBaby} size="sm2" />
                  <View style={styles.profileText}>
                    <Text style={styles.profileName} numberOfLines={1}>{getBabyDisplayName(selectedBaby.full_name)}</Text>
                    <Text style={styles.profileAge} numberOfLines={1} ellipsizeMode="tail">{getAgeString(selectedBaby.date_of_birth)}</Text>
                  </View>
                </Pressable>
                <TouchableOpacity style={styles.chevronBtn} onPress={() => setDropdownVisible(true)} activeOpacity={0.7}>
                  <Ionicons name="chevron-down" size={18} color={colors.pinkAccent} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.babySelectorBox} onPress={openBabyTab} activeOpacity={0.85}>
                <View style={[styles.avatarSm, styles.avatarAdd]}>
                  <Text style={styles.avatarAddText}>+</Text>
                </View>
                <Text style={styles.addProfileLabel}>Thêm hồ sơ bé</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.pinkAccent} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn} onPress={openNotification} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { marginLeft: 10 }]} onPress={openProfile} activeOpacity={0.7}>
              <Ionicons name="settings-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 50 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingWrap}>
          <Text style={styles.greeting}>Xin chào, {userFullName}!</Text>
        </View>
        <View style={styles.bannerCarouselWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleBannerScroll}
            snapToInterval={bannerSlideWidth}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={styles.bannerCarouselContent}
            style={[styles.bannerScrollView, { width: screenWidth }]}
          >
            {BANNER_SLIDES.map((slide) => (
              <View key={slide.key} style={[styles.bannerSlideWrapper, { width: bannerSlideWidth }]}>
                <TouchableOpacity
                  style={[styles.bannerCard, { width: bannerCardWidth, shadowColor: slide.shadowColor }]}
                  onPress={() => onBannerSlidePress(slide)}
                  activeOpacity={0.92}
                >
                  <LinearGradient colors={slide.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bannerGradient}>
                    <View style={[styles.bannerBlobTopRight, { backgroundColor: slide.blobTop }]} />
                    <View style={[styles.bannerBlobBottomLeft, { backgroundColor: slide.blobBottom }]} />
                    <View style={styles.bannerRectContent}>
                      <View style={styles.bannerTextBlock}>
                        <Text style={[styles.bannerTitle, slide.textDark && styles.bannerTitleDark]} numberOfLines={1}>{slide.title}</Text>
                        <Text style={[styles.bannerSubtitle, slide.textDark && styles.bannerSubtitleDark]} numberOfLines={1}>{slide.subtitle}</Text>
                        <View style={styles.bannerBtn}>
                          <Text style={[styles.bannerBtnText, { color: slide.btnColor }]}>Đặt lịch</Text>
                          <Ionicons name="chevron-forward" size={14} color={slide.btnColor} style={{ marginLeft: 2 }} />
                        </View>
                      </View>
                      <View style={styles.bannerIconWrap}>
                        <MaterialCommunityIcons name={slide.icon} size={32} color={slide.textDark ? colors.textSecondary : colors.white} />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {BANNER_SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === bannerIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quản lý tiêm chủng</Text>
        <View style={styles.grid}>
          <TouchableOpacity
            style={[styles.gridCard, styles.gridCard1]}
            onPress={() => goVaccinationCatalog(selectedBaby?.baby_id || selectedBaby?.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.gridIconWrap, { backgroundColor: 'rgba(244,171,180,0.5)' }]}>
              <MaterialCommunityIcons name="clock-outline" size={26} color={colors.pinkAccent} />
            </View>
            <Text style={styles.gridCardTitle}>Danh mục vắc xin</Text>
            <Text style={[styles.gridLink, { color: colors.pinkAccent }]}>Xem thêm →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridCard, styles.gridCard2]}
            onPress={goVaccinationGuide}
            activeOpacity={0.8}
          >
            <View style={[styles.gridIconWrap, { backgroundColor: 'rgba(126,171,208,0.5)' }]}>
              <Ionicons name="search" size={24} color={colors.blueAccent} />
            </View>
            <Text style={styles.gridCardTitle}>Những điều cần thực hiện</Text>
            <Text style={[styles.gridLink, { color: colors.blueAccent }]}>Xem thêm →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridCard, styles.gridCard3]}
            onPress={goVaccinationNotes}
            activeOpacity={0.8}
          >
            <View style={[styles.gridIconWrap, { backgroundColor: 'rgba(156,123,168,0.4)' }]}>
              <MaterialCommunityIcons name="heart-pulse" size={26} color="#9C7BA8" />
            </View>
            <Text style={styles.gridCardTitle}>Lưu ý khi tiêm chủng</Text>
            <Text style={[styles.gridLink, { color: '#9C7BA8' }]}>Xem thêm →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridCard, styles.gridCard4]}
            onPress={() => goVaccinationSchedule(selectedBaby?.baby_id || selectedBaby?.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.gridIconWrap, { backgroundColor: 'rgba(196,149,106,0.4)' }]}>
              <MaterialCommunityIcons name="calendar" size={24} color="#C4956A" />
            </View>
            <Text style={styles.gridCardTitle}>Đặt lịch tiêm chủng cho bé</Text>
            <Text style={[styles.gridLink, { color: '#C4956A' }]}>Xem thêm →</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={dropdownVisible} transparent animationType="fade">
          <Pressable style={[styles.modalOverlay, { paddingTop: insets.top + 70 }]} onPress={() => setDropdownVisible(false)}>
            <Pressable style={styles.dropdown} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.dropdownTitle}>Chọn hồ sơ bé</Text>
              <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
                {babies.map((b, idx) => {
                  const sid = selectedBaby?.baby_id ?? selectedBaby?.id;
                  const bid = b.baby_id ?? b.id;
                  const isSelected = sid != null && bid != null && String(sid) === String(bid);
                  return (
                    <TouchableOpacity
                      key={b.baby_id || b.id}
                      style={[
                        styles.dropdownItem,
                        isSelected && styles.dropdownItemSelected,
                        idx === babies.length - 1 && styles.dropdownItemLast,
                      ]}
                      onPress={() => {
                        setSelectedBaby(b);
                        setDropdownVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <BabyAvatar baby={b} size="sm" />
                      <View style={styles.dropdownItemText}>
                        <Text style={[styles.dropdownItemName, isSelected && styles.dropdownItemNameSelected]}>
                          {getBabyDisplayName(b.full_name)}
                        </Text>
                        <Text style={styles.dropdownItemAge}>{getAgeString(b.date_of_birth)}</Text>
                      </View>
                      <View style={[styles.dropdownItemBadge, isSelected && styles.dropdownItemBadgeSelected]}>
                        <Ionicons name="qr-code-outline" size={16} color={isSelected ? colors.pinkAccent : colors.textMuted} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity style={styles.dropdownAdd} onPress={openBabyTab} activeOpacity={0.7}>
                <View style={styles.dropdownAddIcon}>
                  <Ionicons name="add" size={22} color={colors.pinkAccent} />
                </View>
                <Text style={styles.dropdownAddLabel}>Thêm hồ sơ bé</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily,
    color: colors.textSecondary,
  },
  headerSection: {
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244, 171, 180, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingWrap: {
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 4,
    backgroundColor: colors.background,
  },
  greeting: {
    fontSize: 16,
    fontFamily,
    color: '#1D1D1D',
    fontWeight: '700',
  },
  babySelectorWrap: {
    flex: 1,
    maxWidth: '70%',
    marginLeft: -6,
    marginTop: 6,
  },
  babySelectorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    maxWidth: '65%',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  chevronBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginTop: -18,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { backgroundColor: colors.pinkLight },
  avatarText: { fontSize: 16, fontWeight: '700', color: colors.pinkAccent },
  avatarSm: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarAdd: { backgroundColor: colors.pinkLight },
  avatarAddText: { fontSize: 18, fontWeight: '700', color: colors.pinkAccent },
  profileText: { marginLeft: 10, flex: 1, minWidth: 0, justifyContent: 'center' },
  profileName: { fontSize: 14, fontFamily, color: colors.text, fontWeight: '600', letterSpacing: 0.2 },
  profileAge: { fontSize: 11, fontFamily, color: colors.textMuted, marginTop: 2, letterSpacing: 0.15 },
  addProfileLabel: { fontSize: 13, fontFamily, color: colors.text, marginLeft: 8, fontWeight: '600' },
  headerIcons: { flexDirection: 'row' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F4ABB4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerCarouselWrap: { marginBottom: 30, marginHorizontal: -24 },
  bannerScrollView: { flexGrow: 0 },
  bannerCarouselContent: { paddingVertical: 6 },
  bannerSlideWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerCard: {
    borderRadius: 28,
    overflow: 'hidden',
    height: 148,
    shadowColor: '#F4ABB4',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
  bannerGradient: {
    flex: 1,
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 26,
    justifyContent: 'center',
    position: 'relative',
  },
  bannerBlobTopRight: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  bannerBlobBottomLeft: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  bannerRectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    zIndex: 1,
  },
  bannerTextBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 16,
  },
  bannerTitle: {
    fontSize: 20,
    fontFamily,
    color: colors.white,
    marginBottom: 8,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  bannerTitleDark: { color: colors.text },
  bannerSubtitle: {
    fontSize: 12,
    fontFamily,
    color: 'rgba(255, 255, 255, 0.81)',
    marginBottom: 14,
    lineHeight: 20,
  },
  bannerSubtitleDark: { color: colors.textSecondary },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerBtnText: { fontSize: 12, fontFamily, fontWeight: '700' },
  bannerIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text,
    opacity: 1,
  },
  sectionTitle: { ...typography.H2, fontFamily, color: colors.text, marginBottom: 14, fontWeight: '800' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    marginBottom: 12,
  },
  gridIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridCardTitle: { ...typography.PMedium, fontFamily, color: colors.text, marginBottom: 4, fontWeight: '600', fontSize: 13 },
  gridLink: { ...typography.PSmall, fontFamily, fontWeight: '500', fontSize: 11 },
  gridCard1: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.pinkLight,
    shadowColor: '#F4ABB4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  gridCard2: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.pinkLight,
    shadowColor: '#F4ABB4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  gridCard3: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.pinkLight,
    shadowColor: '#F4ABB4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  gridCard4: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.pinkLight,
    shadowColor: '#F4ABB4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  quickSection: { gap: 14 },
  quickCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.pinkLight,
    shadowColor: '#F4ABB4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  quickCardTitle: { ...typography.H3, fontFamily, color: colors.text, marginBottom: 4, fontWeight: '600' },
  quickCardDesc: { ...typography.PSmall, fontFamily, color: colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', paddingHorizontal: 20 },
  dropdownScroll: { maxHeight: 260 },
  dropdown: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(244,171,180,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownTitle: {
    fontSize: 13,
    fontFamily,
    color: colors.textMuted,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 4,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(244,171,180,0.5)',
  },
  dropdownItemLast: { marginBottom: 0 },
  dropdownItemSelected: {
    backgroundColor: 'rgba(254,211,221,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(244,171,180,0.4)',
  },
  dropdownItemText: { marginLeft: 12, flex: 1, minWidth: 0 },
  dropdownItemName: { fontSize: 16, fontFamily, color: colors.text, fontWeight: '600' },
  dropdownItemNameSelected: { color: colors.pinkAccent, fontWeight: '700' },
  dropdownItemAge: { fontSize: 12, fontFamily, color: colors.textSecondary, marginTop: 2 },
  dropdownItemBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownItemBadgeSelected: { backgroundColor: 'rgba(244,171,180,0.2)' },
  dropdownAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(244,171,180,0.25)',
  },
  dropdownAddIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownAddLabel: { fontSize: 15, fontFamily, color: colors.pinkAccent, marginLeft: 12, fontWeight: '700' },
});
