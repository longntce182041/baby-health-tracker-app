import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
  TextInput,
  Modal,
  Pressable,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getBabies } from "../../api/babyApi";
import { getDoctorSchedules } from "../../api/doctorApi";
import { createConsultation } from "../../api/consultationApi";
import { useAuth } from "../../context/AuthContext";
import { colors, typography } from "../../theme";

const { fontFamily } = typography;

const CONSULTATION_FEE = 50;

const DAY_LABELS = ["Cn", "T2", "T3", "T4", "T5", "T6", "T7"];

function getInitial(name) {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return words[words.length - 1][0].toUpperCase();
  return name[0].toUpperCase();
}

function getShortName(fullName) {
  if (!fullName || !fullName.trim()) return "Chưa đặt tên";
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2) return fullName.trim();
  return words.slice(-2).join(" ");
}

function sanitizeReason(text) {
  if (typeof text !== "string") return "";
  return text.replace(/[^\p{L}\p{N}\s./?]/gu, "");
}

export default function ConsultationScreen({ route, navigation }) {
  const { doctorId, doctor } = route.params || {};
  const insets = useSafeAreaInsets();
  const { isLoggedIn, user, refreshUser } = useAuth();
  const currentWalletPoints = user?.wallet_points ?? user?.data?.wallet_points ?? 0;
  const timeGap = 10;
  const [babies, setBabies] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedBabyId, setSelectedBabyId] = useState(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const babyRes = isLoggedIn
          ? await getBabies()
          : { success: true, data: [] };
        const list = Array.isArray(babyRes?.data?.data)
          ? babyRes.data.data
          : [];
        setBabies(list);
        if (list.length > 0 && !selectedBabyId)
          setSelectedBabyId(list[0].baby_id || list[0].id);
        else if (list.length === 0) setSelectedBabyId(null);

        const schRes = doctorId
          ? await getDoctorSchedules(doctorId).catch(() => ({
            success: false,
            data: [],
          }))
          : { success: false, data: [] };
        console.log("ConsultationScreen schedules response:", schRes);
        setSchedules(Array.isArray(schRes?.data) ? schRes.data : []);
      } catch (e) {
        console.error("ConsultationScreen fetch error:", e);
        setBabies([]);
        setSelectedBabyId(null);
      }
      setLoading(false);
    })();
  }, [isLoggedIn, doctorId]);

  useEffect(() => {
    if (schedules.length === 0) return;
    const dates = [
      ...new Set(
        schedules
          .map((s) => {
            const dateVal = s.date || s.available_date;
            return typeof dateVal === "string" ? dateVal.slice(0, 10) : dateVal;
          })
          .filter(Boolean),
      ),
    ].sort();
    const today = new Date().toISOString().slice(0, 10);
    const available = dates.filter((d) => d >= today);
    if (available.length > 0) {
      setSelectedDate((prev) =>
        available.includes(prev) ? prev : available[0],
      );
    }
  }, [schedules.length]);

  useEffect(() => {
    setSelectedTimeSlot(null);
    setSelectedScheduleId(null);
  }, [selectedDate]);

  const dateOptions = (() => {
    if (schedules.length > 0) {
      const dates = [
        ...new Set(
          schedules.map((s) => s.date || s.available_date).filter(Boolean),
        ),
      ].sort();
      const today = new Date().toISOString().slice(0, 10);
      return dates
        .filter((d) => d.slice(0, 10) >= today)
        .slice(0, 14)
        .map((date) => {
          const dateStr = typeof date === "string" ? date.slice(0, 10) : date;
          const d = new Date(dateStr + "T12:00:00");
          const ddm = d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          });
          return { date: dateStr, label: `${DAY_LABELS[d.getDay()]} ${ddm}` };
        });
    }
    const out = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const ddm = d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
      out.push({
        date: d.toISOString().slice(0, 10),
        label: `${DAY_LABELS[d.getDay()]} ${ddm}`,
      });
    }
    return out;
  })();

  const timeSlots = (() => {
    if (schedules.length === 0) return [];
    const schedule = schedules.find((s) => {
      const scheduleDate = s.date || s.available_date;
      const dateStr =
        typeof scheduleDate === "string"
          ? scheduleDate.slice(0, 10)
          : scheduleDate;
      return dateStr === selectedDate;
    });

    console.log("Selected date:", selectedDate);
    console.log(
      "Found schedule for date:",
      schedule
        ? {
          date: schedule.date,
          status: schedule.status,
          slots_count: schedule.slots?.length,
        }
        : "NO SCHEDULE FOUND",
    );

    if (!schedule || !schedule.slots || !Array.isArray(schedule.slots))
      return [];

    // Extract time slots from backend structure with availability info
    return schedule.slots
      .filter((slot) => !slot.is_fully_booked)
      .map((slot) => ({
        time: `${slot.start_time} - ${slot.end_time}`,
        available_slots: slot.available_slots || 3 - (slot.booked_count || 0),
        is_user_booked: slot.is_user_booked || false,
      }));
  })();
  const isTwoSlots = timeSlots.length === 2;

  const openDatePicker = () => {
    const [y, m] = selectedDate.split("-").map(Number);
    setPickerMonth(`${y}-${String(m).padStart(2, "0")}`);
    setDatePickerVisible(true);
  };

  const getCalendarGrid = () => {
    const [y, m] = pickerMonth.split("-").map(Number);
    const first = new Date(y, m - 1, 1);
    const last = new Date(y, m - 1 + 1, 0);
    const startOffset = first.getDay();
    const daysInMonth = last.getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const total = cells.length;
    const remainder = total % 7;
    if (remainder) for (let i = 0; i < 7 - remainder; i++) cells.push(null);
    return { cells, year: y, month: m };
  };

  const selectDateFromCalendar = (day) => {
    if (day == null) return;
    const [y, m] = pickerMonth.split("-").map(Number);
    const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setDatePickerVisible(false);
  };

  const changePickerMonth = (delta) => {
    const [y, m] = pickerMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setPickerMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  };

  const MONTH_NAMES = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const selectedDateLabel = (() => {
    const opt = dateOptions.find((o) => o.date === selectedDate);
    if (opt) return opt.label;
    const d = new Date(selectedDate);
    if (isNaN(d.getTime())) return "Ngày khác";
    const ddm = d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
    return `${DAY_LABELS[d.getDay()]} ${ddm}`;
  })();

  const handleSelectTime = (timeObj) => {
    // Don't allow selecting slots that user already booked
    if (timeObj.is_user_booked) return;
    setSelectedTimeSlot(timeObj.time);
  };

  const isFormValid =
    Boolean(selectedBabyId) &&
    Boolean(reason.trim()) &&
    timeSlots.length > 0 &&
    Boolean(selectedTimeSlot);

  const handleBook = async () => {
    if (!selectedBabyId) {
      Alert.alert("Lỗi", "Vui lòng chọn bé yêu");
      return;
    }
    if (!reason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập vấn đề cần tư vấn");
      return;
    }
    if (timeSlots.length > 0 && !selectedTimeSlot) {
      Alert.alert("Lỗi", "Vui lòng chọn khung giờ");
      return;
    }

    if (currentWalletPoints < CONSULTATION_FEE) {
      Alert.alert(
        "Không đủ điểm",
        `Bạn cần tối thiểu ${CONSULTATION_FEE} điểm để đặt lịch tư vấn. Vui lòng nạp thêm điểm.`,
      );
      return;
    }

    // Parse time slot to extract start_time and end_time
    const [start_time, end_time] = selectedTimeSlot
      ? selectedTimeSlot.split(" - ")
      : [null, null];
    if (!start_time || !end_time) {
      Alert.alert("Lỗi", "Khung giờ không hợp lệ");
      return;
    }

    setSaving(true);
    try {
      // Ensure date is in correct format (YYYY-MM-DD)
      const formattedDate = selectedDate.includes("T")
        ? selectedDate.split("T")[0]
        : selectedDate;

      // Verify schedule exists for this date
      const selectedSchedule = schedules.find((s) => {
        const scheduleDate = s.date || s.available_date;
        const dateStr =
          typeof scheduleDate === "string"
            ? scheduleDate.slice(0, 10)
            : scheduleDate;
        return dateStr === formattedDate;
      });

      console.log("Booking validation:", {
        selectedDate: formattedDate,
        scheduleFound: !!selectedSchedule,
        scheduleStatus: selectedSchedule?.status,
        totalSchedules: schedules.length,
        scheduleDates: schedules.map((s) =>
          (s.date || s.available_date)?.slice(0, 10),
        ),
      });

      if (!selectedSchedule) {
        Alert.alert(
          "Lỗi",
          "Không tìm thấy lịch cho ngày đã chọn. Vui lòng chọn ngày khác hoặc tải lại trang.",
        );
        return;
      }

      console.log("Creating consultation with:", {
        baby_id: selectedBabyId,
        doctor_id: doctorId,
        date: formattedDate,
        start_time: start_time.trim(),
        end_time: end_time.trim(),
        notes: reason.trim(),
      });

      const result = await createConsultation({
        baby_id: selectedBabyId,
        doctor_id: doctorId,
        date: formattedDate,
        start_time: start_time.trim(),
        end_time: end_time.trim(),
        ...(reason.trim() && { notes: reason.trim() }),
      });

      console.log("Create consultation result:", result);

      if (result?.success !== false && result?.data) {
        const deductedPoints = result?.data?.deducted_points ?? CONSULTATION_FEE;
        const remainingPoints = result?.data?.wallet_points;

        try {
          await refreshUser();
        } catch (refreshError) {
          console.warn("Refresh user after booking failed:", refreshError);
        }

        Alert.alert(
          "Thành công",
          remainingPoints !== undefined
            ? `Đã đặt lịch tư vấn và trừ ${deductedPoints} điểm. Số dư còn lại: ${remainingPoints} điểm.`
            : `Đã đặt lịch tư vấn và trừ ${deductedPoints} điểm.`,
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } else {
        const errorMsg =
          result?.message || "Không thể đặt lịch. Vui lòng thử lại.";
        console.error("Consultation booking failed:", {
          success: result?.success,
          message: result?.message,
          data: result?.data,
        });
        Alert.alert("Lỗi", errorMsg);
      }
    } catch (e) {
      console.error("Book consultation error:", e);
      const errorMsg =
        e?.response?.data?.message ||
        e?.message ||
        "Không thể đặt lịch. Vui lòng kiểm tra kết nối và thử lại.";
      Alert.alert("Lỗi", errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centeredText}>Vui lòng đăng nhập để đặt lịch</Text>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.btnPrimaryText}>Đăng nhập</Text>
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
          <Text style={styles.headerTitle}>Đặt lịch tư vấn</Text>
          <TouchableOpacity
            style={styles.pointsPill}
            onPress={() => navigation.navigate("TopUpPoints")}
            activeOpacity={0.8}
          >
            <Text style={styles.pointsPillText}>
              {currentWalletPoints}
            </Text>
            <Ionicons
              name="add"
              size={14}
              color={colors.white}
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>1. Chọn bé yêu</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.babyScroll}
          >
            {babies.map((b) => {
              const bid = b.baby_id || b.id;
              const active = selectedBabyId === bid;
              const avatarSrc = b.avt ?? b.avatar ?? b.avatar_url;
              return (
                <TouchableOpacity
                  key={bid}
                  style={[styles.babyOption, active && styles.babyOptionActive]}
                  onPress={() => setSelectedBabyId(bid)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.babyAvatar,
                      active && styles.babyAvatarActive,
                    ]}
                  >
                    {avatarSrc ? (
                      <Image
                        source={
                          typeof avatarSrc === "string"
                            ? { uri: avatarSrc }
                            : avatarSrc
                        }
                        style={styles.babyAvatarImg}
                      />
                    ) : (
                      <Text style={styles.babyAvatarText}>
                        {getInitial(b.full_name)}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[styles.babyName, active && styles.babyNameActive]}
                    numberOfLines={1}
                  >
                    {getShortName(b.full_name)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionLabel}>2. Vấn đề cần tư vấn?</Text>
          <TextInput
            style={[
              styles.reasonInput,
              reason.trim() ? styles.reasonInputFilled : null,
            ]}
            value={reason}
            onChangeText={(text) => setReason(sanitizeReason(text))}
            placeholder="Ví dụ: Bé nên uống sữa whey không?? ..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
          />

          <View style={styles.dateSectionRow}>
            <Text style={[styles.sectionLabel, styles.dateSectionLabel]}>
              3. Chọn ngày
            </Text>
            <TouchableOpacity
              style={[
                styles.datePickerTrigger,
                selectedDate && styles.datePickerTriggerSelected,
              ]}
              onPress={openDatePicker}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.datePickerTriggerText,
                  selectedDate && styles.datePickerTriggerTextSelected,
                ]}
              >
                {selectedDateLabel}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dateScroll}
          >
            {dateOptions.map((opt) => {
              const active = selectedDate === opt.date;
              return (
                <TouchableOpacity
                  key={opt.date}
                  style={[styles.dateChip, active && styles.dateChipSelected]}
                  onPress={() => setSelectedDate(opt.date)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dateChipText,
                      active && styles.dateChipTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Modal visible={datePickerVisible} transparent animationType="fade">
            <Pressable
              style={styles.dateModalOverlay}
              onPress={() => setDatePickerVisible(false)}
            >
              <Pressable
                style={styles.dateModalCard}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={styles.dateModalHeader}>
                  <Text style={styles.dateModalTitle}>Chọn ngày tư vấn</Text>
                  <TouchableOpacity
                    onPress={() => setDatePickerVisible(false)}
                    style={styles.dateModalClose}
                    hitSlop={12}
                  >
                    <Ionicons name="close" size={24} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
                <View style={styles.calendarNav}>
                  <TouchableOpacity
                    style={styles.calendarNavBtn}
                    onPress={() => changePickerMonth(-1)}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={22}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                  <Text style={styles.calendarNavTitle}>
                    {MONTH_NAMES[parseInt(pickerMonth.split("-")[1], 10) - 1]}{" "}
                    {pickerMonth.split("-")[0]}
                  </Text>
                  <TouchableOpacity
                    style={styles.calendarNavBtn}
                    onPress={() => changePickerMonth(1)}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.calendarWeekRow}>
                  {DAY_LABELS.map((l, i) => (
                    <Text key={i} style={styles.calendarWeekCell}>
                      {l}
                    </Text>
                  ))}
                </View>
                <View style={styles.calendarGrid}>
                  {getCalendarGrid().cells.map((day, i) => {
                    const [y, m] = pickerMonth.split("-").map(Number);
                    const dateStr =
                      day != null
                        ? `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                        : null;
                    const active = dateStr && selectedDate === dateStr;
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.calendarDayCell,
                          day == null && styles.calendarDayEmpty,
                          active && styles.calendarDayActive,
                        ]}
                        onPress={() => selectDateFromCalendar(day)}
                        disabled={day == null}
                        activeOpacity={0.8}
                      >
                        {day != null && (
                          <Text
                            style={[
                              styles.calendarDayText,
                              active && styles.calendarDayTextActive,
                            ]}
                          >
                            {day}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Pressable>
            </Pressable>
          </Modal>

          <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
            4. Chọn khung giờ
          </Text>
          {timeSlots.length === 0 ? (
            <View style={styles.timeEmptyWrap}>
              <Text style={styles.timeEmptyText}>
                Ngày này chưa có khung giờ cụ thể. Vui lòng chọn ngày khác.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.timeHint}>Chọn khung giờ phù hợp</Text>
              <View style={[styles.timeGrid, { gap: timeGap }]}>
                {timeSlots.map((timeObj) => {
                  const selected = selectedTimeSlot === timeObj.time;
                  const userBooked = timeObj.is_user_booked;
                  return (
                    <TouchableOpacity
                      key={timeObj.time}
                      style={[
                        styles.timeChip,
                        isTwoSlots && styles.timeChipFullWidth,
                        selected && styles.timeChipSelected,
                        userBooked && styles.timeChipUserBooked,
                      ]}
                      onPress={() => handleSelectTime(timeObj)}
                      activeOpacity={0.8}
                      disabled={userBooked}
                    >
                      <Text
                        style={[
                          styles.timeChipText,
                          selected && styles.timeChipTextSelected,
                          userBooked && styles.timeChipTextBooked,
                        ]}
                      >
                        {timeObj.time}
                      </Text>
                      {timeObj.available_slots != null && !userBooked && (
                        <Text
                          style={[
                            styles.timeChipSlotsText,
                            selected && styles.timeChipSlotsTextSelected,
                          ]}
                        >
                          ({timeObj.available_slots}/3 còn trống)
                        </Text>
                      )}
                      {userBooked && (
                        <Text style={styles.timeChipUserBookedText}>
                          Đã đặt
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          <View style={styles.feeRow}>
            <Text style={[styles.sectionLabel, styles.feeLabel]}>
              5. Phí tư vấn
            </Text>
            <Text style={styles.feeValue} numberOfLines={1}>
              {doctor?.consultation_fee ?? CONSULTATION_FEE} Điểm
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.btnConfirm,
              (!isFormValid || saving) && styles.btnConfirmDisabled,
            ]}
            onPress={handleBook}
            disabled={!isFormValid || saving}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                !isFormValid || saving
                  ? ["#D0D0D0", "#E0E0E0"]
                  : ["#E895A0", "#F4ABB4"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.btnConfirmGrad}
            >
              {saving ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text
                  style={[
                    styles.btnConfirmText,
                    (!isFormValid || saving) && styles.btnConfirmTextDisabled,
                  ]}
                >
                  Xác nhận đặt lịch
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  centeredText: { fontSize: 15, color: colors.textSecondary, marginBottom: 16 },
  headerGrad: {
    paddingBottom: 56,
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
    fontSize: 18,
    fontFamily,
    fontWeight: "600",
    color: colors.white,
  },
  pointsPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  pointsPillText: {
    fontSize: 13,
    fontFamily,
    fontWeight: "700",
    color: colors.white,
  },
  scroll: { flex: 1, marginTop: -50 },
  content: { paddingHorizontal: 16, paddingTop: 0 },
  card: {
    marginTop: 8,
    backgroundColor: colors.white,
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#D4A5AD",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 14,
  },
  sectionLabelSpaced: { marginTop: 8 },
  babyScroll: { marginBottom: 24, marginTop: 4 },
  babyOption: {
    alignItems: "center",
    marginRight: 20,
  },
  babyOptionActive: {},
  babyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.pinkLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#F0F0F0",
  },
  babyAvatarActive: {
    borderColor: colors.pinkAccent,
    ...Platform.select({
      ios: {
        shadowColor: colors.pinkAccent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  babyAvatarImg: { width: 50, height: 50, borderRadius: 25 },
  babyAvatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.pinkAccent,
    fontFamily,
  },
  babyName: {
    fontSize: 12,
    fontFamily,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: 8,
    maxWidth: 70,
  },
  babyNameActive: { color: colors.pinkAccent },
  reasonInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#F0F0F0",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 32,
  },
  reasonInputFilled: {
    backgroundColor: colors.white,
    borderColor: colors.pinkLight,
  },
  dateSectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dateSectionLabel: { marginBottom: 0 },
  datePickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  datePickerTriggerSelected: {
    backgroundColor: colors.white,
    borderColor: "#E0E0E0",
  },
  datePickerTriggerText: {
    fontSize: 13,
    fontFamily,
    fontWeight: "700",
    color: colors.text,
  },
  datePickerTriggerTextSelected: { color: colors.text },
  dateScroll: { marginBottom: 28 },
  dateChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#F5F5F5",
    borderWidth: 2,
    borderColor: "#F0F0F0",
    marginRight: 10,
  },
  dateChipSelected: {
    backgroundColor: colors.pinkLight,
    borderColor: colors.pinkAccent,
  },
  dateChipText: {
    fontSize: 13,
    fontFamily,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  dateChipTextSelected: { color: colors.pinkAccent, fontWeight: "700" },
  dateModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dateModalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
    }),
  },
  dateModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dateModalTitle: {
    fontSize: 18,
    fontFamily,
    fontWeight: "700",
    color: colors.text,
  },
  dateModalClose: { padding: 4 },
  calendarNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  calendarNavBtn: { padding: 8 },
  calendarNavTitle: {
    fontSize: 16,
    fontFamily,
    fontWeight: "700",
    color: colors.text,
  },
  calendarWeekRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  calendarWeekCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontFamily,
    fontWeight: "700",
    color: colors.textMuted,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
  },
  calendarDayCell: {
    width: "14.28%",
    aspectRatio: 1,
    maxWidth: 44,
    maxHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderRadius: 12,
  },
  calendarDayEmpty: { backgroundColor: "transparent" },
  calendarDayActive: { backgroundColor: colors.pinkAccent },
  calendarDayText: {
    fontSize: 14,
    fontFamily,
    fontWeight: "600",
    color: colors.text,
  },
  calendarDayTextActive: { color: colors.white },
  timeHint: {
    fontSize: 12,
    fontFamily,
    color: colors.textMuted,
    marginBottom: 10,
  },
  timeEmptyWrap: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EEE",
    marginBottom: 28,
  },
  timeEmptyText: {
    fontSize: 14,
    fontFamily,
    color: colors.textMuted,
    textAlign: "center",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 28,
    gap: 10,
  },
  timeChip: {
    minWidth: 90,
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: "#F0F0F0",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  timeChipFullWidth: {
    minWidth: "100%",
    flexBasis: "100%",
  },
  timeChipSelected: {
    backgroundColor: colors.blueAccent,
    borderColor: colors.blueAccent,
  },
  timeChipBooked: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E8E8E8",
    opacity: 0.8,
  },
  timeChipText: {
    fontSize: 15,
    fontFamily,
    fontWeight: "700",
    color: colors.textSecondary,
    textAlign: "center",
  },
  timeChipTextSelected: { color: colors.white },
  timeChipTextBooked: { color: colors.textMuted },
  timeChipUserBooked: {
    backgroundColor: "#FFF3E0",
    borderColor: "#FFB74D",
  },
  timeChipSlotsText: {
    fontSize: 11,
    fontFamily,
    color: colors.textMuted,
    marginTop: 4,
  },
  timeChipSlotsTextSelected: {
    color: "rgba(255,255,255,0.9)",
  },
  timeChipUserBookedText: {
    fontSize: 11,
    fontFamily,
    color: "#F57C00",
    marginTop: 4,
    fontWeight: "600",
  },
  btnConfirm: {
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.pinkAccent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  btnConfirmDisabled: {
    opacity: 0.85,
  },
  btnConfirmGrad: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnConfirmText: {
    fontSize: 15,
    fontFamily,
    fontWeight: "700",
    color: colors.white,
  },
  btnConfirmTextDisabled: { color: colors.textMuted },
  feeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    flexWrap: "nowrap",
  },
  feeLabel: { marginBottom: 0 },
  feeValue: {
    fontSize: 12,
    fontFamily,
    fontWeight: "600",
    color: colors.textMuted,
  },
  btnPrimary: {
    backgroundColor: colors.pinkAccent,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  btnPrimaryText: {
    fontSize: 15,
    fontFamily,
    fontWeight: "600",
    color: colors.white,
  },
});
