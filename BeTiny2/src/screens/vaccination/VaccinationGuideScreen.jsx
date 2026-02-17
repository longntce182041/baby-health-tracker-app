import React from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';

const { fontFamily } = typography;

const BEFORE_ITEMS = [
  {
    key: 'screening',
    icon: 'stethoscope',
    lib: MaterialCommunityIcons,
    title: 'Khám sàng lọc',
    desc: 'Giúp phát hiện bất thường để bác sĩ quyết định cho trẻ tiêm hay tạm hoãn.',
  },
  {
    key: 'info',
    icon: 'clipboard-outline',
    lib: Ionicons,
    title: 'Cung cấp thông tin',
    desc: 'Ba mẹ cần cung cấp tình trạng sức khỏe hiện tại và tiền sử bệnh lý của bé cho bác sĩ.',
  },
];

const AFTER_ITEMS = [
  {
    key: 'onsite',
    icon: 'time-outline',
    lib: Ionicons,
    title: 'Theo dõi tại chỗ',
    desc: 'Theo dõi bé ít nhất 30 phút tại cơ sở tiêm để xử lý kịp thời các biểu hiện bất thường.',
  },
  {
    key: 'home',
    icon: 'medkit-outline',
    lib: Ionicons,
    title: 'Theo dõi tại nhà (24-48h)',
    desc: 'Kiểm tra thân nhiệt, nhịp thở, sự tỉnh táo, ăn ngủ và vùng tiêm (sưng, đỏ, phát ban).',
  },
  {
    key: 'nutrition',
    icon: 'nutrition-outline',
    lib: Ionicons,
    title: 'Chế độ dinh dưỡng',
    desc: 'Cho bé mặc đồ thoáng mát, duy trì dinh dưỡng hằng ngày và cho uống nhiều nước/bú nhiều hơn.',
  },
];

export default function VaccinationGuideScreen({ navigation }) {
  const insets = useSafeAreaInsets();

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
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cẩm nang tiêm chủng</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: 10, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.sectionHeader, styles.sectionHeaderFirst]}>
          <View style={styles.stepNum}>
            <Text style={styles.stepNumText}>1</Text>
          </View>
          <Text style={styles.sectionTitle}>Trước khi tiêm chủng</Text>
        </View>
        <View style={styles.guideCard}>
          {BEFORE_ITEMS.map((item, index) => {
            const Icon = item.lib;
            return (
              <View key={item.key} style={[styles.infoItem, index === BEFORE_ITEMS.length - 1 && styles.infoItemLast]}>
                <View style={styles.iconWrap}>
                  <Icon name={item.icon} size={20} color={colors.pinkAccent} />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoTitle}>{item.title}</Text>
                  <Text style={styles.infoDesc}>{item.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.stepNum}>
            <Text style={styles.stepNumText}>2</Text>
          </View>
          <Text style={styles.sectionTitle}>Sau khi tiêm chủng</Text>
        </View>
        <View style={styles.guideCard}>
          {AFTER_ITEMS.map((item, index) => {
            const Icon = item.lib;
            return (
              <View key={item.key} style={[styles.infoItem, index === AFTER_ITEMS.length - 1 && styles.infoItemLast]}>
                <View style={styles.iconWrap}>
                  <Icon name={item.icon} size={20} color={colors.pinkAccent} />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoTitle}>{item.title}</Text>
                  <Text style={styles.infoDesc}>{item.desc}</Text>
                </View>
              </View>
            );
          })}
          <View style={styles.emergencyNote}>
            <View style={styles.emergencyTitleRow}>
              <Ionicons name="warning" size={14} color="#E65100" style={{ marginRight: 6 }} />
              <Text style={styles.emergencyTitle}>LƯU Ý QUAN TRỌNG</Text>
            </View>
            <Text style={styles.emergencyDesc}>
              Nếu bé sốt {'>'} 38.5°C, quấy khóc kéo dài hoặc có dấu hiệu khó thở, nôn trớ, cần đưa đến cơ sở y tế gần nhất ngay lập tức.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerGrad: {
    paddingBottom: 20,
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
    ...typography.H3,
    fontFamily,
    color: colors.white,
    fontWeight: '600',
  },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },

  headerSpacer: { width: 40, height: 40 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 25,
    marginBottom: 15,
  },
  sectionHeaderFirst: { marginTop: 12 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.pinkAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontSize: 14, fontWeight: '900', color: colors.white, fontFamily },
  sectionTitle: { fontSize: 17, fontWeight: '800', fontFamily, color: colors.text },

  guideCard: {
    backgroundColor: colors.white,
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(244, 171, 180, 0.2)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  infoItem: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 18,
  },
  infoItemLast: { marginBottom: 0 },
  infoText: { flex: 1 },
  infoTitle: { fontSize: 15, fontWeight: '700', fontFamily, color: colors.text, marginBottom: 3 },
  infoDesc: { fontSize: 13, fontFamily, color: '#777', lineHeight: 20 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emergencyNote: {
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
    padding: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#FF9800',
    marginTop: 15,
  },
  emergencyTitleRow: { flexDirection: 'row', alignItems: 'center' },
  emergencyTitle: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily,
    color: '#E65100',
  },
  emergencyDesc: {
    fontSize: 12,
    fontFamily,
    color: '#5D4037',
    marginTop: 6,
    lineHeight: 18,
  },
});
