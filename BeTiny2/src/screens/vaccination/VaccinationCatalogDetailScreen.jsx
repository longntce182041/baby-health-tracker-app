import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';
import { VACCINES } from '../../data/vaccinationCatalog';

const { fontFamily } = typography;
const PINK = '#F4ABB4';

export default function VaccinationCatalogDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { vaccineId, babyId } = route.params || {};
  const vaccine = VACCINES.find((v) => v.id === vaccineId) || VACCINES[0];
  const schedule = vaccine.schedule || [];
  const sideEffects = vaccine.sideEffects || [];
  const contraindication = vaccine.contraindication || 'Tham khảo chỉ dẫn của bác sĩ trước khi tiêm.';

  const doseMatch = (vaccine.doses || '').match(/^(\d+)\s+(.+)$/);
  const doseValue = doseMatch ? doseMatch[1] : vaccine.doses || '—';
  const doseLabel = doseMatch ? doseMatch[2] : 'Số mũi';
  const ageValue = vaccine.ageRange || '—';
  const originValue = vaccine.origin || '—';

  return (
    <View style={styles.container}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={PINK} barStyle="light-content" />}
      <LinearGradient
        colors={[PINK, '#FED3DD']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Chi tiết vắc xin</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.quickInfo}>
          <Text style={styles.quickInfoName} numberOfLines={2}>{vaccine.name}</Text>
          <View style={styles.quickInfoRowBlock}>
            <View style={styles.quickInfoImageWrap}>
              {vaccine.imageSource ? (
                <Image source={vaccine.imageSource} style={styles.quickInfoImage} resizeMode="contain" />
              ) : (
                <View style={styles.quickInfoImagePlaceholder}>
                  <Ionicons name="medical" size={32} color={PINK} />
                </View>
              )}
            </View>
            <View style={styles.quickInfoBody}>
              <View style={styles.quickInfoRow}>
                <Text style={styles.quickInfoLabel}>Số mũi</Text>
                <Text style={styles.quickInfoValue}>{doseValue}</Text>
              </View>
              <View style={styles.quickInfoRow}>
                <Text style={styles.quickInfoLabel}>Độ tuổi</Text>
                <Text style={styles.quickInfoValue} numberOfLines={1}>{ageValue}</Text>
              </View>
              <View style={styles.quickInfoRow}>
                <Text style={styles.quickInfoLabel}>Xuất xứ</Text>
                <Text style={styles.quickInfoValue} numberOfLines={1}>{originValue}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="document-text-outline" size={18} color={PINK} />
            <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailText}>{vaccine.detail}</Text>
          </View>
        </View>

        {vaccine.preventionDesc && vaccine.preventionSolution && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="shield-plus-outline" size={18} color={PINK} />
              <Text style={styles.sectionTitle}>Cách phòng tránh bệnh</Text>
            </View>
            <View style={styles.preventionCard}>
              <Text style={styles.preventionDesc}>{vaccine.preventionDesc}</Text>
              <View style={styles.preventionSolutionWrap}>
                <MaterialCommunityIcons name="shield-check" size={20} color={colors.blueAccent} style={styles.preventionSolutionIcon} />
                <Text style={styles.preventionSolutionText}>{vaccine.preventionSolution}</Text>
              </View>
            </View>
          </View>
        )}

        {schedule.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="medical-outline" size={18} color={PINK} />
              <Text style={styles.sectionTitle}>Lịch tiêm khuyến nghị</Text>
            </View>
            <View style={styles.scheduleCard}>
              {schedule.map((step, i) => (
                <View key={i} style={styles.scheduleStep}>
                  <View style={styles.stepDotWrap}>
                    <View style={styles.stepDot} />
                    {i < schedule.length - 1 && <View style={styles.stepLine} />}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {sideEffects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="shield-checkmark-outline" size={18} color={PINK} />
              <Text style={styles.sectionTitle}>Phản ứng sau tiêm</Text>
            </View>
            <View style={styles.effectRow}>
              <View style={styles.effectCard}>
                {(sideEffects.slice(0, 2) || []).map((eff, i) => (
                  <View key={i} style={[styles.effectRowItem, i === 1 && styles.effectRowItemLast]}>
                    <Ionicons name="ellipse" size={6} color="#F59E0B" style={styles.effectBullet} />
                    <Text style={styles.effectText} numberOfLines={2}>{eff}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.effectCard}>
                {(sideEffects.slice(2, 4) || []).map((eff, i) => (
                  <View key={i} style={[styles.effectRowItem, i === 1 && styles.effectRowItemLast]}>
                    <Ionicons name="ellipse" size={6} color="#F59E0B" style={styles.effectBullet} />
                    <Text style={styles.effectText} numberOfLines={2}>{eff}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="warning-outline" size={18} color={PINK} />
            <Text style={styles.sectionTitle}>Chống chỉ định</Text>
          </View>
          <View style={styles.contraBox}>
            <Text style={styles.contraText}>{contraindication}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() =>
            navigation.navigate('VaccinationBooking', {
              vaccineName: vaccine.name.replace(/\s+/g, ' ').trim(),
              vaccineId: vaccine.id,
              babyId,
            })
          }
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>Đăng ký tiêm ngay</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', overflow: 'visible' },
  header: {
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
  backBtn: {
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
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerSpacer: { width: 40, height: 40 },

  scrollContainer: {
    flex: 1,
    marginTop: -28,
    backgroundColor: 'transparent',
  },
  content: { paddingHorizontal: 16, paddingTop: 0 },

  quickInfo: {
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(244, 171, 180, 0.25)',
    ...Platform.select({
      ios: {
        shadowColor: '#D4A5AD',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
    }),
  },
  quickInfoName: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily,
    color: colors.text,
    marginBottom: 12,
  },
  quickInfoRowBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  quickInfoImageWrap: {
    width: 88,
    height: 88,
    borderRadius: 14,
    backgroundColor: '#FDF3F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  quickInfoImage: {
    width: 88,
    height: 88,
  },
  quickInfoImagePlaceholder: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickInfoBody: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  quickInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickInfoLabel: {
    fontSize: 12,
    fontFamily,
    color: colors.textSecondary,
    width: 56,
  },
  quickInfoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    fontFamily,
    color: PINK,
  },

  section: { marginTop: 22 },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily,
    color: colors.text,
    marginLeft: 8,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderLeftWidth: 5,
    borderLeftColor: PINK,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 },
      android: { elevation: 2 },
    }),
  },
  scheduleStep: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  stepDotWrap: { alignItems: 'center', marginRight: 14 },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PINK,
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
  },
  stepContent: { flex: 1 },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily,
    color: colors.text,
  },
  stepDesc: {
    fontSize: 12,
    fontFamily,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },

  effectRow: {
    flexDirection: 'row',
    gap: 10,
  },
  effectCard: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  effectRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  effectRowItemLast: { marginBottom: 0 },
  effectBullet: { marginRight: 6 },
  effectText: {
    flex: 1,
    fontSize: 11,
    fontFamily,
    color: colors.text,
    lineHeight: 16,
  },

  contraBox: {
    backgroundColor: '#FFF1F2',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#E11D48',
  },
  contraText: {
    fontSize: 12,
    fontFamily,
    color: '#B91C1C',
    lineHeight: 20,
  },

  detailCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(244, 171, 180, 0.35)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 },
      android: { elevation: 2 },
    }),
  },
  detailText: {
    fontSize: 13,
    fontFamily,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'justify',
  },

  preventionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(244, 171, 180, 0.35)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 },
      android: { elevation: 2 },
    }),
  },
  preventionDesc: {
    fontSize: 13,
    fontFamily,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
    textAlign: 'justify',
  },
  preventionSolutionWrap: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F0F7FD',
    borderRadius: 16,
    padding: 12,
    paddingHorizontal: 15,
    borderLeftWidth: 4,
    borderLeftColor: colors.blueAccent || '#3B82F6',
  },
  preventionSolutionIcon: { marginTop: 2 },
  preventionSolutionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    fontFamily,
    color: '#5D7A94',
    lineHeight: 19,
  },

  primaryBtn: {
    backgroundColor: PINK,
    paddingVertical: 15,
    borderRadius: 20,
    marginTop: 28,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: PINK, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily,
    color: '#FFFFFF',
  },
});
