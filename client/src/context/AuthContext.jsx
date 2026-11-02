import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('menuqr_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('menuqr_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setRestaurant(res.data.restaurant);
          localStorage.setItem('menuqr_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.error('Session validation error:', err);
        localStorage.removeItem('menuqr_token');
        localStorage.removeItem('menuqr_user');
        setUser(null);
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('menuqr_token', res.data.token);
      localStorage.setItem('menuqr_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setRestaurant(res.data.restaurant);
    }
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.success) {
      localStorage.setItem('menuqr_token', res.data.token);
      localStorage.setItem('menuqr_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setRestaurant(null);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('menuqr_token');
    localStorage.removeItem('menuqr_user');
    setUser(null);
    setRestaurant(null);
  };

  const refreshRestaurant = async () => {
    try {
      const res = await api.get('/restaurant/me');
      if (res.data.success) {
        setRestaurant(res.data.restaurant);
      }
    } catch (err) {
      console.warn('Could not refresh restaurant:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        restaurant,
        setRestaurant,
        loading,
        login,
        register,
        logout,
        refreshRestaurant,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
