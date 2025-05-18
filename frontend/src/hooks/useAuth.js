// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const useAuth = () => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setAuth(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post('/', { email, password });
      
      localStorage.setItem('auth_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setAuth(response.data.user);
      
      return response.data.user;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post('/logout');
      clearAuth();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      clearAuth(); // Still clear auth even if API call fails
      navigate('/login');
    }
  };

  // Clear authentication data
  const clearAuth = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setAuth(null);
  };

  return { 
    auth, 
    loading, 
    login, 
    logout,
    isAuthenticated: !!auth,
    isAdmin: auth?.role === 'admin',
    isSalesRep: auth?.role === 'sales_rep'
  };
};

export default useAuth;