import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { navigationRef } from "./navigationRef";
import CustomTabBar from "../components/CustomTabBar";
import { useAuth } from "../context/AuthContext";

import HomeScreen from "../screens/home/HomeScreen";
import WelcomeScreen from "../screens/auth/WelcomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ProfileScreen from "../screens/account/ProfileScreen";
import ProfileEditScreen from "../screens/account/ProfileEditScreen";
import BabyListScreen from "../screens/baby/BabyListScreen";
import GrowthChartScreen from "../screens/growth/GrowthChartScreen";
import BabyDetailScreen from "../screens/baby/BabyDetailScreen";
import BabyFormScreen from "../screens/baby/BabyFormScreen";
import HealthLogScreen from "../screens/healthLog/HealthLogScreen";
import HealthLogAddScreen from "../screens/healthLog/HealthLogAddScreen";
import VaccinationTabScreen from "../screens/vaccination/VaccinationTabScreen";
import VaccinationGuideScreen from "../screens/vaccination/VaccinationGuideScreen";
import VaccinationScheduleScreen from "../screens/vaccination/VaccinationScheduleScreen";
import VaccinationCatalogScreen from "../screens/vaccination/VaccinationCatalogScreen";
import VaccinationCatalogDetailScreen from "../screens/vaccination/VaccinationCatalogDetailScreen";
import VaccinationBookingScreen from "../screens/vaccination/VaccinationBookingScreen";
import VaccinationBookConfirmScreen from "../screens/vaccination/VaccinationBookConfirmScreen";
import VaccinationNotesScreen from "../screens/vaccination/VaccinationNotesScreen";
import DoctorListScreen from "../screens/consultation/DoctorListScreen";
import DoctorDetailScreen from "../screens/consultation/DoctorDetailScreen";
import ConsultationScreen from "../screens/consultation/ConsultationScreen";
import ChatScreen from "../screens/consultation/ChatScreen";
import NotificationScreen from "../screens/notification/NotificationScreen";
import PackageListScreen from "../screens/account/PackageListScreen";
import TransactionScreen from "../screens/account/TransactionScreen";
import TopUpPointsScreen from "../screens/account/TopUpPointsScreen";
import VerifyOTPScreen from "../screens/auth/VerifyOTPScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      tabBar={(props) => {
        return <CustomTabBar {...props} />;
      }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { position: "absolute", height: 100 },
      }}
    >
      <Tab.Screen
        name="ConsultationTab"
        component={DoctorListScreen}
        options={{ title: "Bác sĩ tư vấn" }}
      />
      <Tab.Screen
        name="HealthTab"
        component={GrowthChartScreen}
        options={{ title: "Biểu đồ thể trạng" }}
      />
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: "Trang chủ" }}
      />
      <Tab.Screen
        name="VaccinationTab"
        component={VaccinationTabScreen}
        options={{ title: "Tiêm chủng" }}
      />
      <Tab.Screen
        name="HealthLogTab"
        component={HealthLogScreen}
        options={{ title: "Nhật ký sức khỏe" }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isLoggedIn } = useAuth();
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        key={isLoggedIn ? "main" : "welcome"}
        screenOptions={{ headerShown: true }}
        initialRouteName={isLoggedIn ? "Main" : "Welcome"}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Đăng nhập", headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: "Đăng ký", headerShown: false }}
        />
        <Stack.Screen
          name="BabyDetail"
          component={BabyDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BabyForm"
          component={BabyFormScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BabyList"
          component={BabyListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HealthLog"
          component={HealthLogScreen}
          options={{ title: "Nhật ký sức khỏe" }}
        />
        <Stack.Screen
          name="HealthLogAdd"
          component={HealthLogAddScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="GrowthChart"
          component={GrowthChartScreen}
          options={{ title: "Biểu đồ thể trạng", headerShown: false }}
        />
        <Stack.Screen
          name="VaccinationGuide"
          component={VaccinationGuideScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VaccinationSchedule"
          component={VaccinationScheduleScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VaccinationCatalog"
          component={VaccinationCatalogScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VaccinationCatalogDetail"
          component={VaccinationCatalogDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VaccinationBooking"
          component={VaccinationBookingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VaccinationBookConfirm"
          component={VaccinationBookConfirmScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VaccinationNotes"
          component={VaccinationNotesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DoctorDetail"
          component={DoctorDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Consultation"
          component={ConsultationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notification"
          component={NotificationScreen}
          options={{ title: "Thông báo", headerShown: false }}
        />
        <Stack.Screen
          name="ProfileEdit"
          component={ProfileEditScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PackageList"
          component={PackageListScreen}
          options={{ title: "Gói dịch vụ" }}
        />
        <Stack.Screen
          name="Transaction"
          component={TransactionScreen}
          options={{ title: "Lịch sử giao dịch" }}
        />
        <Stack.Screen
          name="TopUpPoints"
          component={TopUpPointsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VerifyOTP"
          component={VerifyOTPScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
