import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hrms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('hrms_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('hrms_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res?.data) {
            setUser(res.data);
            localStorage.setItem('hrms_user', JSON.stringify(res.data));
          }
        } catch (error) {
          console.error('Failed to load profile:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res?.data) {
      const { user: userData, accessToken, refreshToken } = res.data;
      setUser(userData);
      setToken(accessToken);
      localStorage.setItem('hrms_token', accessToken);
      localStorage.setItem('hrms_refresh_token', refreshToken);
      localStorage.setItem('hrms_user', JSON.stringify(userData));
      return userData;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authApi.logout();
      }
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('hrms_token');
      localStorage.removeItem('hrms_refresh_token');
      localStorage.removeItem('hrms_user');
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await authApi.getMe();
      if (res?.data) {
        setUser(res.data);
        localStorage.setItem('hrms_user', JSON.stringify(res.data));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const forceChangePassword = async (payload) => {
    const res = await authApi.forceChangePassword(payload);
    if (res?.data) {
      const { user: userData, accessToken, refreshToken } = res.data;
      setUser(userData);
      setToken(accessToken);
      localStorage.setItem('hrms_token', accessToken);
      localStorage.setItem('hrms_refresh_token', refreshToken);
      localStorage.setItem('hrms_user', JSON.stringify(userData));
      return userData;
    }
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isSuperAdmin = user?.role === 'Super Admin';
  const isHR = user?.role === 'HR Manager' || user?.role === 'HR Admin';
  const isManager = user?.role === 'Manager';
  const isEmployee = user?.role === 'Employee';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        forceChangePassword,
        refreshProfile,
        hasRole,
        isSuperAdmin,
        isHR,
        isManager,
        isEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
