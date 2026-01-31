import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const RegisterScreen = ({ navigation }) => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form validation
  const isFormValid =
    phone.trim().length > 0 &&
    password.length >= 6 &&
    password === confirmPassword;

  const handleRegister = () => {
    if (isFormValid) {
      console.log("Register with:", { phone, password });
      // TODO: Handle registration
    }
  };

  const handleGoToLogin = () => {
    navigation.goBack();
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
          {/* Header Section */}
          <View style={styles.header}>
            {/* Logo */}
            <View style={styles.logoSection}>
              <Image
                source={require("../../assets/images/logoBeTiny-Photoroom 1.png")}
                style={styles.logoIcon}
                resizeMode="contain"
              />
              <Text style={styles.appName}>Bé Tiny</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Đăng ký tài khoản</Text>

            {/* Subtitle */}
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>
                Cùng chăm sóc sức khỏe bé yêu mỗi ngày
              </Text>
              <Text style={styles.heart}>♥</Text>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Phone Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Số điện thoại</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📱</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={[styles.input, styles.inputWithRightIcon]}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={[styles.input, styles.inputWithRightIcon]}
                  placeholder="Xác nhận mật khẩu"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text>{showConfirmPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              isFormValid
                ? styles.registerButtonActive
                : styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={!isFormValid}
            activeOpacity={isFormValid ? 0.8 : 1}
          >
            <Text style={styles.registerButtonText}>Đăng ký</Text>
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
    backgroundColor: "#FFF",
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoIcon: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF4B8B",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  heart: {
    fontSize: 14,
    color: "#FF4B8B",
    marginLeft: 6,
  },
  formSection: {
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    paddingVertical: 10,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  eyeIcon: {
    padding: 10,
    marginLeft: 5,
  },
  registerButton: {
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  registerButtonActive: {
    backgroundColor: "#FF4B8B",
  },
  registerButtonDisabled: {
    backgroundColor: "#CFCFCF",
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
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

export default RegisterScreen;
