import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated, logout as logoutService } from '../api/authApi';
import { getProfile } from '../api/userApi';
import { setItem } from '../storage';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (await isAuthenticated()) {
          const u = await getCurrentUser();
          let merged = u || null;
          try {
            const profileRes = await getProfile();
            if (profileRes?.success && profileRes?.data) {
              merged = { ...(u || {}), ...profileRes.data };
            }
          } catch (e) {
          }
          if (merged) {
            setUser(merged);
          }
        }
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const login = (userData) => setUser(userData);

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  const updateUser = async (userData) => {
    setUser(userData);
    await setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, loading, isLoggedIn: !!user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
