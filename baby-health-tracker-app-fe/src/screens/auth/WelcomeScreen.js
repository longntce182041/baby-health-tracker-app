import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";

const WelcomeScreen = ({ navigation }) => {
  const handleLoginPress = () => {
    navigation.navigate("Login");
    // TODO: Navigate to login screen
  };

  const handleRegisterPress = () => {
    navigation.navigate("Register");
  };

  return (
    <ImageBackground
      source={require("../../assets/images/image 17.png")}
      resizeMode="cover"
      style={styles.background}
    >
      <View style={styles.container}>
        {/* Top Section: Title */}
        <View style={styles.topSection}>
          <Text style={styles.title}>Chào mừng đến với</Text>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/logoBeTiny-Photoroom 1.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Middle Section: Description */}
        <View style={styles.middleSection}>
          <Text style={styles.description}>
            Cùng đồng hành trong{"\n"}hành trình phát triển của bé!
          </Text>
        </View>

        {/* Bottom Section: Buttons */}
        <SafeAreaView style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLoginPress}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegisterPress}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>Đăng ký</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  topSection: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 30,
    textAlign: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 100,
    height: 100,
  },
  middleSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 14,
    color: "#FFF",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomSection: {
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loginButton: {
    backgroundColor: "#FF4B8B",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#FF4B8B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  registerButton: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF4B8B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});

export default WelcomeScreen;
