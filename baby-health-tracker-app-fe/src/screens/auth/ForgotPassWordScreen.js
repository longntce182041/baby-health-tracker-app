import React, { useState } from "react";
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

// Helper function to validate Vietnamese phone numbers
const isValidVietnamPhone = (phone) => {
  // Accepts:
  // - 0[3|5|7|8|9]XXXXXXXX (10 digits starting with 03, 05, 07, 08, or 09)
  // - +84[3|5|7|8|9]XXXXXXXX (12 chars starting with +84 then 3, 5, 7, 8, or 9)
  const regex = /^(0[3|5|7|8|9][0-9]{8}|(\+84)[3|5|7|8|9][0-9]{8})$/;
  return regex.test(phone.trim());
};

const ForgotPasswordScreen = ({ navigation }) => {
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);

  const isValidPhone = isValidVietnamPhone(phone);
  const canSubmit = isValidPhone;

  // Determine error message
  const getErrorMessage = () => {
    if (!touched) return "";
    if (phone.trim().length === 0) {
      return "Vui lòng nhập số điện thoại.";
    }
    if (!isValidPhone) {
      return "Số điện thoại không hợp lệ. Vui lòng nhập sđt Việt Nam.";
    }
    return "";
  };

  const errorMessage = getErrorMessage();
  const hasError = touched && errorMessage.length > 0;

  const handleSubmit = () => {
    setTouched(true);
    if (canSubmit) {
      navigation.navigate("OtpVerify", {
        phoneMasked: phone.replace(/.(?=.{4})/g, "*"),
      });
      console.log("Forgot password for:", phone.trim());
      // TODO: Call forgot password API
      // After API success, navigate to OTP screen
      // navigation.navigate("OtpVerify", { phoneMasked: maskPhone(phone) });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleGoToLogin = () => {
    navigation.navigate("Login");
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
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

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

            <Text style={styles.title}>Quên mật khẩu</Text>
            <Text style={styles.subtitle}>Nhập sđt để nhận mã otp</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Số điện thoại</Text>
              <View
                style={[
                  styles.inputWrapper,
                  hasError && styles.inputWrapperError,
                ]}
              >
                <Text style={styles.inputIcon}>📱</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    if (!touched) setTouched(true);
                  }}
                  keyboardType="phone-pad"
                />
              </View>
              {hasError && <Text style={styles.errorText}>{errorMessage}</Text>}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              canSubmit
                ? styles.submitButtonActive
                : styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={canSubmit ? 0.8 : 1}
          >
            <Text style={styles.submitButtonText}>Gửi</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={handleGoToLogin}>
              <Text style={styles.footerLink}>Đăng nhập ngay</Text>
            </TouchableOpacity>
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
    paddingTop: 12,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  backIcon: {
    fontSize: 28,
    color: "#333",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 20,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
  formSection: {
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#FF4B8B",
    paddingHorizontal: 12,
    height: 48,
  },
  inputWrapperError: {
    borderColor: "#E53935",
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 11,
    color: "#E53935",
    marginTop: 6,
  },
  submitButton: {
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonActive: {
    backgroundColor: "#FF4B8B",
  },
  submitButtonDisabled: {
    backgroundColor: "#CFCFCF",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: "#666",
  },
  footerLink: {
    fontSize: 12,
    color: "#FF4B8B",
    fontWeight: "600",
  },
});

export default ForgotPasswordScreen;
