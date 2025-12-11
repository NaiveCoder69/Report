import React, { createContext, useState, useEffect } from 'react';
import API from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const getDecodedToken = async (token) => {
    const { default: jwtDecode } = await import('jwt-decode');
    return jwtDecode(token);
  };

  const initializeUser = async () => {
    const token = localStorage.getItem('token');
    console.log("[AuthContext] initializeUser - token from localStorage:", token);
    if (!token) {
      console.log("[AuthContext] initializeUser - no token found; user will be null");
      setUser(null);
      return null;
    }

    try {
      const decoded = await getDecodedToken(token);
      console.log("[AuthContext] initializeUser - decoded token:", decoded);
      if (decoded.exp * 1000 < Date.now()) {
        console.log("[AuthContext] initializeUser - token expired; clearing token and user");
        localStorage.removeItem('token');
        setUser(null);
        return null;
      }
      // Fetch full profile from backend to get the latest role and other info
      await fetchUserProfile(token);
    } catch (err) {
      console.error("[AuthContext] initializeUser - error decoding token or fetching profile:", err);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  // Function to fetch current user details (including company, status, role, etc)
  const fetchUserProfile = async (token) => {
    try {
      console.log("[AuthContext] fetchUserProfile - fetching user profile");
      const res = await API.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("[AuthContext] fetchUserProfile - profile fetched:", res.data);
      setUser({ token, ...res.data });
      console.log("[AuthContext] fetchUserProfile - user state updated");
    } catch (error) {
      console.error('[AuthContext] fetchUserProfile - failed to fetch user profile:', error);
      logout();
    }
  };

  useEffect(() => {
    initializeUser();
  }, []);

  // Log in user, store JWT and fetch profile
 const login = async (email, password) => {
  const res = await API.post('/auth/login', { email, password });
  const { token } = res.data;
  localStorage.setItem('token', token);
  await fetchUserProfile(token); // this sets user state
  // no return needed
};

  // Log out user and clear token and state
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Register user - just API call without login
  const register = async (payload) => {
    const res = await API.post('/auth/register', payload);
    return res.data.user;
  };

  // New helper to refresh user data manually after join or approval events
  const refreshUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetchUserProfile(token);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, register, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
