import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authApi from "../api/authApi";
import { setOnUnauthorized } from "../api/api";
import { navigationRef } from "../navigation/navigationRef";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Setup unauthorized handler
  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
      setIsLoggedIn(false);
      navigationRef.navigate("Login");
    });
  }, []);

  // Kiểm tra token khi app khởi động
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const response = await authApi.getProfile();
          setUser(response.data);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Token check failed:", error);
        await AsyncStorage.removeItem("authToken");
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authApi.loginParent(email, password);
      const { token } = response.data;
      await AsyncStorage.setItem("authToken", token);
      const profileResponse = await authApi.getProfile();
      setUser(profileResponse.data);
      setIsLoggedIn(true);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password) => {
    try {
      const response = await authApi.registerParent(email, password);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("authToken");
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
