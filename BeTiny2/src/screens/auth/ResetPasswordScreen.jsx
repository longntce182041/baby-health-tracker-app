import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { resetPassword } from "../../api/authApi";
import { colors, typography } from "../../theme";

const { fontFamily } = typography;

function isValidEmail(email) {
  const cleaned = (email || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);
}

const inputShadow = {
  backgroundColor: colors.white,
  borderRadius: 15,
  paddingHorizontal: 20,
  paddingVertical: 18,
  borderWidth: 1,
  borderColor: colors.pinkLight,
  shadowColor: "#F4ABB4",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
};

export default function ResetPasswordScreen({ navigation, route }) {
  const initialEmail = route?.params?.email || "";
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    otp: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [focused, setFocused] = useState({
    email: false,
    otp: false,
    newPassword: false,
    confirmPassword: false,
  });

  const otpSanitized = useMemo(() => otp.replace(/[^0-9]/g, ""), [otp]);

  const emailError = touched.email && (!email.trim() || !isValidEmail(email));
  const otpError = touched.otp && otpSanitized.length !== 5;
  const passwordError = touched.newPassword && newPassword.length < 6;
  const confirmError =
    touched.confirmPassword &&
    (!confirmPassword || confirmPassword !== newPassword);

  const isFormValid =
    isValidEmail(email.trim()) &&
    otpSanitized.length === 5 &&
    newPassword.length >= 6 &&
    confirmPassword === newPassword;

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert("Lỗi", "Email không đúng định dạng");
      return;
    }
    if (otpSanitized.length !== 5) {
      Alert.alert("Lỗi", "OTP phải gồm đúng 5 chữ số");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (confirmPassword !== newPassword) {
      Alert.alert("Lỗi", "Xác nhận mật khẩu không khớp");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(trimmedEmail, otpSanitized, newPassword);
      setLoading(false);
      Alert.alert(
        "Thành công",
        res?.message || "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.",
      );
      navigation.navigate("Login");
    } catch (error) {
      setLoading(false);
      Alert.alert(
        "Lỗi",
        error?.message ||
          error?.response?.data?.message ||
          "Đặt lại mật khẩu thất bại",
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentWrap}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topSection}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.logoSection}>
          <View style={styles.logoWrapper}>
            <Image
              source={require("../../../assets/images/logoBeTiny.bmp")}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.formTitle}>Đặt lại mật khẩu</Text>
          <Text style={styles.subtitle}>Nhập email, OTP và mật khẩu mới</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <View style={styles.fieldWrap}>
          <Text style={styles.labelOnBorder}>Email</Text>
          <View
            style={[
              styles.inputBox,
              focused.email && styles.inputFocused,
              emailError && styles.inputError,
            ]}
          >
            <TextInput
              style={styles.inputInnerSmall}
              placeholder="Nhập email"
              placeholderTextColor="#c5c5c5"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocused((f) => ({ ...f, email: true }))}
              onBlur={() => {
                setFocused((f) => ({ ...f, email: false }));
                setTouched((t) => ({ ...t, email: true }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {emailError && (
            <Text style={styles.errorText}>
              {!email.trim()
                ? "Vui lòng nhập email"
                : "Email không đúng định dạng"}
            </Text>
          )}
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.labelOnBorder}>Mã OTP</Text>
          <View
            style={[
              styles.inputBox,
              focused.otp && styles.inputFocused,
              otpError && styles.inputError,
            ]}
          >
            <TextInput
              style={styles.inputInnerSmall}
              placeholder="Nhập OTP 5 số"
              placeholderTextColor="#c5c5c5"
              value={otpSanitized}
              onChangeText={(v) => setOtp(v.replace(/[^0-9]/g, ""))}
              onFocus={() => setFocused((f) => ({ ...f, otp: true }))}
              onBlur={() => {
                setFocused((f) => ({ ...f, otp: false }));
                setTouched((t) => ({ ...t, otp: true }));
              }}
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>
          {otpError && (
            <Text style={styles.errorText}>OTP phải gồm đúng 5 chữ số</Text>
          )}
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.labelOnBorder}>Mật khẩu mới</Text>
          <View
            style={[
              styles.inputBox,
              styles.passwordBox,
              focused.newPassword && styles.inputFocused,
              passwordError && styles.inputError,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              placeholder="Nhập mật khẩu mới"
              placeholderTextColor="#c5c5c5"
              value={newPassword}
              onChangeText={setNewPassword}
              onFocus={() => setFocused((f) => ({ ...f, newPassword: true }))}
              onBlur={() => {
                setFocused((f) => ({ ...f, newPassword: false }));
                setTouched((t) => ({ ...t, newPassword: true }));
              }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
          {passwordError && (
            <Text style={styles.errorText}>Mật khẩu mới tối thiểu 6 ký tự</Text>
          )}
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.labelOnBorder}>Xác nhận mật khẩu</Text>
          <View
            style={[
              styles.inputBox,
              styles.passwordBox,
              focused.confirmPassword && styles.inputFocused,
              confirmError && styles.inputError,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor="#c5c5c5"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() =>
                setFocused((f) => ({ ...f, confirmPassword: true }))
              }
              onBlur={() => {
                setFocused((f) => ({ ...f, confirmPassword: false }));
                setTouched((t) => ({ ...t, confirmPassword: true }));
              }}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword((v) => !v)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
          {confirmError && (
            <Text style={styles.errorText}>Xác nhận mật khẩu không khớp</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.btn, !isFormValid && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading || !isFormValid}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Đổi mật khẩu</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contentWrap: { flexGrow: 1, paddingBottom: 32 },
  topSection: {
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    marginTop: 40,
  },
  backBtn: { marginBottom: 12 },
  logoSection: { alignItems: "center" },
  logoWrapper: {
    width: 60,
    height: 60,
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  logo: { width: "100%", height: "100%" },
  formTitle: {
    ...typography.H1,
    fontFamily,
    color: colors.pinkAccent,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 6,
    fontWeight: "800",
  },
  subtitle: {
    ...typography.PSmall,
    fontFamily,
    color: colors.textMuted,
    textAlign: "center",
  },
  formCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 32,
    minHeight: 420,
    overflow: "visible",
    marginTop: 8,
  },
  fieldWrap: { marginBottom: 14, overflow: "visible" },
  labelOnBorder: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    backgroundColor: colors.white,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    marginLeft: 10,
    marginBottom: -4,
    zIndex: 1,
    letterSpacing: 0.5,
  },
  inputBox: {
    ...inputShadow,
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  inputInnerSmall: {
    fontSize: 15,
    fontWeight: "400",
    fontFamily,
    color: colors.text,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
    fontFamily,
    color: colors.text,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginRight: 10,
  },
  inputFocused: {
    borderWidth: 2.3,
    borderColor: colors.pinkAccent,
    shadowColor: colors.pinkAccent,
    shadowOpacity: 0.15,
  },
  inputError: {
    borderWidth: 1.3,
    borderColor: "#dd4949",
    shadowColor: "#E57373",
    shadowOpacity: 0.2,
  },
  errorText: {
    ...typography.PSmall,
    fontFamily,
    color: "#E57373",
    marginTop: 6,
    marginLeft: 4,
  },
  btn: {
    width: "100%",
    backgroundColor: colors.pinkAccent,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#F4ABB4",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },
  btnDisabled: {
    backgroundColor: colors.pinkLight,
    shadowOpacity: 0.1,
    opacity: 0.8,
  },
  btnText: {
    ...typography.P,
    fontFamily,
    color: colors.white,
    fontWeight: "700",
    fontSize: 17,
  },
});
