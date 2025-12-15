import React, { useState,useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Building2,
  Phone,
  PhoneCall,
  GitBranch,
  MessageSquare,
  CheckSquare,
  Workflow,
  BarChart3,
  Settings,
  UserCircle,
  Sparkles,
  MapPin,
  PersonStanding,
  ClipboardList,
  Shield,
  ChevronDown,
  LandPlot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { apiRequest } from '@/components/CustomComponents/apiRequest'
import { config } from '@/components/CustomComponents/config.js';
const iconMap = {
  LayoutDashboard,
  Users,
  Building2,
  Phone,
  PhoneCall,
  GitBranch,
  MessageSquare,
  CheckSquare,
  Workflow,
  BarChart3,
  Settings,
  UserCircle,
  Sparkles,
  MapPin,
  PersonStanding,
  ClipboardList,
  Shield,
  ChevronDown ,
  LandPlot
};
const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  //  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: PhoneCall, label: 'Dialer', path: '/dialer' },
  { icon: Phone, label: 'Call Logs', path: '/call-logs' },
  { icon: Users, label: 'Leads', path: '/leads' },
  // { icon: UserCircle, label: 'Contacts', path: '/contacts' },
  // { icon: Building2, label: 'Companies', path: '/companies' },
  {
    icon: MapPin,
    label: 'Plots',
    children: [
      { icon:LandPlot, label: 'Plot List', path: '/plots/list' },
      {icon:LandPlot,  label: 'Plot View', path: '/plots/view' }
    ]
  },
  { icon: PersonStanding, label: 'Visitors', path: '/visitors' },

  // { icon: GitBranch, label: 'IVR Flow', path: '/ivr-flow' },
  // { icon: MessageSquare, label: 'Omni-Channel', path: '/omni-channel' },
  // { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  // { icon: Workflow, label: 'Workflows', path: '/workflows' },
  {
    icon: ClipboardList, label: 'Master Forms',
    children: [
      { label: 'Site', path: '/masters/site' },
      { label: 'Unit', path: '/masters/unit' },
      { label: 'State', path: '/masters/state' },
      { label: 'City', path: '/masters/city' },
      { label: 'Employees', path: '/masters/employees' },
      { label: 'Plot Status', path: '/masters/plotStatus' },
      { label: 'Document Type', path: '/masters/Document' }


    ]
  },
  // { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  // { icon: Users, label: 'Users', path: '/users' },
  { icon: ClipboardList, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  {
    icon: Shield, label: 'Admin Panel',
    children: [
      { label: 'Menu Registry', path: '/adminpanel/menu' },
      { label: 'Role', path: '/masters/rolepages' }

      // { label: 'user Rights', path: '/adminpanel/rights' },
      // { label: 'Transfer', path: '/adminpanel/transfer' },
    ]
  },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();

  const toggleMenu = (label) => {
    if (!isOpen) setIsOpen(true);
    setOpenMenu(openMenu === label ? null : label);
  };

  const isPathActive = (path) => location.pathname === path;
  const isParentActive = (children) => children.some(child => isPathActive(child.path));
    const { user } = useAuth();
  const { menuPermissions } = useData();
  const [MENU,SETMENU]=useState([])
  useEffect(()=>{
    getAllMenus()
  },[])
const getAllMenus = async () => {
  try {
    // const response = await apiRequest("Menu/getFormattedMenu", {
    //   method: 'POST',
    //   body: JSON.stringify({}),
    // });
    let url = config.Api + "Menu/getFormattedMenu"; 
          const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
          if (!response.ok) throw new Error('Failed to get Menus');
          const result = await response.json();
          const data = result.data || result; 
    SETMENU(data)
  } catch (error) {
    console.error("Failed to fetch menus", error);
    return {};
  }
};
  const hasAccess = (path) => {
    const userRole = user.role;
    if (userRole === 'Super Admin') return true;
    const rolePermissions = menuPermissions[userRole];
    // const rolePermissions = ['*'];
    if (!rolePermissions) return false;
    if (rolePermissions.includes('*')) return true;
    
    return rolePermissions.some(p => path===p);
  };

  const filteredMenuItems = MENU.map(item => {
    // const filteredMenuItems = ALL_MENU_ITEMS.map(item => {
    if (user.role === 'Super Admin') return item;
    
    if (item.subItems.length > 0) {
      const accessibleSubItems = item.subItems.filter(sub => hasAccess(sub.path));
      if (accessibleSubItems.length > 0) {
        return { ...item, subItems: accessibleSubItems };
      }
      return null;
    }
    return hasAccess(item.path) ? item : null;
  }).filter(Boolean);
  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? (window.innerWidth < 768 ? 220 : 280) : 80 }}
      transition={{ duration: 0.3 }}
      className="bg-black/20 backdrop-filter backdrop-blur-lg border-r border-purple-700/50 flex flex-col"
    >
      <div className="p-6 border-b border-purple-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="font-bold text-xl text-white text-glow hidden md:block">ENIS CRM</h2>
            </motion.div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
        {filteredMenuItems.sort((a, b) => {
    const numA = +a.id.match(/\d+/)[0]; 
    const numB = +b.id.match(/\d+/)[0];
    return numA - numB;
  })
  .map((item) => {
     let Icon = iconMap[item.icon] || CheckSquare
          if (item.subItems.length > 0) {
            // Render Parent with Submenu
            const isActive = isParentActive(item.subItems);
            const isOpenMenu = openMenu === item.label;
           

            return (
              <div key={item.label} className="space-y-1">
                <div
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative cursor-pointer group',
                    isActive
                      ? 'bg-fuchsia-600/80 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-purple-700/50'
                  )}
                >
                  {isActive && <motion.div layoutId="active-nav" className="absolute inset-0 bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-lg opacity-70" />}

                  <div className="relative z-10 flex items-center gap-3 w-full">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center justify-between w-full"
                      >
                        <span className="font-medium">{item.label}</span>
                        <ChevronDown
                          className={cn("w-4 h-4 transition-transform duration-200", isOpenMenu ? "rotate-180" : "")}
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isOpen && isOpenMenu && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden ml-4 border-l-2 border-purple-700/30 pl-2 space-y-1"
                    >
                      {item.subItems.map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm',
                              isActive
                                ? 'text-white font-medium bg-white/10'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            )
                          }
                        >
                          {subItem.label}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          // Render Standard Menu Item
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative',
                  isActive
                    ? 'bg-fuchsia-600/80 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-purple-700/50'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <motion.div layoutId="active-nav" className="absolute inset-0 bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-lg opacity-70" />}
                  <div className="relative z-10 flex items-center gap-3">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </motion.aside>
  );
}