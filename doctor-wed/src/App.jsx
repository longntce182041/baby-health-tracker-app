import { useState } from "react";
import DoctorDashboard from "./DoctorDashboard";
import LoginPage from "./page/loginPage";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // For testing, you can toggle between login and dashboard
  // Change to true to see dashboard, false to see login page
  return isLoggedIn ? <DoctorDashboard /> : <LoginPage />;
}

export default App;
