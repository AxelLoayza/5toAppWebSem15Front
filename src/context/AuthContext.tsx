'use client';

import React, { createContext, useContext, useState } from 'react';
import { User, LoginCredentials, RegisterData, AuthResponse } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  });
  
  const [loading] = useState(false);

  const login = async (credentials: LoginCredentials) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al iniciar sesión');
    }

    const data: AuthResponse = await res.json();
    
    if (data.success) {
      setUser(data.data.user);
      setToken(data.data.token);
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Establecer cookies para el middleware
      document.cookie = `token=${data.data.token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 días
      document.cookie = `user=${encodeURIComponent(JSON.stringify(data.data.user))}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }
  };

  const register = async (registerData: RegisterData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al registrarse');
    }

    const data: AuthResponse = await res.json();
    
    if (data.success) {
      setUser(data.data.user);
      setToken(data.data.token);
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Establecer cookies para el middleware
      document.cookie = `token=${data.data.token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 días
      document.cookie = `user=${encodeURIComponent(JSON.stringify(data.data.user))}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Eliminar cookies
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'user=; path=/; max-age=0';
  };

  const isAdmin = user?.rol === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
