import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id?: number;
  name: string;
  email?: string;
  role: 'guest' | 'bidder' | 'seller' | 'expert' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: check if there's an existing session (JWT in HttpOnly cookie is validated server-side)
  useEffect(() => {
    const checkSession = async () => {
      try {
        // TODO: Replace with real API call
        // const res = await fetch('/api/auth/me', { credentials: 'include' });
        // if (res.ok) { const data = await res.json(); setUser(data.user); }

        // Check localStorage for demo (remove in production — use cookie/server)
        const stored = sessionStorage.getItem('artpulse_demo_user');
        if (stored) setUser(JSON.parse(stored));
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
    // Demo only — real auth uses HttpOnly cookies set by backend
    sessionStorage.setItem('artpulse_demo_user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // TODO: await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      setUser(null);
      sessionStorage.removeItem('artpulse_demo_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isGuest: !user }}>
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