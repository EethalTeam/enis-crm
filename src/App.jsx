
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Leads from '@/pages/Leads';
import Contacts from '@/pages/Contacts';
import Companies from '@/pages/Companies';
import CallLogs from '@/pages/CallLogs';
import IVRFlow from '@/pages/IVRFlow';
import OmniChannel from '@/pages/OmniChannel';
import Tasks from '@/pages/Tasks';
import Workflows from '@/pages/Workflows';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import Users from '@/pages/Users';
import Plots from '@/pages/Plots';
import Visitors from '@/pages/Visitors';
import MasterForms from '@/pages/MasterForms';
import AdminPanel from '@/pages/AdminPanel';
import MainLayout from '@/components/layout/MainLayout';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Helmet>
        <title>ENIS CRM - Complete Business Management Solution</title>
        <meta name="description" content="ENIS CRM: Industry-neutral platform with IVR, omni-channel communication, automation, and analytics for ultimate business growth." />
      </Helmet>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="companies" element={<Companies />} />
            <Route path="call-logs" element={<CallLogs />} />
            <Route path="ivr-flow" element={<IVRFlow />} />
            <Route path="omni-channel" element={<OmniChannel />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="workflows" element={<Workflows />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
            <Route path="plots" element={<Plots />} />
            <Route path="visitors" element={<Visitors />} />
            <Route path="master-forms" element={<MasterForms />} />
            <Route path="admin-panel" element={<AdminPanel />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
