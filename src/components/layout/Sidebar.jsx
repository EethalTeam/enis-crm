
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Building2,
  Phone,
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
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Leads', path: '/leads' },
  { icon: UserCircle, label: 'Contacts', path: '/contacts' },
  { icon: Building2, label: 'Companies', path: '/companies' },
  { icon: MapPin, label: 'Plots', path: '/plots' },
  { icon: PersonStanding, label: 'Visitors', path: '/visitors' },
  { icon: Phone, label: 'Call Logs', path: '/call-logs' },
  { icon: GitBranch, label: 'IVR Flow', path: '/ivr-flow' },
  { icon: MessageSquare, label: 'Omni-Channel', path: '/omni-channel' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Workflow, label: 'Workflows', path: '/workflows' },
  { icon: ClipboardList, label: 'Master Forms', path: '/master-forms' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Users, label: 'Users', path: '/users' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: Shield, label: 'Admin Panel', path: '/admin-panel' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 256 : 80 }}
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
              <h2 className="font-bold text-xl text-white text-glow">ENIS CRM</h2>
            </motion.div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
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
                    <item.icon className="w-5 h-5 flex-shrink-0" />
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
        ))}
      </nav>
    </motion.aside>
  );
}
