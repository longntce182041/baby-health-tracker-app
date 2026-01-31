import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "./src/screens/auth/WelcomeScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import OPTVerifyScreen from "./src/screens/auth/OtpVerifyScreen";
import ForgotPassWord from "./src/screens/auth/ForgotPassWordScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
          cardStyle: { backgroundColor: "#FFF" },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OtpVerify" component={OPTVerifyScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassWord} />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
