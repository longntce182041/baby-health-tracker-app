import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const OtpVerifyScreen = ({
  phoneMasked,
  onVerify,
  onResendCode,
  initialSeconds = 30,
  autoSubmitOnComplete = true,
  errorMessage = "",
}) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [canResend, setCanResend] = useState(false);

  // Create refs for each input box
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft > 0) {
      const timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [secondsLeft]);

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Handle digit input
  const handleChangeText = (text, index) => {
    // Only allow numeric input
    const digit = text.replace(/[^0-9]/g, "");

    if (digit.length === 0) {
      // Handle backspace
      const newCode = [...code];
      newCode[index] = "";
      setCode(newCode);

      // Move to previous box
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      }
      return;
    }

    // Handle paste or multiple digits
    if (digit.length > 1) {
      const digits = digit.slice(0, 6).split("");
      const newCode = [...code];

      for (let i = 0; i < digits.length && index + i < 6; i++) {
        newCode[index + i] = digits[i];
      }

      setCode(newCode);

      // Move focus to next empty box or last box
      const nextEmptyIndex = newCode.findIndex((d) => d === "");
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
        setActiveIndex(nextEmptyIndex);
      } else {
        inputRefs.current[5]?.focus();
        setActiveIndex(5);

        // Auto-submit if enabled and all digits filled
        if (autoSubmitOnComplete) {
          const fullCode = newCode.join("");
          if (fullCode.length === 6) {
            setTimeout(() => onVerify(fullCode), 100);
          }
        }
      }
      return;
    }

    // Single digit input
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    // Move to next box
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    } else {
      // Last digit entered
      setActiveIndex(5);

      // Auto-submit if enabled
      if (autoSubmitOnComplete) {
        const fullCode = newCode.join("");
        if (fullCode.length === 6) {
          setTimeout(() => onVerify(fullCode), 100);
        }
      }
    }
  };

  // Handle key press (for backspace)
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && code[index] === "") {
      // If current box is empty, move to previous
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      }
    }
  };

  // Handle resend code
  const handleResendCode = () => {
    if (canResend) {
      setCanResend(false);
      setSecondsLeft(initialSeconds);
      // Reset OTP code and focus to first box
      setCode(["", "", "", "", "", ""]);
      setActiveIndex(0);
      inputRefs.current[0]?.focus();
      // Call parent resend handler
      onResendCode();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Image
                source={require("../../assets/images/logoBeTiny-Photoroom 1.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.appName}>Bé Tiny</Text>
            </View>

            <Text style={styles.title}>Kiểm tra tin nhắn của bạn</Text>
            <Text style={styles.subtitle}>
              Chúng tôi đã gửi mã xác thực đến sđt
            </Text>
            <Text style={styles.phoneMasked}>{phoneMasked}</Text>
          </View>

          {/* OTP Input Boxes */}
          <View style={styles.otpContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpBox,
                  activeIndex === index && styles.otpBoxActive,
                  errorMessage && styles.otpBoxError,
                ]}
                value={digit}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => setActiveIndex(index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* Resend Code Timer */}
          <View style={styles.resendContainer}>
            {canResend ? (
              <TouchableOpacity onPress={handleResendCode}>
                <Text style={styles.resendTextActive}>Gửi lại mã</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendTextDisabled}>
                Gửi lại mã ({formatTime(secondsLeft)})
              </Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFEFF5",
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF4B8B",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    marginBottom: 4,
  },
  phoneMasked: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF4B8B",
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 24,
    gap: 8,
  },
  otpBox: {
    width: 48,
    height: 56,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#FF4B8B",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
  },
  otpBoxActive: {
    borderColor: "#E91E63",
    borderWidth: 2.5,
  },
  otpBoxError: {
    borderColor: "#E53935",
  },
  errorText: {
    fontSize: 12,
    color: "#E53935",
    textAlign: "center",
    marginTop: -12,
    marginBottom: 12,
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  resendTextDisabled: {
    fontSize: 13,
    color: "#999",
    fontWeight: "500",
  },
  resendTextActive: {
    fontSize: 13,
    color: "#FF4B8B",
    fontWeight: "700",
  },
});

export default OtpVerifyScreen;
