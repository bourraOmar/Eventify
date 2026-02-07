'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => { },
  logout: () => { },
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToast } = useToast();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Initialize auth state from local storage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser && storedUser !== 'undefined') {
      try {
        // eslint-disable-next-line
        setToken(storedToken);
        // eslint-disable-next-line
        setUser(JSON.parse(storedUser));
      } catch (_) {
        // If parsing fails, clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    addToast('success', `Welcome back, ${newUser.name || 'User'}!`, 'Logged In');

    // Small delay to ensure localStorage is updated before redirect
    setTimeout(() => {
      // Redirect based on role
      if (newUser.role === UserRole.ADMIN) {
        router.push('/dashboard/admin');
      } else {
        router.push('/events'); // Or participant dashboard
      }
    }, 100);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    addToast('info', 'You have been logged out.', 'Logged Out');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === UserRole.ADMIN,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
