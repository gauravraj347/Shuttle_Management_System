import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      try {
        if (localStorage.getItem('token')) {
          setToken(localStorage.getItem('token'));
          const response = await authApi.me();
          
          if (response.data.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        setToken(null);
        setError('Authentication error. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.register(userData);
      
      if (response.data.success) {
        const newToken = response.data.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.login(email, password);
      
      if (response.data.success) {
        const newToken = response.data.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        token,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 