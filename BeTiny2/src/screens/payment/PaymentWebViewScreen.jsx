import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { colors, typography } from "../../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateTransactionStatus } from "../../api/paymentApi";

const { fontFamily } = typography;

export default function PaymentWebViewScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef(null);

  const { paymentUrl, orderCode } = route.params;

  const handleNavigationStateChange = async (navState) => {
    const { url } = navState;

    setCanGoBack(navState.canGoBack);

    console.log("WebView navigated to:", url);

    // Check if user reached success page
    if (url.includes("success.payos.vn") || url.includes("payment-success")) {
      console.log("Payment success detected!");
      console.log("Order code:", orderCode);

      // Refresh user points
      try {
        await refreshUser();
        const pendingPayment = await AsyncStorage.getItem("pendingPayment");
        if (pendingPayment) {
          const { transactionId } = JSON.parse(pendingPayment);
          // Update transaction status to completed
          await updateTransactionStatus(transactionId, "completed");
          await AsyncStorage.removeItem("pendingPayment");
        }
        // Show success message
        Alert.alert(
          "Thành công!",
          "Thanh toán thành công! Điểm đã được cộng vào tài khoản.",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate back to home
                navigation.navigate("Main", { screen: "HomeTab" });
              },
            },
          ],
        );
      } catch (error) {
        console.error("Refresh user error:", error);
        Alert.alert(
          "Thành công!",
          "Thanh toán thành công! Vui lòng kiểm tra lại điểm trong tài khoản.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Main"),
            },
          ],
        );
      }
    }

    // Check if user cancelled payment
    if (url.includes("cancel.payos.vn") || url.includes("payment-cancel")) {
      console.log("Payment cancelled detected!");

      Alert.alert(
        "Đã hủy",
        "Bạn đã hủy thanh toán. Vui lòng thử lại nếu cần.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ],
      );
    }
  };

  const handleClose = () => {
    Alert.alert(
      "Đóng thanh toán?",
      "Bạn có chắc muốn đóng? Giao dịch có thể chưa hoàn tất.",
      [
        {
          text: "Tiếp tục thanh toán",
          style: "cancel",
        },
        {
          text: "Đóng",
          onPress: () => navigation.goBack(),
          style: "destructive",
        },
      ],
    );
  };

  const handleGoBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === "android" && (
        <StatusBar
          backgroundColor={colors.pinkAccent}
          barStyle="light-content"
        />
      )}

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán PayOS</Text>
        <TouchableOpacity
          style={[styles.headerBtn, !canGoBack && styles.headerBtnDisabled]}
          onPress={handleGoBack}
          activeOpacity={0.7}
          disabled={!canGoBack}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={canGoBack ? colors.white : "rgba(255,255,255,0.4)"}
          />
        </TouchableOpacity>
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.pinkAccent} />
            <Text style={styles.loadingText}>Đang tải trang thanh toán...</Text>
          </View>
        )}
      />

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.pinkAccent} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.pinkAccent,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnDisabled: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily,
    fontWeight: "700",
    color: colors.white,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily,
    color: colors.textSecondary,
  },
});
