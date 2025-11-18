import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem('crm_auth');
    const storedUser = localStorage.getItem('crm_user');
    if (storedAuth === 'true' && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email, password) => {
    const mockUser = {
      id: '1',
      name: 'Admin User',
      email: email,
      role: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    };
    
    setIsAuthenticated(true);
    setUser(mockUser);
    localStorage.setItem('crm_auth', 'true');
    localStorage.setItem('crm_user', JSON.stringify(mockUser));
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('crm_auth');
    localStorage.removeItem('crm_user');
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}