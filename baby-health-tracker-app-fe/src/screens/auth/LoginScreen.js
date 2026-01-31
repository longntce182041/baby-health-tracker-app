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

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touchedPhone, setTouchedPhone] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);

  const isFormValid = phone.trim().length > 0 && password.trim().length > 0;

  const handleLogin = () => {
    if (!isFormValid) {
      setTouchedPhone(true);
      setTouchedPassword(true);
      return;
    }
    console.log("Login with:", { phone, password });
    // TODO: Handle login API call
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const showPhoneError = touchedPhone && phone.trim().length === 0;
  const showPasswordError = touchedPassword && password.trim().length === 0;

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
              <Text style={styles.blueHeart}>💙</Text>
              <Image
                source={require("../../assets/images/logoBeTiny-Photoroom 1.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.appName}>Bé Tiny</Text>
            </View>

            <Text style={styles.title}>Chào mừng mẹ quay trở lại</Text>
            <Text style={styles.subtitle}>
              Đăng nhập để tiếp tục hành trình cùng bé
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {/* Phone */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Số điện thoại</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📱</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Vui lòng nhập sđt."
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    if (!touchedPhone) setTouchedPhone(true);
                  }}
                  keyboardType="phone-pad"
                />
              </View>
              {showPhoneError && (
                <Text style={styles.errorText}>Vui lòng nhập sđt.</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={[styles.input, styles.inputWithRightIcon]}
                  placeholder="Vui lòng nhập mật khẩu."
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (!touchedPassword) setTouchedPassword(true);
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.errorRow}>
                {showPasswordError ? (
                  <Text style={styles.errorText}>Vui lòng nhập mật khẩu.</Text>
                ) : (
                  <Text style={styles.errorPlaceholder}> </Text>
                )}
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isFormValid
                ? styles.loginButtonActive
                : styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={!isFormValid}
            activeOpacity={isFormValid ? 0.8 : 1}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
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
    marginBottom: 24,
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  blueHeart: {
    fontSize: 14,
    marginBottom: 4,
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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
  formSection: {
    marginTop: 10,
  },
  fieldContainer: {
    marginBottom: 18,
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
  inputWithRightIcon: {
    paddingRight: 0,
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    fontSize: 11,
    color: "#E53935",
    marginTop: 6,
  },
  errorPlaceholder: {
    fontSize: 11,
    color: "transparent",
    marginTop: 6,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  forgotText: {
    fontSize: 11,
    color: "#777",
    marginTop: 6,
  },
  loginButton: {
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonActive: {
    backgroundColor: "#FF4B8B",
  },
  loginButtonDisabled: {
    backgroundColor: "#CFCFCF",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
});

export default LoginScreen;
