
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      login(email, password);
      toast({
        title: "Login Successful",
        description: "Welcome to your upgraded CRM!",
      });
      navigate('/');
    } else {
      toast({
        title: "Error",
        description: "Please enter email and password",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - ENIS CRM</title>
        <meta name="description" content="Login to access your ENIS CRM dashboard and manage your business operations." />
      </Helmet>
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#1b0a2c] via-[#2a133b] to-[#3a1b4a] p-4 overflow-hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="w-full max-w-md relative"
        >
          <div className="absolute -top-16 -left-16 w-72 h-72 bg-fuchsia-500 rounded-full mix-blend-soft-light filter blur-2xl opacity-40 animate-blob"></div>
          <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-pink-500 rounded-full mix-blend-soft-light filter blur-2xl opacity-40 animate-blob animation-delay-4000"></div>
          
          <div className="glass-card rounded-2xl shadow-2xl p-8 space-y-6 z-10 relative">
            <div className="text-center space-y-2">
              <div className="flex justify-center items-center gap-2 mb-4">
                <Sparkles className="w-10 h-10 text-fuchsia-400 text-glow" />
                <h1 className="text-4xl font-bold text-white text-glow tracking-tight">ENIS CRM</h1>
              </div>
              <p className="text-white">Unlock your business potential</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-fuchsia-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white placeholder:text-purple-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-fuchsia-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-purple-900/50 border-fuchsia-700 text-white placeholder:text-purple-200"
                  />
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold" size="lg">
                  <LogIn className="mr-2 h-5 w-5"/>
                  Secure Sign In
                </Button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
}
