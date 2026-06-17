import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

export interface User {
  id?: number;
  name: string;
  email?: string;
  role: 'guest' | 'bidder' | 'seller' | 'expert' | 'admin';
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
          setUser({
            id: storedUser.id,
            email: storedUser.email,
            name: storedUser.fullName,
            role: storedUser.role.toLowerCase() as User['role']
          });
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, login, logout, isGuest: !user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;