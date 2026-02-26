import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  TextInput,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';
import { VACCINES, MILESTONES } from '../../data/vaccinationCatalog';

const { fontFamily } = typography;

function getVaccineById(id) {
  return VACCINES.find((v) => v.id === id);
}

export default function VaccinationCatalogScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const babyId = route?.params?.babyId;

  const searchLower = search.trim().toLowerCase();
  const filteredMilestones = MILESTONES.map((stage) => ({
    ...stage,
    vaccineIds: stage.vaccineIds.filter(
      (item) =>
        !searchLower ||
        getVaccineById(item.vaccineId)?.name.toLowerCase().includes(searchLower) ||
        item.doseLabel.toLowerCase().includes(searchLower)
    ),
  })).filter((stage) => stage.vaccineIds.length > 0);

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
          <Text style={styles.headerTitle}>Danh mục vắc xin</Text>
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
        {filteredMilestones.map((stage) => (
          <View key={stage.id} style={styles.stageBlock}>
            <View style={styles.stageHeader}>
              <Ionicons name="calendar-outline" size={20} color={colors.pinkAccent} />
              <View style={styles.stageHeaderText}>
                <Text style={styles.stageTitle}>{stage.title}</Text>
                {stage.subtitle ? (
                  <Text style={styles.stageSubtitle} numberOfLines={1}>{stage.subtitle}</Text>
                ) : null}
              </View>
            </View>
            {stage.vaccineIds.map((item) => {
              const v = getVaccineById(item.vaccineId);
              if (!v) return null;
              return (
                <TouchableOpacity
                  key={`${stage.id}-${item.vaccineId}-${item.doseLabel}`}
                  style={styles.infoCard}
                  activeOpacity={0.9}
                  onPress={() =>
                    navigation.navigate('VaccinationCatalogDetail', {
                      vaccineId: v.id,
                      babyId,
                    })
                  }
                >
                  <View style={styles.cardImageWrap}>
                    {v.imageSource ? (
                      <Image source={v.imageSource} style={styles.cardImage} resizeMode="contain" />
                    ) : (
                      <View style={styles.cardImagePlaceholder}>
                        <Ionicons name="medical-outline" size={48} color={colors.pinkAccent} />
                      </View>
                    )}
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.vTag}>
                      <Ionicons
                        name={v.isOral ? 'water-outline' : 'medical-outline'}
                        size={10}
                        color={colors.textSecondary}
                        style={styles.vTagIcon}
                      />
                      <Text style={styles.vTagText}>{v.doses.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.vName}>{v.name}</Text>
                    <Text style={styles.doseLabel}>{item.doseLabel}</Text>
                    <Text style={styles.vSummary} numberOfLines={2}>
                      {v.summary}
                    </Text>
                  </View>
                </TouchableOpacity>
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
  headerTitle: { ...typography.H3, fontFamily, color: colors.white, fontWeight: '600' },
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
    textAlign: 'left',
  },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8 },

  stageBlock: { marginBottom: 24 },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF0F1',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(244, 171, 180, 0.3)',
  },
  stageHeaderText: { flex: 1 },
  stageTitle: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily,
    color: colors.pinkAccent,
  },
  stageSubtitle: {
    fontSize: 12,
    fontFamily,
    color: colors.textMuted,
    marginTop: 2,
  },

  infoCard: {
    flexDirection: 'row',
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 14,
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F4ABB4',
    ...Platform.select({
      ios: { shadowColor: '#F4ABB4', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  cardImageWrap: {
    width: '38%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  cardImage: {
    width: '100%',
    height: 100,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    width: '62%',
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 14,
    justifyContent: 'center',
  },
  vTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4ABB4',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 6,
    ...Platform.select({
      ios: { shadowColor: '#F4ABB4', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  vTagIcon: {},
  vTagText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily,
    color: colors.textSecondary,
  },
  vName: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily,
    color: colors.text,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  doseLabel: {
    fontSize: 11,
    fontFamily,
    color: colors.pinkAccent,
    marginBottom: 4,
    fontWeight: '600',
  },
  vSummary: {
    fontSize: 11,
    fontFamily,
    color: colors.textSecondary,
    lineHeight: 15,
  },
});
