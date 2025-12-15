//  import React, { createContext, useContext, useState, useEffect } from 'react';
// import { config } from '@/components/CustomComponents/config.js';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // ------------------ RESTORE SESSION ON REFRESH -------------------
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const employeeName = localStorage.getItem("EmployeeName");
//     const storedRole = localStorage.getItem("role");


//     if (token && employeeName && storedRole) {
//       const decodedRole = atob(storedRole);

//       setUser({
//         token,
//         EmployeeName: employeeName,
//         EmployeeID: localStorage.getItem("EmployeeID"),
//         role: decodedRole,
//         departmentId: localStorage.getItem("departmentId"),
//         unitId: localStorage.getItem("unitId")
//       });
//     }



//     setIsLoading(false);
//   }, []);

//   // ----------------------- LOGIN -----------------------
//   const login = async (email, password, rememberMe) => {
//     setIsLoading(true);

//     try {
//       const url = config.Api + "Auth/login";

//       const response = await fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ EmployeeCode: email, password }),
//       });

//       if (!response.ok) {
//         const err = await response.json();
//         throw new Error(err?.message || "Login failed");
//       }

//       const result = await response.json();

//       if (!result.data) throw new Error("Invalid response");

//       // SAVE IN LOCALSTORAGE
//       localStorage.setItem("token", result.data.token);
//       localStorage.setItem("EmployeeID", result.data._id);
//       localStorage.setItem("EmployeeCode", btoa(result.data.EmployeeCode));
//       localStorage.setItem("EmployeeName", result.data.EmployeeName);

//       // 🔥 FIXED: SAVE PROPER ROLE
//       localStorage.setItem("role", btoa(result.data.RoleName));

//       localStorage.setItem("departmentId", result.data.departmentId || "");
//       localStorage.setItem("unitId", result.data.unitId || "");

//       // REMEMBER ME
//       localStorage.setItem("rememberMe", rememberMe.toString());
//       if (rememberMe) {
//         localStorage.setItem("EmployeeName_saved", btoa(result.data.EmployeeCode));
//         localStorage.setItem("password_saved", btoa(password));
//       } else {
//         localStorage.removeItem("EmployeeName_saved");
//         localStorage.removeItem("password_saved");
//       }

//       // SET USER
//       setUser({
//         ...result.data,
//         role: result.data.RoleName
//       });

//       setIsLoading(false);
//       return result.message;

//     } catch (err) {
//       setIsLoading(false);
//       throw err;
//     }
//   };

//   // ----------------------- LOGOUT -----------------------
//   const logout = () => {
//     setUser(null);
//     localStorage.clear();
//   };

//   // ---------------- FETCH PERMISSIONS ------------------
//   const getPermissionsByPath = async (path) => {
//     if (!user) return null;

//     const storedRole = localStorage.getItem("role");
//     const RoleName = storedRole ? atob(storedRole).trim() : null;

//     if (!RoleName) return null;

//     try {
//       const url = config.Api + "RoleBased/getPermissionsByPath";

//       const res = await fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ RoleName, path }),
//       });

//       const result = await res.json();

//       if (result.success) {
//         return result.permissions;
//       }

//       return null;
//     } catch (err) {
//       console.error("Permission Error:", err);
//       return null;
//     }
//   };

//   // ------------------- CONTEXT VALUE -------------------
//   const value = {
//     user,
//     isLoading,
//     login,
//     logout,
//     isAuthenticated: !!user,
//     getPermissionsByPath,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);









import React, { createContext, useContext, useState, useEffect } from "react";
import { config } from "@/components/CustomComponents/config";
import { toast } from "@/components/ui/use-toast";

const AuthContext = createContext();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ------------------ RESTORE USER ON REFRESH ------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const EmployeeCode = localStorage.getItem("EmployeeCode");
    const EmployeeName = localStorage.getItem("EmployeeName");
    const role = localStorage.getItem("role");

    if (token && EmployeeCode && EmployeeName && role) {
      setUser({
        token,
        EmployeeCode,
        EmployeeName,
        role,
      });
    }

    setIsLoading(false);
  }, []);

  // ------------------------- LOGIN -------------------------
  const login = async (EmployeeCode, password) => {
    try {
      setIsLoading(true);

      const url = config.Api + "Employee/loginEmployee";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeCode, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Login Failed",
          description: result.message || "Invalid Credentials",
          variant: "destructive",
        });
        throw new Error(result.message);
      }

      // SAVE DATA
      localStorage.setItem("token", result.token);
      localStorage.setItem("EmployeeCode", result.employee.EmployeeCode);
      localStorage.setItem("EmployeeName", result.employee.EmployeeName);
      localStorage.setItem("role", result.employee.role);

      const userData = {
        token: result.token,
        EmployeeCode: result.employee.EmployeeCode,
        EmployeeName: result.employee.EmployeeName,
        role: result.employee.role,
      };

      setUser(userData);

      toast({
        title: "Login Successful",
        description: `Welcome ${result.employee.EmployeeName}`,
      });

      return  result.employee.EmployeeName;

    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------- LOGOUT -------------------------
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  // ---------------- FETCH PERMISSIONS (PHYSIO STYLE) ------------------
  const getPermissionsByPath = async (path) => {
    try {
      const roleName = localStorage.getItem("role");

      if (!roleName) return null;

      const res = await fetch(config.Api + "RoleBased/getPermissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ RoleName: roleName, path }),
      });

      const result = await res.json();
      return result.success ? result.permissions : null;

    } catch (err) {
      console.error("Permission Error:", err);
      return null;
    }
  };

  return (
    <AuthContext.Provider value=
      {{
        user,
        isLoading,
        login,
        logout,
        getPermissionsByPath
      }}>
      {children}
    </AuthContext.Provider>
  );
};

// export const useAuth = () => useContext(AuthContext);

