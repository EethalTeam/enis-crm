import React, { createContext, useContext, useState, useEffect } from 'react';
import { config } from '@/components/CustomComponents/config.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start true to check localstorage first

  // --- NEW: Restore Session on Page Refresh ---
  useEffect(() => {
    const checkLoggedIn = () => {
      const token = localStorage.getItem('token');
      const employeeName = localStorage.getItem('EmployeeName');
      
      if (token && employeeName) {
        // Reconstruct user object from storage
        setUser({
          token: token,
          EmployeeName: employeeName,
          EmployeeID: localStorage.getItem('EmployeeID'),
          role: localStorage.getItem('role'), // Note: this is base64 encoded
          departmentId: localStorage.getItem('departmentId'),
          unitId: localStorage.getItem('unitId'),
        });
      }
      setIsLoading(false); // Finished checking
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password, rememberMe) => {
    setIsLoading(true);
    const employeeCode = email; 

    try {
      let url = config.Api + "Auth/login";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeCode: employeeCode, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Login failed.");
      }

      const result = await response.json();

      if (result.data && result.data.EmployeeName) {
        // Save to Storage
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("EmployeeID", result.data._id);
        localStorage.setItem("EmployeeCode", btoa(result.data.EmployeeCode));
        localStorage.setItem("EmployeeName", result.data.EmployeeName);
        localStorage.setItem("role", btoa(result.data.role));
        localStorage.setItem("departmentId", result.data.departmentId);
        localStorage.setItem("unitId", result.data.unitId);
        
        // Handle Remember Me
        localStorage.setItem("rememberMe", rememberMe.toString());
        if (rememberMe) {
          localStorage.setItem("EmployeeName_saved", btoa(result.data.EmployeeCode));
          localStorage.setItem("password_saved", btoa(password));
        } else {
          localStorage.removeItem('EmployeeName_saved');
          localStorage.removeItem('password_saved');
        }
        
        setUser(result.data);
        setIsLoading(false);
        return result.message;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Login Error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
    // Optional: window.location.href = '/login'; // Force redirect if needed
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    // --- NEW: Explicit isUserAuthenticated helper ---
    isAuthenticated: !!user, 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};