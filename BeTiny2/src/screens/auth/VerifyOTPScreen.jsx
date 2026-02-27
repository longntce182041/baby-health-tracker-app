import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { colors, typography } from "../../theme";
import { verifyOtp } from "../../api/authApi";

const OTP_LENGTH = 5;
const RESEND_SECONDS = 30;

export default function VerifyOTP({ route, navigation }) {
  const { email = "", phone = "" } = route.params || {};
  const inputsRef = useRef([]);
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [counter, setCounter] = useState(RESEND_SECONDS);
  const [loading, setLoading] = useState(false);

  // Đếm ngược resend
  useEffect(() => {
    if (counter <= 0) return;
    const t = setInterval(() => setCounter((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [counter]);

  const maskPhone = (p) => {
    if (!p) return "";
    if (p.length < 3) return p;
    const head = p.slice(0, 3);
    const tail = p.slice(-3);
    return `${head}***${tail}`;
  };

  const focusNext = (idx) => {
    if (idx < OTP_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const focusPrev = (idx) => {
    if (idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handleChange = (text, idx) => {
    const val = text.replace(/[^0-9]/g, "");
    const next = [...digits];
    next[idx] = val.slice(-1); // chỉ 1 ký tự
    setDigits(next);
    if (val && idx < OTP_LENGTH - 1) focusNext(idx);

    const code = next.join("");
    if (code.length === OTP_LENGTH && code.indexOf("") === -1) {
      submit(code);
    }
  };

  const handleKeyPress = ({ nativeEvent }, idx) => {
    if (nativeEvent.key === "Backspace" && !digits[idx]) {
      focusPrev(idx);
    }
  };

  const submit = async (code) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await verifyOtp(email, code); // backend: { email, otp }
      if (res?.data?.success) {
        Alert.alert("Thành công", "Xác thực OTP thành công!");
        navigation.reset({ index: 0, routes: [{ name: "HomeScreen" }] });
      } else {
        Alert.alert("Lỗi", res?.data?.message || "OTP không hợp lệ");
      }
    } catch (e) {
      Alert.alert(
        "Lỗi",
        e?.response?.data?.message || e?.message || "OTP không hợp lệ",
      );
    } finally {
      setLoading(false);
    }
  };

  const resend = () => {
    if (counter > 0) return;
    // TODO: gọi API gửi lại OTP nếu có
    setCounter(RESEND_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(""));
    inputsRef.current[0]?.focus();
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Image
          source={require("../../../assets/images/logoBeTiny.bmp")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brand}>Bé Tiny</Text>
      </View>

      <Text style={styles.title}>Kiểm tra tin nhắn của bạn</Text>
      <Text style={styles.subtitle}>
        Chúng tôi đã gửi mã xác thực đến sđt{"\n"}
        {maskPhone(phone)}
      </Text>

      <View style={styles.otpRow}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            style={styles.otpInput}
            value={d}
            onChangeText={(t) => handleChange(t, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            selectionColor={colors.pinkAccent}
            autoFocus={i === 0}
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={resend}
        disabled={counter > 0}
        style={styles.resendWrap}
      >
        <Text
          style={[
            styles.resendText,
            counter > 0 && { color: colors.textMuted },
          ]}
        >
          {counter > 0
            ? `Gửi lại mã (00:${counter.toString().padStart(2, "0")})`
            : "Gửi lại mã"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: "center",
  },
  logoWrap: { alignItems: "center", marginBottom: 12 },
  logo: { width: 120, height: 120 },
  brand: {
    ...typography.H3,
    color: colors.pinkAccent,
    marginTop: -8,
    fontWeight: "700",
  },
  title: {
    ...typography.H2,
    color: colors.text,
    textAlign: "center",
    fontWeight: "800",
    marginTop: 6,
  },
  subtitle: {
    ...typography.P,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 22,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 32,
    width: "100%",
  },
  otpInput: {
    width: 54,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.pinkAccent,
    backgroundColor: colors.white,
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    ...typography.P,
  },
  resendWrap: { marginTop: 24 },
  resendText: {
    ...typography.PMedium,
    fontWeight: "600",
    color: colors.pinkAccent,
  },
});
