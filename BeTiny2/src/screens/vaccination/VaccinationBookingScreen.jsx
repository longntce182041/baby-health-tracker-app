import React, { useEffect, useMemo, useState } from "react";
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
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography } from "../../theme";
import { getVaccineLocations, getVaccines } from "../../api/vaccinationApi";

const { fontFamily } = typography;

const isMongoObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || ""));

const STOP_WORDS = new Set([
  "benh",
  "vac",
  "xin",
  "mui",
  "tiem",
  "trong",
  "va",
  "virus",
  "lieu",
]);

export default function VaccinationBookingScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const vaccineName = route.params?.vaccineName || "Tiêm chủng";
  const vaccineId = route.params?.vaccineId;
  const babyId = route.params?.babyId;
  const [search, setSearch] = useState("");
  const [centers, setCenters] = useState([]);
  const [resolvedVaccineId, setResolvedVaccineId] = useState(vaccineId || null);
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const normalizeName = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const toTokens = (value) =>
    normalizeName(value)
      .split(" ")
      .filter((token) => token && token.length > 1 && !STOP_WORDS.has(token));

  const pickBestVaccine = (vaccineList, targetName) => {
    if (!Array.isArray(vaccineList) || vaccineList.length === 0) return null;

    const normalizedTarget = normalizeName(targetName);
    const targetTokens = toTokens(targetName);

    const exact = vaccineList.find(
      (item) => normalizeName(item?.vaccine_name) === normalizedTarget,
    );
    if (exact) return exact;

    const includes = vaccineList.find((item) => {
      const apiName = normalizeName(item?.vaccine_name);
      return (
        apiName.includes(normalizedTarget) || normalizedTarget.includes(apiName)
      );
    });
    if (includes) return includes;

    let best = null;
    let bestScore = 0;
    for (const item of vaccineList) {
      const apiTokens = new Set(toTokens(item?.vaccine_name));
      let score = 0;
      for (const token of targetTokens) {
        if (apiTokens.has(token)) score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }

    return bestScore > 0 ? best : null;
  };

  useEffect(() => {
    let cancelled = false;

    const fetchCenters = async () => {
      try {
        setLoadingCenters(true);
        setLoadError("");

        let backendVaccineId = vaccineId;
        if (!isMongoObjectId(backendVaccineId)) {
          const vaccinesRes = await getVaccines();
          const vaccineList = Array.isArray(vaccinesRes?.data?.data)
            ? vaccinesRes.data.data
            : [];
          const matched = pickBestVaccine(vaccineList, vaccineName);

          backendVaccineId = matched?._id || matched?.id || vaccineId;
        }

        if (!cancelled)
          setResolvedVaccineId(backendVaccineId || vaccineId || null);

        if (!isMongoObjectId(backendVaccineId)) {
          if (!cancelled) {
            setCenters([]);
            setLoadError(
              "Không tìm thấy mã vắc xin trên hệ thống để tải điểm tiêm.",
            );
          }
          return;
        }

        const locationsRes = await getVaccineLocations(backendVaccineId);
        const locations = Array.isArray(locationsRes?.data?.data)
          ? locationsRes.data.data
          : [];

        const mappedCenters = locations
          .map((item) => ({
            id: item?._id || item?.id || null,
            name: item?.branch_name || item?.name || "Cơ sở tiêm chủng",
            address:
              item?.branch_address || item?.address || "Đang cập nhật địa chỉ",
            distance: "--",
            rating: 5,
            available: item?.status !== false,
            image: item?.image || null,
          }))
          .filter((item) => isMongoObjectId(item.id));

        if (!cancelled) {
          setCenters(mappedCenters);
          if (mappedCenters.length === 0) {
            setLoadError("Vắc xin này hiện chưa có cơ sở tiêm khả dụng.");
          }
        }
      } catch (error) {
        console.warn(
          "VaccinationBookingScreen load locations error:",
          error?.message || error,
        );
        console.warn(
          "VaccinationBookingScreen load locations detail:",
          error?.response?.status,
          error?.response?.data,
        );
        if (!cancelled) {
          setCenters([]);
          setLoadError("Không thể tải danh sách cơ sở tiêm. Vui lòng thử lại.");
        }
      } finally {
        if (!cancelled) setLoadingCenters(false);
      }
    };

    fetchCenters();
    return () => {
      cancelled = true;
    };
  }, [vaccineId, vaccineName, reloadToken]);

  const sourceCenters = useMemo(() => centers, [centers]);

  const filteredCenters = sourceCenters.filter(
    (c) =>
      !search.trim() ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <View style={styles.container}>
      {Platform.OS === "android" && (
        <StatusBar backgroundColor="#F4ABB4" barStyle="light-content" />
      )}
      <LinearGradient
        colors={["#F4ABB4", "#FED3DD"]}
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
          <Text style={styles.headerTitle} numberOfLines={1}>
            {vaccineName}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
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
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {loadingCenters ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.pinkAccent} />
            <Text style={styles.loadingText}>Đang tải cơ sở tiêm...</Text>
          </View>
        ) : null}

        {!loadingCenters && loadError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{loadError}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => setReloadToken((v) => v + 1)}
              activeOpacity={0.8}
            >
              <Text style={styles.retryBtnText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {filteredCenters.map((c) => (
          <View key={c.id} style={styles.card}>
            <View style={styles.cardImageWrap}>
              {c.image ? (
                <Image
                  source={{ uri: c.image }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <Ionicons
                    name="business"
                    size={32}
                    color={colors.pinkLight}
                  />
                </View>
              )}
            </View>
            <View style={styles.cardInfo}>
              <View
                style={[
                  styles.statusBadge,
                  c.available ? styles.badgeAvailable : styles.badgeFull,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    c.available
                      ? styles.badgeAvailableText
                      : styles.badgeFullText,
                  ]}
                >
                  {c.available ? "Còn chỗ" : "Hết chỗ"}
                </Text>
              </View>
              <Text style={styles.hospitalName} numberOfLines={2}>
                {c.name}
              </Text>
              <Text style={styles.hospitalAddress} numberOfLines={2}>
                {c.address}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>Cách {c.distance} km</Text>
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingText}>{c.rating} </Text>
                  <Ionicons
                    name="star"
                    size={12}
                    color="#FFD93D"
                    style={styles.ratingIcon}
                  />
                </View>
              </View>
              <TouchableOpacity
                style={[styles.btnBook, !c.available && styles.btnBookDisabled]}
                activeOpacity={0.85}
                disabled={!c.available}
                onPress={() =>
                  c.available &&
                  navigation.navigate("VaccinationBookConfirm", {
                    vaccineName,
                    vaccineId: resolvedVaccineId || vaccineId,
                    centerId: c.id,
                    centerName: c.name,
                    centerAddress: c.address,
                    fee: "850,000 VND",
                    babyId,
                  })
                }
              >
                <Text
                  style={[
                    styles.btnBookText,
                    !c.available && styles.btnBookTextDisabled,
                  ]}
                >
                  {c.available ? "Đặt lịch" : "Hết chỗ"}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily,
    color: colors.white,
    fontWeight: "600",
    marginHorizontal: 8,
    textAlign: "center",
  },
  headerSpacer: { width: 40, height: 40 },

  searchWrapper: {
    paddingHorizontal: 16,
    marginTop: -24,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 12,
    paddingLeft: 18,
    paddingRight: 14,
    borderWidth: 1,
    borderColor: "rgba(244, 171, 180, 0.3)",
    ...Platform.select({
      ios: {
        shadowColor: "#F4ABB4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
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
    textAlign: "center",
  },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8 },

  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 13,
    fontFamily,
    color: colors.textMuted,
  },
  errorBox: {
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FFF3F3",
    borderWidth: 1,
    borderColor: "#F3B7B7",
  },
  errorText: {
    fontSize: 13,
    fontFamily,
    color: "#B23A3A",
  },
  retryBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: colors.pinkAccent,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  retryBtnText: {
    fontSize: 12,
    fontFamily,
    color: colors.white,
    fontWeight: "700",
  },

  card: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 14,
    marginBottom: 16,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
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
    backgroundColor: colors.pinkLight + "60",
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1, minWidth: 0 },
  statusBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  statusBadgeText: { fontSize: 10, fontWeight: "700", fontFamily },
  badgeAvailable: { backgroundColor: "#E8F5E9" },
  badgeAvailableText: { color: "#4CAF50" },
  badgeFull: { backgroundColor: "#FFEBEB" },
  badgeFullText: { color: "#E53935" },
  hospitalName: {
    fontSize: 13,
    fontWeight: "700",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  metaText: { fontSize: 11, fontFamily, color: colors.textSecondary },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingIcon: { marginRight: 3 },
  ratingText: {
    fontSize: 11,
    fontFamily,
    fontWeight: "600",
    color: colors.text,
  },
  btnBook: {
    backgroundColor: colors.pinkAccent,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 2,
    ...Platform.select({
      ios: {
        shadowColor: colors.pinkAccent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  btnBookDisabled: {
    backgroundColor: "#DDD",
    ...Platform.select({
      ios: { shadowOpacity: 0 },
      android: { elevation: 0 },
    }),
  },
  btnBookText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily,
    color: colors.white,
  },
  btnBookTextDisabled: { color: colors.textMuted },
});
