import React, { useState } from "react";
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
import { forgotPassword } from "../../api/authApi";
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

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  const isFormValid = Boolean(email.trim() && isValidEmail(email));
  const showErrorEmail = touched && (!email.trim() || !isValidEmail(email));

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert("Lỗi", "Email không đúng định dạng");
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(trimmedEmail);
      setLoading(false);
      navigation.navigate("ResetPassword", { email: trimmedEmail });
      setTimeout(() => {
        Alert.alert(
          "Thành công",
          res?.message ||
            "Đã gửi OTP đặt lại mật khẩu. Vui lòng kiểm tra email của bạn.",
        );
      }, 300);
    } catch (error) {
      setLoading(false);
      Alert.alert(
        "Lỗi",
        error?.message || error?.response?.data?.message || "Gửi OTP thất bại",
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
              source={require("../../../assets/images/logoBeTiny.png")}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.formTitle}>Quên mật khẩu</Text>
          <Text style={styles.subtitle}>Nhập email để nhận mã OTP</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <View style={styles.fieldWrap}>
          <Text style={styles.labelOnBorder}>Email</Text>
          <View
            style={[
              styles.inputBox,
              focused && styles.inputFocused,
              showErrorEmail && styles.inputError,
            ]}
          >
            <TextInput
              style={styles.inputInnerSmall}
              placeholder="Nhập email"
              placeholderTextColor="#c5c5c5"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false);
                setTouched(true);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {showErrorEmail && (
            <Text style={styles.errorText}>
              {!email.trim()
                ? "Vui lòng nhập email"
                : "Email không đúng định dạng"}
            </Text>
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
            <Text style={styles.btnText}>Gửi mã OTP</Text>
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
    minHeight: 320,
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
