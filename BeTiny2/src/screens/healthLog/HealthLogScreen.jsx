import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';
import { getHealthLogs } from '../../api/healthLogApi';
import { MOCK_HEALTH_LOG_GROUPS } from '../../data/mockHealthLogs';

const { fontFamily } = typography;

const BABY_STATUS_COLORS = {
  good: '#A5D6A7',
  normal: '#FFECB3',
  bad: '#EF9A9A',
};

function getCardBorderColor(m) {
  if (m.babyStatus && BABY_STATUS_COLORS[m.babyStatus]) return BABY_STATUS_COLORS[m.babyStatus];
  if (m.borderColor) return m.borderColor;
  if (m.type === 'photo') return colors.pinkAccent;
  return null;
}

export default function HealthLogScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const babyId = route.params?.babyId;
  const canGoBack = navigation.canGoBack?.();
  const [momentGroups, setMomentGroups] = useState(MOCK_HEALTH_LOG_GROUPS);
  const [loading, setLoading] = useState(false);

  const loadHealthLogs = async () => {
    if (!babyId) return;
    try {
      setLoading(true);
      const res = await getHealthLogs(babyId);
      if (res?.success && Array.isArray(res.data)) {
        setMomentGroups(res.data);
      } else {
        setMomentGroups(res.data || MOMENT_GROUPS);
      }
    } catch (e) {
      console.error('HealthLog getHealthLogs:', e);
      setMomentGroups(MOCK_HEALTH_LOG_GROUPS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      const updated = route.params?.updatedMoment;
      if (updated && updated.id) {
        setMomentGroups((prev) =>
          prev.map((g) => ({
            ...g,
            moments: g.moments.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)),
          }))
        );
        navigation.setParams({ updatedMoment: undefined });
      } else {
        loadHealthLogs();
      }
    });
    return unsub;
  }, [navigation, route.params?.updatedMoment, babyId]);

  const openEditMoment = (m) => {
    navigation.navigate('HealthLogAdd', { babyId, editMoment: m });
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
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => (canGoBack ? navigation.goBack() : navigation.getParent()?.navigate('HomeTab'))}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nhật ký của Bé</Text>
          <TouchableOpacity
            style={styles.addMomentBtn}
            onPress={() => navigation.navigate('HealthLogAdd', { babyId })}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.timeline, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timelineLine} />
        {momentGroups.map((group, gIdx) => (
          <View key={gIdx} style={styles.momentGroup}>
            <View style={styles.dateLabelWrap}>
              <Text style={styles.dateLabel}>{group.dateLabel}</Text>
            </View>
            {group.moments.map((m) => {
              const borderColor = getCardBorderColor(m);
              const trimmedTitle = (m.title || '').trim();
              const trimmedDesc = (m.desc || '').trim();
              const hasTitle = trimmedTitle.length > 0;
              const hasDesc = trimmedDesc.length > 0;
              const photosArray = Array.isArray(m.photos) ? m.photos.filter(Boolean) : [];
              const hasPhoto = photosArray.length > 0;
              return (
                <View
                  key={m.id}
                  style={[
                    styles.card,
                    borderColor && { borderLeftWidth: 4, borderLeftColor: borderColor },
                  ]}
                >
                  <View style={styles.cardDot} />
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTime}>{m.time}</Text>
                    <TouchableOpacity
                      style={styles.cardEditBtn}
                      onPress={() => openEditMoment(m)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="create-outline" size={16} color={colors.pinkAccent} />
                    </TouchableOpacity>
                  </View>

                  {hasTitle && (
                    <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
                      {trimmedTitle.length > 35 ? `${trimmedTitle.slice(0, 35)}...` : trimmedTitle}
                    </Text>
                  )}

                  {hasPhoto && (
                    <ScrollView
                      horizontal
                      nestedScrollEnabled
                      scrollEnabled
                      showsHorizontalScrollIndicator={false}
                      style={styles.cardImageScroll}
                      contentContainerStyle={styles.cardImageRow}
                    >
                      {photosArray.map((p, idx) => (
                        <Image
                          key={idx}
                          source={typeof p === 'string' ? { uri: p } : p}
                          style={styles.cardImage}
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  )}

                  {m.symptoms && Array.isArray(m.symptoms) && m.symptoms.length > 0 && (
                    <View style={styles.symptomRow}>
                      <Ionicons name="medkit-outline" size={16} color={colors.pinkAccent} style={styles.symptomIcon} />
                      <Text style={styles.symptomText} numberOfLines={2}>
                        {m.symptoms.join(', ')}
                      </Text>
                    </View>
                  )}

                  {m.type === 'health' && m.health && (
                    <View style={styles.healthInfo}>
                      {m.health.map((h, i) => (
                        <View key={i} style={styles.healthItem}>
                          <Ionicons name={h.icon} size={16} color={colors.pinkAccent} style={styles.healthIcon} />
                          <Text style={styles.healthValue}>{h.value}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {hasDesc && (
                    <Text style={styles.cardDesc} numberOfLines={8} ellipsizeMode="tail">
                      {trimmedDesc}
                    </Text>
                  )}
                </View>
              );
            })}
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
    fontSize: 20,
    fontFamily,
    fontWeight: '700',
    color: colors.white,
  },
  addMomentBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.pinkAccent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: colors.pinkAccent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10 },
      android: { elevation: 6 },
    }),
  },

  scroll: { flex: 1 },
  timeline: {
    paddingHorizontal: 12,
    paddingTop: 24,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 24,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#F0F0F0',
  },
  momentGroup: {
    marginBottom: 28,
    position: 'relative',
    zIndex: 1,
  },
  dateLabelWrap: {
    marginLeft: 32,
    marginBottom: 14,
  },
  dateLabel: {
    backgroundColor: colors.background,
    paddingVertical: 6,
    paddingHorizontal: 14,
    fontFamily,
    fontWeight: '700',
    fontSize: 14,
    color: colors.pinkAccent,
    alignSelf: 'flex-start',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
    marginLeft: 32,
    marginRight: 0,
    marginBottom: 14,
    borderLeftWidth: 0,
    borderWidth: 1,
    borderColor: '#F9F9F9',
    position: 'relative',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.03, shadowRadius: 15 },
      android: { elevation: 3 },
    }),
  },
  cardDot: {
    position: 'absolute',
    left: -18,
    top: 20,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.pinkAccent,
    borderWidth: 3,
    borderColor: colors.white,
  },
  cardTime: {
    fontSize: 12,
    fontFamily,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardEditBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFF5F7',
  },
  cardTitle: {
    fontSize: 14,
    fontFamily,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    fontFamily,
    color: colors.textMuted,
    lineHeight: 20,
  },
  cardImageScroll: {
    marginTop: 8,
  },
  cardImageRow: {
    flexDirection: 'row',
  },
  cardImage: {
    width: 88,
    height: 88,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
  healthInfo: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  healthItem: {
    flex: 1,
    alignItems: 'center',
  },
  healthIcon: { marginBottom: 4 },
  healthValue: {
    fontSize: 12,
    fontFamily,
    fontWeight: '700',
    color: colors.text,
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  symptomIcon: { marginRight: 6 },
  symptomText: {
    flex: 1,
    fontSize: 12,
    fontFamily,
    color: colors.textMuted,
  },
});
