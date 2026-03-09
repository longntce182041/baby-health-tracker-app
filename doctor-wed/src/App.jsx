import { useEffect, useState } from "react";
import DoctorDashboard from "./DoctorDashboard";
import LoginPage from "./page/loginPage";
import { setOnUnauthorized } from "./api/api";
import "./App.css";

const isDoctorAuthenticated = () => {
  const token = localStorage.getItem("accessToken");
  const userRaw = localStorage.getItem("user");
  if (!token || !userRaw) {
    return false;
  }

  try {
    const user = JSON.parse(userRaw);
    const role = String(user?.role || "").toLowerCase();
    return role === "doctor";
  } catch {
    return false;
  }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => isDoctorAuthenticated());

  useEffect(() => {
    setOnUnauthorized(() => {
      setIsLoggedIn(false);
    });

    return () => {
      setOnUnauthorized(null);
    };
  }, []);

  return isLoggedIn ? (
    <DoctorDashboard />
  ) : (
    <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
  );
}

export default App;
