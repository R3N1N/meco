import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync session on startup
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('eyecare_token');
      if (token) {
        try {
          // Fetch fresh user data
          const res = await API.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('eyecare_user', JSON.stringify(res.data.user));
        } catch (error) {
          console.error('Session restore failed. Logging out...', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token, user: loggedUser } = res.data;
      
      localStorage.setItem('eyecare_token', token);
      localStorage.setItem('eyecare_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (name, email, password, phone, address) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', { name, email, password, phone, address });
      const { token, user: registeredUser } = res.data;

      localStorage.setItem('eyecare_token', token);
      localStorage.setItem('eyecare_user', JSON.stringify(registeredUser));
      setUser(registeredUser);
      return registeredUser;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('eyecare_token');
    localStorage.removeItem('eyecare_user');
    setUser(null);
  };

  // Update profile details
  const updateProfile = async (name, phone, address) => {
    try {
      const res = await API.put('/auth/profile', { name, phone, address });
      const updatedUser = { ...user, name, phone, address };
      setUser(updatedUser);
      localStorage.setItem('eyecare_user', JSON.stringify(updatedUser));
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update profile';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
