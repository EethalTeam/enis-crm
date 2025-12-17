
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
import Reports from '@/pages/Reports';
import PlotList from '@/pages/PlotList'
import PlotView from '@/pages/PlotView'
import Visitors from '@/pages/Visitors';
import Unit from '@/pages/Unit'
import Site from '@/pages/Site'
import Dialer from '@/pages/TeleCMIDialer'
import MasterForms from '@/pages/MasterForms';
import AdminPanel from '@/pages/AdminPanel';
import MainLayout from '@/components/layout/MainLayout';
import Employees  from '@/pages/Employees';
import Rolepages from '@/pages/Rolepages';
import Document from '@/pages/Document';
import State from '@/pages/State'
import City from '@/pages/City'
import Country from '@/pages/Country'
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import MenuRegistry from '@/pages/MenuRegistry';
import LeadSource from '@/pages/LeadSource';
import LeadStatus from '@/pages/LeadStatus'

function PrivateRoute({ children }) {
   const token = localStorage.getItem('token');
      const employeeName = localStorage.getItem('EmployeeName');
      
  return (token && employeeName) ? children : <Navigate to="/login" />;

}

function App() {
  return (
    <AuthProvider>
       <DataProvider>
      <Helmet>
        <title>ENIS CRM - Complete Business Management Solution</title>
        <meta name="description" content="ENIS CRM: Industry-neutral platform with IVR, omni-channel communication, automation, and analytics for ultimate business growth." />
      </Helmet>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route path="/dashboard"  element={<Dashboard />} />
             <Route path="/"  element={<Dashboard />} />
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
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="/plots/list" element={<PlotList />} />
            <Route path="/plots/view" element={<PlotView />} />
            <Route path="visitors" element={<Visitors />} />
            <Route path="/masters/unit" element={<Unit />} />
            <Route path="/masters/site" element={<Site />} />
            <Route path="/dialer" element={<Dialer />} />
            <Route path="master-forms" element={<MasterForms />} />
            <Route path="admin-panel" element={<AdminPanel />} />
            <Route path="/masters/employees" element={<Employees />} />
            <Route path="/masters/rolepages" element={<Rolepages />} />
            <Route path="/adminpanel/menu" element={<MenuRegistry />} />
            <Route path="/masters/Document" element={<Document />} />
            <Route path="/masters/state" element={<State />} />
            <Route path="/masters/city" element={<City />} />
            <Route path="/masters/country" element={<Country />} />
            <Route path="/masters/leadstatus" element={<LeadStatus />} />
            <Route path="/masters/leadsource" element={<LeadSource />} />
            
          </Route>
        </Routes>
      </Router>
      <Toaster />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
