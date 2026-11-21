import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  switchRole: (role: UserRole) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  language: 'en' | 'ml';
  setLanguage: (lang: 'en' | 'ml') => void;
}

const DEFAULT_CITIZEN: User = {
  id: 3,
  email: 'citizen@nexus.gov.in',
  full_name: 'Naveen George',
  role: 'citizen',
  locality: 'Kakkanad SmartCity Zone',
  phone: '+91 97455 33445',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nexus_user');
    return saved ? JSON.parse(saved) : DEFAULT_CITIZEN;
  });
  const [role, setRole] = useState<UserRole>(user?.role || 'citizen');
  const [token, setToken] = useState<string | null>(localStorage.getItem('nexus_token') || 'demo-token');
  const [language, setLanguage] = useState<'en' | 'ml'>(() => {
    return (localStorage.getItem('nexus_lang') as 'en' | 'ml') || 'en';
  });

  useEffect(() => {
    if (user) {
      setRole(user.role);
      localStorage.setItem('nexus_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nexus_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('nexus_lang', language);
  }, [language]);

  const switchRole = async (newRole: UserRole) => {
    try {
      const data = await api.quickSwitchRole(newRole);
      setUser(data.user);
      setRole(newRole);
      setToken(data.token);
      localStorage.setItem('nexus_token', data.token);
    } catch (err) {
      console.warn("API switch failed, switching locally for demo resilience:", err);
      const fallbackUsers: Record<UserRole, User> = {
        citizen: DEFAULT_CITIZEN,
        admin: {
          id: 1,
          email: 'admin@nexus.gov.in',
          full_name: 'Arjun Menon (Director of Civic Operations)',
          role: 'admin',
          locality: 'Kochi Municipal Headquarters',
        },
        volunteer: {
          id: 2,
          email: 'volunteer@nexus.gov.in',
          full_name: 'Reshma Pillai (Field Response Team)',
          role: 'volunteer',
          locality: 'Aluva & Kalamassery Sector',
        },
      };
      setUser(fallbackUsers[newRole]);
      setRole(newRole);
    }
  };

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    setUser(data.user);
    setRole(data.user.role);
    setToken(data.token);
    localStorage.setItem('nexus_token', data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        switchRole,
        login,
        logout,
        language,
        setLanguage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
