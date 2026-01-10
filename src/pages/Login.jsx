import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, Sparkles, Loader2 } from "lucide-react";
import logo from "../Assets/Images/LOGO-final.png";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import Footer from "../components/layout/Footer";
// Context
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  // const [rememberMe, setRememberMe] = useState(false);

  // const navigate = useNavigate();
  // const { login, isLoading } = useAuth();
  // const { toast } = useToast();

  // // --- Effect: Check for "Remember Me" credentials on mount ---
  // useEffect(() => {
  //   const savedUsername = localStorage.getItem('EmployeeName_saved');
  //   const savedPassword = localStorage.getItem('password_saved');
  //   const isRemembered = localStorage.getItem('rememberMe') === 'true';

  //   if (isRemembered && savedUsername && savedPassword) {
  //     try {
  //       // Use atob() to decode base64
  //       setEmail(atob(savedUsername));
  //       setPassword(atob(savedPassword));
  //       setRememberMe(true);
  //     } catch (error) {
  //       console.error("Decoding error:", error);
  //       localStorage.removeItem('EmployeeName_saved');
  //       localStorage.removeItem('password_saved');
  //     }
  //   }
  // }, []);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!email || !password) {
  //     toast({
  //       title: "Error",
  //       description: "Please enter email and password",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   try {
  //     // 1. Call the API
  //     const successMessage = await login(email, password, rememberMe);

  //     // 2. Show Success Message
  //     toast({
  //       title: "Login Successful",
  //       description: successMessage || "Welcome back!",
  //     });

  //     // 3. Navigate (Only happens if login doesn't throw error)
  //     navigate('/dashboard');

  //   } catch (error) {
  //     // 4. Handle Errors
  //     toast({
  //       title: "Login Failed",
  //       description: error.message || "An error occurred",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const [EmployeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const savedCode = localStorage.getItem("EmployeeCode_saved");
    const savedPassword = localStorage.getItem("password_saved");
    const isRemembered = localStorage.getItem("rememberMe") === "true";

    if (isRemembered && savedCode && savedPassword) {
      try {
        setEmployeeCode(atob(savedCode));
        setPassword(atob(savedPassword));
        setRememberMe(true);
      } catch (error) {
        localStorage.removeItem("EmployeeCode_saved");
        localStorage.removeItem("password_saved");
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!EmployeeCode || !password) {
      toast({
        title: "Error",
        description: "Please enter employee code and password",
        variant: "destructive",
      });
      return;
    }

    try {
      const successMessage = await login(EmployeeCode, password, rememberMe);

      toast({
        title: "Login Successful",
        description: successMessage || "Welcome back!",
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        {/* <title>Login - ENIS CRM</title> */}
        <title>Login - ARVAT</title>

        <meta
          name="description"
          content="Login to access your ENIS CRM dashboard."
        />
      </Helmet>
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#1b0a2c] via-[#2a133b] to-[#3a1b4a] p-4 overflow-hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="w-full max-w-md relative"
        >
          {/* Background Glow Blobs */}
          <div className="absolute -top-16 -left-16 w-72 h-72 bg-fuchsia-500 rounded-full mix-blend-soft-light filter blur-2xl opacity-40 animate-blob"></div>
          <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-pink-500 rounded-full mix-blend-soft-light filter blur-2xl opacity-40 animate-blob animation-delay-4000"></div>

          <div className="glass-card rounded-2xl shadow-2xl p-8 space-y-6 z-10 relative">
            <div className="text-center space-y-2">
              <div className="flex justify-center items-center gap-2 mb-4">
                {/* <Sparkles className="w-10 h-10 text-fuchsia-400 text-glow" />
                <h1 className="text-4xl font-bold text-white text-glow tracking-tight">ENIS CRM</h1> */}
                <div className="w-20 h-10  rounded-lg flex items-center justify-center">
                  {/* <Sparkles className="w-6 h-6 text-white" /> */}
                  <img src={logo} />
                </div>
                {/* <h1 className="text-4xl font-bold text-white text-glow tracking-tight">ARAVAT</h1> */}
              </div>
              <p className="text-white">Unlock your business potential</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  User Name
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-fuchsia-400" />
                  <Input
                    id="EmployeeCode"
                    type="text"
                    placeholder="Enter username"
                    value={EmployeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white placeholder:text-purple-200"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-fuchsia-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white placeholder:text-purple-200"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                  className="border-fuchsia-700 data-[state=checked]:bg-fuchsia-600 data-[state=checked]:text-white"
                  disabled={isLoading}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember Me
                </Label>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full mb-6 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Secure Sign In
                    </>
                  )}
                </Button>
              </motion.div>
              
             

            </form>
        
          </div>
               <div className="flex justify-center  px-4 py-2 rounded-md">
                <span className="flex items-center gap-2 text-xs md:text-sm text-slate-300">
                  © {new Date().getFullYear()} Arvat | Developed by
                  <a
                    href="https://eethalnaditsolutions.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fuchsia-400 hover:text-fuchsia-300 font-semibold"
                  >
                    ENIS
                  </a>
                </span>
              </div>
        </motion.div>
      </div>
    </>
  );
}
