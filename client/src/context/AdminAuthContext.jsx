import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin, getAdminMe } from '../services/adminService';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('scp_admin_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (token) {
        try {
          const user = await getAdminMe();
          setAdminUser(user);
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await loginAdmin(email, password);
    setToken(data.token);
    setAdminUser(data.user);
    localStorage.setItem('scp_admin_token', data.token);
    return data;
  };

  const logout = () => {
    setToken(null);
    setAdminUser(null);
    localStorage.removeItem('scp_admin_token');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
